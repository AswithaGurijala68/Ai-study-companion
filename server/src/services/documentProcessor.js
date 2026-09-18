const fs = require('fs');
const path = require('path');
const db = require('../db/database');
const backgroundQueue = require('./backgroundQueue');
const eventBus = require('./eventBus');
const { JOB_STATUS } = require('../config/constants');
const { PDFParse } = require('pdf-parse');

class DocumentProcessor {
  constructor() {
    backgroundQueue.registerHandler('DOCUMENT_PROCESSING', this.processDocumentJob.bind(this));
  }

  async processDocumentJob(job, updateProgress) {
    const materialId = job.entityId;
    const material = db.findById('materials', materialId);
    if (!material) throw new Error(`Material ${materialId} not found`);

    try {
      updateProgress(15, `Step 1/4: Parsing file structure and extracting page-aware text...`);
      db.update('materials', materialId, { status: JOB_STATUS.PROCESSING, progress: 15, errorMessage: null });
      await new Promise(r => setTimeout(r, 200));

      const filePath = material.filePath || (job.payload && job.payload.filePath);
      const rawTextOverride = job.payload && job.payload.rawText;
      
      let pages = [];
      let totalPageCount = 1;

      if (filePath && fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const fileBuffer = fs.readFileSync(filePath);

        if (ext === '.pdf' || material.fileType === 'application/pdf') {
          // Robust page-aware PDF extraction via PDFParse
          try {
            const parser = new PDFParse({ data: fileBuffer });
            await parser.load();
            const textResult = await parser.getText();
            await parser.destroy();

            if (textResult && textResult.pages && textResult.pages.length > 0) {
              totalPageCount = textResult.total || textResult.pages.length;
              pages = textResult.pages.map((p, idx) => ({
                pageNumber: p.num || idx + 1,
                text: (p.text || '').replace(/\r\n/g, '\n').trim()
              })).filter(p => p.text.length > 0);
            }

            // Fallback if pages was empty (e.g. scanned/sparse PDF)
            if (pages.length === 0) {
              const fullText = (textResult?.text || '').trim();
              if (fullText.length > 20) {
                pages.push({ pageNumber: 1, text: fullText });
              }
            }
          } catch (pdfErr) {
            console.warn(`Native PDFParse failed on ${filePath} (${pdfErr.message}), attempting stream text fallback...`);
            // Stream text extraction fallback
            const bufferStr = fileBuffer.toString('binary');
            const streamMatches = bufferStr.match(/\(([^)]+)\)\s*Tj/g) || [];
            const extractedText = streamMatches.map(m => m.replace(/^\(|\)\s*Tj$/g, '')).join(' ').trim();
            if (extractedText.length > 30) {
              pages.push({ pageNumber: 1, text: extractedText });
            } else {
              throw new Error(`Unable to extract text from PDF: ${pdfErr.message}. Ensure the file contains selectable digital text.`);
            }
          }
        } else {
          // Plain text / Markdown / Source code / CSV / JSON
          const fileContent = fs.readFileSync(filePath, 'utf8').trim();
          if (fileContent.length > 0) {
            pages = this.splitTextIntoPages(fileContent);
            totalPageCount = pages.length;
          }
        }
      } else if (rawTextOverride && rawTextOverride.trim().length > 0) {
        pages = this.splitTextIntoPages(rawTextOverride.trim());
        totalPageCount = pages.length;
      } else if (material.summary && material.summary.trim().length > 20) {
        pages = this.splitTextIntoPages(material.summary.trim());
        totalPageCount = pages.length;
      }

      // Check if any valid text was extracted
      if (pages.length === 0 || pages.every(p => p.text.length < 15)) {
        throw new Error(`Document content is empty or contains no readable text. If this is a scanned image, please upload an OCR-processed or text-based PDF.`);
      }

      updateProgress(45, `Step 2/4: Chunking ${pages.length} pages and extracting key concept entities...`);
      db.update('materials', materialId, { status: JOB_STATUS.EXTRACTING, progress: 45 });
      await new Promise(r => setTimeout(r, 200));

      // 1. Create page-aware structured chunks
      const extractedChunks = this.createPageAwareChunks(materialId, material.projectId, pages, material.title);

      if (extractedChunks.length === 0) {
        throw new Error(`Failed to generate chunks from document text.`);
      }

      // 2. Extract multi-word domain concepts from chunks
      const extractedConcepts = this.extractDomainConcepts(material.projectId, extractedChunks, material.title);

      updateProgress(75, `Step 3/4: Indexing ${extractedChunks.length} chunks and building knowledge graph nodes...`);
      db.update('materials', materialId, { status: JOB_STATUS.INDEXING, progress: 75 });
      await new Promise(r => setTimeout(r, 200));

      // Remove any previous chunks for this material before inserting updated chunks
      db.deleteMany('document_chunks', c => c.materialId === materialId);
      db.insertMany('document_chunks', extractedChunks);

      // Register new concepts into concepts and mastery tables if not already present
      for (const concept of extractedConcepts) {
        const existingConcept = db.findOne('concepts', c => 
          c.projectId === material.projectId && 
          c.name.toLowerCase() === concept.name.toLowerCase()
        );
        let conceptId = existingConcept ? existingConcept.id : null;

        if (!existingConcept) {
          const newC = db.insert('concepts', {
            projectId: material.projectId,
            name: concept.name,
            description: concept.description,
            category: concept.category || 'Extracted Concepts',
            importance: concept.importance || 'medium'
          });
          conceptId = newC.id;
        }

        // Initialize concept mastery baseline if not existing
        const existingMastery = db.findOne('concept_mastery', m => 
          m.projectId === material.projectId && 
          m.userId === material.userId && 
          m.conceptId === conceptId
        );
        if (!existingMastery) {
          db.insert('concept_mastery', {
            userId: material.userId,
            projectId: material.projectId,
            conceptId: conceptId,
            conceptName: concept.name,
            score: 50, // Initial neutral baseline
            status: 'Stable',
            evidenceCount: 1,
            lastAssessedAt: new Date().toISOString()
          });
        }
      }

      updateProgress(100, `Step 4/4: Ready for AI Tutor & Adaptive Assessment.`);
      db.update('materials', materialId, {
        status: JOB_STATUS.READY,
        progress: 100,
        pageCount: Math.max(totalPageCount, pages.length),
        chunkCount: extractedChunks.length,
        errorMessage: null
      });

      eventBus.emitEvent({
        userId: material.userId,
        projectId: material.projectId,
        type: 'DOCUMENT_PROCESSED',
        title: 'Material Indexed',
        details: `${material.title} processed (${extractedChunks.length} chunks, ${extractedConcepts.length} concepts indexed across ${pages.length} pages)`
      });

    } catch (err) {
      console.error(`Document processing failed for material ${materialId}:`, err);
      db.update('materials', materialId, {
        status: JOB_STATUS.FAILED,
        progress: 0,
        errorMessage: err.message
      });
      throw err;
    }
  }

  splitTextIntoPages(text) {
    // Split by explicit page markers or estimate ~450 words per page
    if (text.includes('--- Page ') || text.includes('=== Page ')) {
      const pageSections = text.split(/(?:---|===) Page \d+ (?:---|===)/);
      return pageSections.filter(s => s.trim().length > 0).map((s, i) => ({
        pageNumber: i + 1,
        text: s.trim()
      }));
    }

    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const pages = [];
    let currentParagraphs = [];
    let currentWordCount = 0;
    let pageNum = 1;

    for (const p of paragraphs) {
      const words = p.split(/\s+/).length;
      if (currentWordCount + words > 400 && currentParagraphs.length > 0) {
        pages.push({ pageNumber: pageNum++, text: currentParagraphs.join('\n\n') });
        currentParagraphs = [p];
        currentWordCount = words;
      } else {
        currentParagraphs.push(p);
        currentWordCount += words;
      }
    }

    if (currentParagraphs.length > 0) {
      pages.push({ pageNumber: pageNum, text: currentParagraphs.join('\n\n') });
    }

    return pages.length > 0 ? pages : [{ pageNumber: 1, text: text.trim() }];
  }

  createPageAwareChunks(materialId, projectId, pages, docTitle) {
    const chunks = [];
    let chunkSeq = 0;

    for (const page of pages) {
      const pageNumber = page.pageNumber;
      const paragraphs = page.text.split(/\n\s*\n/).filter(p => p.trim().length > 15);

      if (paragraphs.length === 0) {
        if (page.text.trim().length > 0) {
          chunkSeq++;
          chunks.push({
            materialId,
            projectId,
            chunkIndex: chunkSeq,
            pageNumber: pageNumber,
            sectionTitle: `${docTitle.replace(/\.[^/.]+$/, '')} - Page ${pageNumber}`,
            content: page.text.trim(),
            concepts: this.extractKeyphrases(page.text),
            tokenCount: Math.ceil(page.text.length / 3.8)
          });
        }
        continue;
      }

      let currentSection = `Section - Page ${pageNumber}`;

      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i].trim();

        // Check if paragraph is a section header (starts with # or ALL CAPS short title)
        if (p.startsWith('#') || (p === p.toUpperCase() && p.length < 70 && !p.includes('.'))) {
          currentSection = p.replace(/^[#\s]+/, '').trim();
          continue;
        }

        chunkSeq++;
        const concepts = this.extractKeyphrases(p);

        chunks.push({
          materialId,
          projectId,
          chunkIndex: chunkSeq,
          pageNumber: pageNumber,
          sectionTitle: currentSection,
          content: p,
          concepts: concepts,
          tokenCount: Math.ceil(p.length / 3.8)
        });
      }
    }

    return chunks;
  }

  extractKeyphrases(text) {
    // Extract multi-word capitalized phrases and key domain terms
    const phraseRegex = /\b[A-Z][a-zA-Z0-9_-]+(?:\s+[A-Z][a-zA-Z0-9_-]+)*\b/g;
    const matches = text.match(phraseRegex) || [];
    
    const stopKeywords = new Set([
      'The', 'This', 'That', 'These', 'Those', 'With', 'From', 'When', 'What', 
      'How', 'Why', 'There', 'Here', 'Where', 'Which', 'Also', 'However', 'Therefore',
      'Figure', 'Table', 'Page', 'Section', 'Chapter', 'Author', 'In', 'On', 'For'
    ]);

    const filtered = matches.filter(m => {
      const words = m.split(/\s+/);
      return m.length > 3 && !stopKeywords.has(m) && !stopKeywords.has(words[0]);
    });

    return Array.from(new Set(filtered)).slice(0, 4);
  }

  extractDomainConcepts(projectId, chunks, docTitle) {
    const conceptFrequency = new Map();

    for (const chunk of chunks) {
      for (const phrase of chunk.concepts) {
        const count = conceptFrequency.get(phrase) || 0;
        conceptFrequency.set(phrase, count + 1);
      }
    }

    // Sort by occurrence frequency
    const sorted = Array.from(conceptFrequency.entries()).sort((a, b) => b[1] - a[1]);
    const concepts = [];

    for (const [name, freq] of sorted.slice(0, 8)) {
      const matchingChunk = chunks.find(c => c.concepts.includes(name));
      const sectionInfo = matchingChunk ? `Introduced in "${matchingChunk.sectionTitle}" (Page ${matchingChunk.pageNumber}).` : `Core concept from ${docTitle}.`;
      
      concepts.push({
        name,
        description: `Key domain concept: ${name}. ${sectionInfo}`,
        category: 'Document Concepts',
        importance: freq > 2 ? 'high' : 'medium'
      });
    }

    // Ensure at least 1 primary concept exists
    if (concepts.length === 0) {
      const cleanTitle = docTitle.replace(/\.[^/.]+$/, '');
      concepts.push({
        name: cleanTitle,
        description: `Primary subject concept extracted from ${docTitle}.`,
        category: 'Document Concepts',
        importance: 'high'
      });
    }

    return concepts;
  }
}

const documentProcessor = new DocumentProcessor();
module.exports = documentProcessor;
