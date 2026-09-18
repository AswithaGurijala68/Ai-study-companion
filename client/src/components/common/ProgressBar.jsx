import React from 'react';

export default function ProgressBar({ value = 0, max = 100, height = 'h-2', showLabel = false, colorScheme = 'brand' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let barColor = 'bg-brand-500';
  if (colorScheme === 'mastery') {
    if (percentage >= 75) barColor = 'bg-emerald-500';
    else if (percentage >= 55) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-500';
  } else if (colorScheme === 'emerald') {
    barColor = 'bg-emerald-500';
  } else if (colorScheme === 'purple') {
    barColor = 'bg-purple-500';
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-white">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-dark-900 rounded-full overflow-hidden border border-white/5 ${height}`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
