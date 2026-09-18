import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  Target, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Flame, 
  Plus, 
  Clock, 
  TrendingUp,
  Brain,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NextActionBanner from '../components/recommendations/NextActionBanner';
import SpaceCard from '../components/spaces/SpaceCard';
import ProjectCard from '../components/projects/ProjectCard';
import ProgressBar from '../components/common/ProgressBar';
import CreateSpaceModal from '../components/spaces/CreateSpaceModal';
import CreateProjectModal from '../components/projects/CreateProjectModal';

export default function HomePage({ onNavigateToSpace, onNavigateToProject, onNavigateToPage }) {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, [currentUser]);

  async function loadHomeData() {
    try {
      setLoading(true);
      const [analyticsRes, spacesRes, projectsRes, recsRes] = await Promise.all([
        api.getGlobalAnalytics(),
        api.getSpaces(),
        api.getProjects(),
        api.getGlobalRecommendations()
      ]);

      setAnalytics(analyticsRes);
      setSpaces(spacesRes.spaces || []);
      setProjects(projectsRes.projects || []);
      setRecommendations(recsRes.recommendations || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismissRecommendation(id) {
    try {
      await api.dismissRecommendation(id);
      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function handleTriggerAction(rec) {
    if (rec.projectId) {
      onNavigateToProject(rec.projectId, rec.actionType);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">
        Loading personalized learning dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Learning & Growth Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Welcome back, {currentUser?.name || 'Learner'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Where was I, how am I doing, and what should I do next?
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSpaceModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-xs font-semibold border border-white/10 hover:border-brand-500/40 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Space</span>
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* "What Should I Do Next?" Recommendation Hero Banner */}
      <NextActionBanner
        recommendations={recommendations}
        onTriggerAction={handleTriggerAction}
        onDismiss={handleDismissRecommendation}
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Mastery</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics?.metrics?.averageMastery || 0}%
          </div>
          <ProgressBar value={analytics?.metrics?.averageMastery || 0} colorScheme="mastery" height="h-1.5" />
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics?.metrics?.studyStreakDays || 7} Days
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">🔥 Active daily streak</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Spaces & Projects</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics?.metrics?.totalSpaces || 0} / {analytics?.metrics?.totalProjects || 0}
          </div>
          <div className="text-[11px] text-slate-400">Isolated learning contexts</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quizzes Evaluated</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics?.metrics?.quizzesTaken || 0}
          </div>
          <div className="text-[11px] text-slate-400">Grounded AI grading</div>
        </div>
      </div>

      {/* Recent Spaces */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Your Learning Spaces</h2>
            <p className="text-xs text-slate-400">Broad areas of exploration and skill growth</p>
          </div>
          <button
            onClick={() => onNavigateToPage('spaces')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
          >
            <span>View All Spaces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {spaces.slice(0, 3).map(space => (
            <SpaceCard
              key={space.id}
              space={space}
              onSelect={() => onNavigateToSpace(space.id)}
            />
          ))}
        </div>
      </div>

      {/* Recent Focused Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Active Learning Projects</h2>
            <p className="text-xs text-slate-400">Targeted journeys with grounded materials and AI tutoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.slice(0, 3).map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => onNavigateToProject(project.id)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateSpaceModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        onCreated={() => loadHomeData()}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        spaces={spaces}
        onClose={() => setIsProjectModalOpen(false)}
        onCreated={() => loadHomeData()}
      />
    </div>
  );
}
