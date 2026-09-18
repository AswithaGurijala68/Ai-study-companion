import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Brain, Server, Dna, Atom, Code, Sparkles, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ICONS = [
  { name: 'Brain', icon: Brain, label: 'AI & Cognitive' },
  { name: 'Server', icon: Server, label: 'Systems & Cloud' },
  { name: 'Dna', icon: Dna, label: 'Biology & Life' },
  { name: 'Atom', icon: Atom, label: 'Physics & Math' },
  { name: 'Code', icon: Code, label: 'Software Eng' },
  { name: 'Sparkles', icon: Sparkles, label: 'Creative' }
];

const COLORS = [
  { id: 'indigo', name: 'Indigo / Violet', bg: 'bg-indigo-500' },
  { id: 'emerald', name: 'Emerald / Mint', bg: 'bg-emerald-500' },
  { id: 'rose', name: 'Rose / Crimson', bg: 'bg-rose-500' },
  { id: 'cyan', name: 'Cyan / Ocean', bg: 'bg-cyan-500' }
];

export default function CreateSpaceModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Brain');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await api.createSpace({
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        tags
      });

      addToast({
        title: 'Space Created',
        message: `"${name}" is ready for focused learning journeys.`,
        type: 'success'
      });

      setName('');
      setDescription('');
      setTagsInput('');
      onCreated(res.space);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create Learning Space">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Space Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Deep Learning & Neural Architectures"
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Broad learning area goals and topics..."
            className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
          />
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Visual Icon
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ICONS.map(item => {
              const Icon = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => setSelectedIcon(item.name)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-md shadow-brand-500/20'
                      : 'bg-dark-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Accent */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Color Accent
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COLORS.map(c => (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition ${
                  selectedColor === c.id
                    ? 'bg-white/10 border-white/30 text-white font-semibold'
                    : 'bg-dark-900 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                <span>{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="AI, Transformers, Attention, NLP"
            className="w-full px-4 py-2 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition"
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
            disabled={loading || !name.trim()}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Space'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
