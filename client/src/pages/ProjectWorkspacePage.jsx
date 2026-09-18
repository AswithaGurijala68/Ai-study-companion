import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Brain, 
  Layers, 
  FileText, 
  Award, 
  BarChart3, 
  Target, 
  UploadCloud, 
  RotateCcw, 
  Play, 
  Network, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/common/ProgressBar';
import DocumentUploader from '../components/materials/DocumentUploader';
import ProcessingStepper from '../components/materials/ProcessingStepper';
import ChunkViewerModal from '../components/materials/ChunkViewerModal';
import PdfReaderModal from '../components/materials/PdfReaderModal';
import TutorChat from '../components/tutor/TutorChat';
import AdaptiveQuizView from '../components/quiz/AdaptiveQuizView';
import ConceptMasteryList from '../components/mastery/ConceptMasteryList';
import KnowledgeGraphView from '../components/mastery/KnowledgeGraphView';
import SpacedRepetitionDeck from '../components/flashcards/SpacedRepetitionDeck';
import StudyRoadmapView from '../components/roadmap/StudyRoadmapView';
import NextActionBanner from '../components/recommendations/NextActionBanner';
import TelemetryUsageCard from '../components/analytics/TelemetryUsageCard';
import ExportReportModal from '../components/projects/ExportReportModal';
import { useToast } from '../context/ToastContext';

export default function ProjectWorkspacePage({ projectId, initialTab = 'overview', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [workspaceData, setWorkspaceData] = useState(null);
  const [projectAnalytics, setProjectAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterialForChunks, setSelectedMaterialForChunks] = useState(null);
  const [selectedMaterialForReader, setSelectedMaterialForReader] = useState(null);
  const [readerInitialPage, setReaderInitialPage] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadWorkspace();
      loadAnalytics();
    }
  }, [projectId]);

  async function loadWorkspace() {
    try {
      setLoading(true);
      const res = await api.getProjectWorkspace(projectId);
      setWorkspaceData(res);
    } catch (err) {
      console.error('Failed to load project workspace:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      const res = await api.getProjectAnalytics(projectId);
      setProjectAnalytics(res);
    } catch (err) {
      console.error('Failed to load project analytics:', err);
    }
  }

  async function handleDismissRecommendation(id) {
    try {
      await api.dismissRecommendation(id);
      loadWorkspace();
    } catch (err) {
      console.error(err);
    }
  }

  function handleTriggerAction(rec) {
    if (rec.actionType === 'start_quiz') {
      setActiveTab('quiz');
    } else if (rec.actionType === 'open_tutor') {
      setActiveTab('tutor');
    } else if (rec.actionType === 'open_material') {
      const mat = workspaceData?.materials?.find(m => m.id === rec.actionPayload?.materialId) || workspaceData?.materials?.[0];
      if (mat) {
        setSelectedMaterialForReader(mat);
        setReaderInitialPage(rec.actionPayload?.pageNumber || 1);
      } else {
        setActiveTab('materials');
      }
    }
  }

  function handleOpenInReader(materialId, pageNumber) {
    const mat = workspaceData?.materials?.find(m => m.id === materialId) || workspaceData?.materials?.[0];
    if (mat) {
      setSelectedMaterialForReader(mat);
      setReaderInitialPage(pageNumber || 1);
    }
  }

  if (loading && !workspaceData) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">Loading project workspace...</div>;
  }

  const project = workspaceData?.project;
  const materials = workspaceData?.materials || [];
  const concepts = workspaceData?.masteryOverview?.concepts || [];
  const recommendations = workspaceData?.recommendations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Space</span>
        </button>

        <span className="text-[11px] font-semibold text-slate-400 bg-dark-900 px-3 py-1 rounded-full border border-white/5">
          {project?.spaceName || 'Learning Space'}
        </span>
      </div>

      {/* Project Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {project?.name}
            </h1>
            <div className="flex items-start gap-2 text-xs text-brand-300">
              <Target className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-400" />
              <span><span className="font-semibold text-white">Learning Goal: </span>{project?.learningGoal}</span>
            </div>
          </div>

          {/* Overall Mastery Meter & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-4 bg-dark-900/80 p-3.5 rounded-2xl border border-white/5">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Concept Mastery</div>
                <div className="text-xl font-black text-white flex items-baseline gap-1">
                  <span>{workspaceData?.masteryOverview?.averageScore || 0}%</span>
                  <span className="text-slate-500 font-normal text-xs">/ {project?.targetMastery || 85}% target</span>
                </div>
              </div>
              <div className="w-24">
                <ProgressBar value={workspaceData?.masteryOverview?.averageScore || 0} colorScheme="mastery" height="h-2" />
              </div>
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-3.5 rounded-2xl bg-dark-900/80 hover:bg-dark-800 text-slate-300 hover:text-white border border-white/5 hover:border-brand-500/40 text-xs font-semibold transition flex items-center gap-1.5"
              title="Export Learning Progress Report"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5 text-xs font-medium no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'materials', label: 'Materials & Knowledge', icon: FileText, count: materials.length },
            { id: 'tutor', label: 'AI Tutor', icon: Sparkles },
            { id: 'quiz', label: 'Adaptive Quiz', icon: Brain },
            { id: 'mastery', label: 'Concept Mastery', icon: Award, count: concepts.length },
            { id: 'graph', label: 'Knowledge Graph', icon: Network },
            { id: 'flashcards', label: 'Flashcards', icon: Layers, count: workspaceData?.flashcardsCount },
            { id: 'roadmap', label: 'Study Roadmap', icon: MapPin },
            { id: 'analytics', label: 'Analytics & Telemetry', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-dark-900 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Action recommendation */}
          <NextActionBanner
            recommendations={recommendations}
            onTriggerAction={handleTriggerAction}
            onDismiss={handleDismissRecommendation}
          />

          {/* Quick Study Launchpad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('tutor')}
              className="glass-card rounded-2xl p-5 border border-white/5 cursor-pointer group hover:border-brand-500/50"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition">Grounded AI Tutor</h4>
              <p className="text-xs text-slate-400 mt-1">Ask questions and explore concepts with verified source citations.</p>
            </div>

            <div
              onClick={() => setActiveTab('quiz')}
              className="glass-card rounded-2xl p-5 border border-white/5 cursor-pointer group hover:border-purple-500/50"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">Adaptive Assessment</h4>
              <p className="text-xs text-slate-400 mt-1">Test your weakest concepts with dynamic questions and AI rubric grading.</p>
            </div>

            <div
              onClick={() => setActiveTab('materials')}
              className="glass-card rounded-2xl p-5 border border-white/5 cursor-pointer group hover:border-emerald-500/50"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">Study Documents</h4>
              <p className="text-xs text-slate-400 mt-1">Manage uploaded PDFs, chunk indexes, and extracted knowledge nodes.</p>
            </div>
          </div>

          {/* Concept Mastery Summary & Recent Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConceptMasteryList
              concepts={concepts}
              onPracticeConcept={(cId) => {
                setActiveTab('quiz');
              }}
            />

            {/* Recent Events Log */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>Recent Project Activity</span>
                </h3>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {workspaceData?.recentEvents?.map(evt => (
                  <div key={evt.id} className="p-3 rounded-xl bg-dark-900/80 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{evt.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{evt.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MATERIALS & KNOWLEDGE */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Uploader */}
          <DocumentUploader
            projectId={projectId}
            onUploaded={() => loadWorkspace()}
          />

          {/* Documents List */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span>Project Learning Materials ({materials.length})</span>
            </h3>

            {materials.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No materials uploaded yet. Upload a PDF or paste notes above.
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-5 rounded-2xl bg-dark-900 border border-white/5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{mat.title}</h4>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{mat.pageCount || 1} Pages</span>
                            <span>•</span>
                            <span>{mat.chunkCount || 5} Chunks</span>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(mat.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => setSelectedMaterialForChunks(mat)}
                          className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-white/5 text-xs font-medium transition"
                        >
                          View Chunks
                        </button>
                        <button
                          onClick={() => setSelectedMaterialForReader(mat)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-medium transition flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Document</span>
                        </button>
                      </div>
                    </div>

                    {/* Processing Pipeline Stepper */}
                    <ProcessingStepper status={mat.status} progress={mat.progress} errorMessage={mat.errorMessage} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: GROUNDED AI TUTOR */}
      {activeTab === 'tutor' && (
        <TutorChat
          projectId={projectId}
          projectGoal={project?.learningGoal}
          onOpenReader={handleOpenInReader}
        />
      )}

      {/* Tab 4: ADAPTIVE QUIZ */}
      {activeTab === 'quiz' && (
        <AdaptiveQuizView
          projectId={projectId}
          concepts={concepts}
          onMasteryUpdated={() => loadWorkspace()}
        />
      )}

      {/* Tab 5: CONCEPT MASTERY & GROWTH */}
      {activeTab === 'mastery' && (
        <ConceptMasteryList
          concepts={concepts}
          onPracticeConcept={(conceptId) => {
            setActiveTab('quiz');
          }}
        />
      )}

      {/* Tab 6: KNOWLEDGE GRAPH */}
      {activeTab === 'graph' && (
        <KnowledgeGraphView
          projectId={projectId}
          onPracticeConcept={(conceptId) => {
            setActiveTab('quiz');
          }}
        />
      )}

      {/* Tab 7: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <SpacedRepetitionDeck projectId={projectId} />
      )}

      {/* Tab 8: STUDY ROADMAP */}
      {activeTab === 'roadmap' && (
        <StudyRoadmapView projectId={projectId} projectGoal={project?.learningGoal} />
      )}

      {/* Tab 9: ANALYTICS & TELEMETRY */}
      {activeTab === 'analytics' && projectAnalytics && (
        <div className="space-y-6">
          <TelemetryUsageCard
            totalTokens={projectAnalytics.aiMetrics?.totalTokens || 0}
            avgLatencyMs={projectAnalytics.aiMetrics?.avgLatencyMs || 0}
            totalCalls={projectAnalytics.aiMetrics?.totalCalls || 0}
            estimatedCostUSD={((projectAnalytics.aiMetrics?.totalTokens || 0) / 1000000) * 0.15}
          />

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white">Quiz Attempts & Performance History</h3>
            <div className="space-y-2">
              {projectAnalytics.quizzes?.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-white/5 text-xs">
                  <div>
                    <div className="font-semibold text-white">{q.title}</div>
                    <div className="text-[10px] text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{q.score}%</div>
                    <div className="text-[10px] text-slate-500">Evaluated Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chunk Viewer Modal */}
      {selectedMaterialForChunks && (
        <ChunkViewerModal
          isOpen={!!selectedMaterialForChunks}
          onClose={() => setSelectedMaterialForChunks(null)}
          material={selectedMaterialForChunks}
        />
      )}

      {/* PDF / Document Reader Modal */}
      {selectedMaterialForReader && (
        <PdfReaderModal
          isOpen={!!selectedMaterialForReader}
          onClose={() => setSelectedMaterialForReader(null)}
          material={selectedMaterialForReader}
          initialPage={readerInitialPage}
          onAskTutor={(prompt) => {
            setActiveTab('tutor');
          }}
        />
      )}

      {/* Export Learning Progress Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        masteryOverview={workspaceData?.masteryOverview}
        roadmap={workspaceData?.roadmap}
        quizzes={workspaceData?.quizzes || []}
      />
    </div>
  );
}
