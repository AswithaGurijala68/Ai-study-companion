import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, File, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function DocumentUploader({ projectId, onUploaded }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'paste'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  function handleFileSelect(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (activeTab === 'file' && !file) return;
    if (activeTab === 'paste' && !textContent.trim()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', title || (file ? file.name : 'Pasted Notes.txt'));

      if (activeTab === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('textContent', textContent);
      }

      const res = await api.uploadMaterial(projectId, formData);

      addToast({
        title: 'Document Uploaded',
        message: 'Async processing and concept extraction started in background.',
        type: 'success'
      });

      setFile(null);
      setTitle('');
      setTextContent('');
      if (onUploaded) onUploaded(res.material);
    } catch (err) {
      addToast({
        title: 'Upload Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-400" />
            <span>Upload Learning Material</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            PDFs, papers, or markdown notes. Processed asynchronously into searchable chunks and concept vectors.
          </p>
        </div>

        <div className="flex bg-dark-900/80 p-1 rounded-xl border border-white/5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'file' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            PDF / File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === 'paste' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Text / Notes
          </button>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Document Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Document Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={file ? file.name : "e.g., Attention Is All You Need Paper.pdf"}
            className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {activeTab === 'file' ? (
          /* Drag & Drop File Zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-brand-500 bg-brand-500/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-white/10 hover:border-brand-500/50 hover:bg-dark-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {file ? (
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</div>
                  <div className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to Process</div>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-400 transition" />
                <div className="text-xs font-semibold text-white">
                  Click to select file or drag & drop here
                </div>
                <div className="text-[11px] text-slate-500">
                  PDF, TXT, or Markdown documents (up to 25MB)
                </div>
              </>
            )}
          </div>
        ) : (
          /* Raw Text Paste Zone */
          <div>
            <textarea
              rows={4}
              required
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste study notes, textbook excerpts, or lecture transcripts here..."
              className="w-full px-4 py-3 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition resize-none font-mono"
            />
          </div>
        )}

        {/* Upload CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || (activeTab === 'file' && !file) || (activeTab === 'paste' && !textContent.trim())}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading & Queueing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
