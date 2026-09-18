const db = require('../db/database');
const retrievalEngine = require('./retrievalEngine');
const aiService = require('./aiService');
const eventBus = require('./eventBus');

class TutorService {
  async respondToUser({ conversationId, projectId, userId, message, allowGeneralKnowledge = false }) {
    // 1. Retrieve project and user context
    const project = db.findById('projects', projectId);
    if (!project) throw new Error('Project not found');

    const masteryRecords = db.find('concept_mastery', m => m.projectId === projectId && m.userId === userId);
    const weakConcepts = masteryRecords.filter(m => m.status === 'Requiring Attention' || m.score < 60);
    const strongConcepts = masteryRecords.filter(m => m.score >= 80);

    // 2. Multi-turn conversation continuity: retrieve recent conversation history
    const recentMessages = db.find('messages', m => m.conversationId === conversationId)
      .slice(-6)
      .map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.content.slice(0, 300)}`)
      .join('\n');

    // 3. Perform project-isolated retrieval
    const retrievalResult = retrievalEngine.search({
      projectId,
      query: message,
      limit: 3
    });

    const isUnsupported = retrievalResult.insufficientEvidence && !allowGeneralKnowledge;
    const isUsingGeneralKnowledge = retrievalResult.insufficientEvidence && allowGeneralKnowledge;

    // 4. Build persistent learner context summary
    const learnerContext = {
      learningGoal: project.learningGoal,
      weakConcepts: weakConcepts.map(c => c.conceptName),
      strongConcepts: strongConcepts.map(c => c.conceptName)
    };

    // 5. Construct System Prompt
    let systemPrompt = `You are an expert, supportive AI Study Companion and personal tutor.
Your current project workspace is "${project.name}".
The student's goal is: "${project.learningGoal}".
Known student weaknesses: ${learnerContext.weakConcepts.join(', ') || 'None identified yet'}.
Known student strengths: ${learnerContext.strongConcepts.join(', ') || 'None identified yet'}.

Core Principles:
1. Context First: Prioritize the student's project materials.
2. Grounded Citations: When using facts from the materials, cite the exact source and page in brackets like [Source: Document Title — Page X].
3. Evidence Over Guessing: If the materials lack sufficient evidence and general AI mode is off, do not invent answers.`;

    let userPrompt = message;
    let feature = 'tutor_chat';

    if (isUnsupported) {
      feature = 'tutor_unsupported_refusal';
      userPrompt = `Student question: "${message}"\n\nNotice: Insufficient evidence in project materials for "${project.name}". Formulate a polite refusal explaining that the uploaded documents do not contain information on this topic, and suggest uploading relevant materials or enabling "General AI Knowledge".`;
    } else if (isUsingGeneralKnowledge) {
      feature = 'tutor_general_knowledge';
      userPrompt = `Student Question: ${message}\n\nRecent Conversation:\n${recentMessages || 'None'}\n\nNotice: The student enabled General AI Knowledge for this query as it was not found in project materials. Provide a thorough, pedagogically structured explanation.`;
    } else if (retrievalResult.chunks.length > 0) {
      const knowledgeContext = retrievalResult.chunks.map((c, i) => 
        `[Document: ${c.materialTitle} | Page ${c.pageNumber} | Section: ${c.sectionTitle}]\n${c.content}`
      ).join('\n\n');

      userPrompt = `Student Question: ${message}\n\nRecent Conversation:\n${recentMessages || 'None'}\n\nRelevant Project Materials:\n${knowledgeContext}\n\nPlease provide a clear, rigorous, and pedagogical response grounded in the materials above. Cite your sources accurately using the format [Source: Document Title — Page X].`;
    }

    // 6. Generate AI Response
    const aiResponse = await aiService.generateText({
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      feature: feature,
      userId: userId,
      projectId: projectId,
      context: {
        isGrounded: !isUnsupported,
        insufficientEvidence: isUnsupported,
        isUsingGeneralKnowledge: isUsingGeneralKnowledge,
        chunks: retrievalResult.chunks,
        query: message,
        projectName: project.name
      }
    });

    // 7. Build citations
    let citations = [];
    if (!isUnsupported && !isUsingGeneralKnowledge && retrievalResult.chunks.length > 0) {
      citations = retrievalResult.chunks.map(chunk => ({
        materialId: chunk.materialId,
        materialTitle: chunk.materialTitle,
        pageNumber: chunk.pageNumber,
        sectionTitle: chunk.sectionTitle,
        snippet: chunk.content.slice(0, 200) + '...'
      }));
    }

    // 8. Store message in database
    const assistantMsg = db.insert('messages', {
      conversationId: conversationId,
      sender: 'assistant',
      content: aiResponse.text,
      citations: citations,
      isGrounded: !isUnsupported,
      insufficientEvidence: isUnsupported,
      isGeneralKnowledge: isUsingGeneralKnowledge,
      latencyMs: aiResponse.telemetry.latencyMs,
      tokenUsage: {
        prompt: aiResponse.telemetry.promptTokens,
        completion: aiResponse.telemetry.completionTokens,
        total: aiResponse.telemetry.totalTokens
      },
      logId: aiResponse.telemetry.logId
    });

    // 9. Record interaction event
    eventBus.emitEvent({
      userId,
      projectId,
      type: 'TUTOR_INTERACTION',
      title: 'Tutor Query',
      details: isUnsupported 
        ? `Tutor refused unsupported question: "${message.slice(0, 45)}..."`
        : isUsingGeneralKnowledge
          ? `Tutor answered using General AI Knowledge: "${message.slice(0, 45)}..."`
          : `Tutor provided grounded response with ${citations.length} citations`
    });

    return assistantMsg;
  }
}

const tutorService = new TutorService();
module.exports = tutorService;
