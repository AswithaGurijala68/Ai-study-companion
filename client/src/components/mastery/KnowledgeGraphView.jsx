import React, { useState, useEffect } from 'react';
import { Network, Sparkles, Play, Info, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../../services/api';

export default function KnowledgeGraphView({ projectId, onPracticeConcept }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadGraph();
    }
  }, [projectId]);

  async function loadGraph() {
    try {
      setLoading(true);
      const res = await api.getKnowledgeGraph(projectId);
      setGraphData(res);
      if (res.nodes?.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load knowledge graph:', err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate dynamic circular coordinates for SVG layout
  const nodeCount = graphData.nodes?.length || 1;
  const centerX = 260;
  const centerY = 200;
  const radius = 130;

  const positionedNodes = graphData.nodes.map((node, i) => {
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { ...node, x, y };
  });

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-400" />
            <span>Interactive Concept Knowledge Map</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual topology of concepts, dependency relationships, and live mastery states.
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Mastered (≥75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">Stable (60-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">Attention (&lt;60%)</span>
          </div>
        </div>
      </div>

      {/* Graph Area & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 relative bg-dark-900/80 rounded-2xl border border-white/5 p-4 flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="text-xs text-slate-400">Generating graph topology...</div>
          ) : (
            <svg viewBox="0 0 520 400" className="w-full h-auto max-w-lg select-none">
              {/* Central Project Hub */}
              <circle
                cx={centerX}
                cy={centerY}
                r="36"
                className="fill-dark-800 stroke-brand-500/40 stroke-2"
              />
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dy="0.3em"
                className="fill-brand-300 text-[11px] font-bold"
              >
                Project Hub
              </text>

              {/* Edge Lines */}
              {positionedNodes.map((node, i) => (
                <g key={`edge-${i}`}>
                  {/* Line from center to node */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Ring lines connecting consecutive nodes */}
                  {i + 1 < positionedNodes.length && (
                    <line
                      x1={node.x}
                      y1={node.y}
                      x2={positionedNodes[i + 1].x}
                      y2={positionedNodes[i + 1].y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              ))}

              {/* Concept Nodes */}
              {positionedNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const strokeColor = node.score >= 75 ? '#22c55e' : node.score >= 60 ? '#eab308' : '#ef4444';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                    transform-origin={`${node.x} ${node.y}`}
                  >
                    {/* Outer Glow Circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 30 : 24}
                      fill={isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(17, 24, 39, 0.8)'}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-300"
                    />

                    {/* Mastery Text inside node */}
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dy="0.35em"
                      className="fill-white text-[10px] font-bold font-mono pointer-events-none"
                    >
                      {node.score}%
                    </text>

                    {/* Label below node */}
                    <text
                      x={node.x}
                      y={node.y + (isSelected ? 42 : 36)}
                      textAnchor="middle"
                      className="fill-slate-300 text-[10px] font-semibold pointer-events-none"
                    >
                      {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Selected Concept Node Inspector */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-white/10 space-y-4">
          {selectedNode ? (
            <>
              <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {selectedNode.category || 'Extracted Concept'}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {selectedNode.name}
                  </h4>
                </div>

                <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  selectedNode.score >= 75
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : selectedNode.score >= 60
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {selectedNode.score}% Mastery
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.description || 'Core concept mapped from project study materials.'}
              </p>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Growth Status:</span>
                  <span className="font-semibold text-white">{selectedNode.status || 'Stable'}</span>
                </div>
              </div>

              {onPracticeConcept && (
                <button
                  onClick={() => onPracticeConcept(selectedNode.id)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Practice This Concept in Quiz</span>
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click any node in the graph to inspect relationships and practice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
