import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Target, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CreateProjectModal({ isOpen, onClose, spaces = [], defaultSpaceId, onCreated }) {
  const [spaceId, setSpaceId] = useState(defaultSpaceId || (spaces[0]?.id || ''));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [targetMastery, setTargetMastery] = useState(85);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !spaceId) return;

    try {
      setLoading(true);
      const res = await api.createProject({
        spaceId,
        name: name.trim(),
        description: description.trim(),
        learningGoal: learningGoal.trim() || `Master concepts in ${name}`,
        targetMastery: Number(targetMastery)
      });

      addToast({
        title: 'Project Created',
        message: `"${name}" workspace is ready.`,
        type: 'success'
      });

      setName('');
      setDescription('');
      setLearningGoal('');
      onCreated(res.project);
      onClose();
    } catch (err) {
      addToast({
        title: 'Creation Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Learning Project">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Parent Space Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Parent Space *
          </label>
          <select
            required
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 transition"
          >
            <option value="" disabled>Select a Learning Space</option>
            {spaces.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Transformers & Self-Attention Architectures"
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Learning Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Specific Learning Goal *
          </label>
          <textarea
            rows={2}
            required
            value={learningGoal}
            onChange={(e) => setLearningGoal(e.target.value)}
            placeholder="e.g., Master mathematical foundations of scaled dot-product attention and rotary positional embeddings."
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Project Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context, scope, or reference material..."
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
          />
        </div>

        {/* Target Mastery Goal Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Target Mastery Threshold
            </label>
            <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {targetMastery}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="100"
            value={targetMastery}
            onChange={(e) => setTargetMastery(e.target.value)}
            className="w-full accent-brand-500 bg-dark-900 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || !spaceId}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
