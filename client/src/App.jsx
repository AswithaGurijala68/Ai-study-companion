import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import ProjectWorkspacePage from './pages/ProjectWorkspacePage';
import GlobalAnalyticsPage from './pages/GlobalAnalyticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('proj-transformers');
  const [workspaceTab, setWorkspaceTab] = useState('overview');

  if (loading) return <div className="min-h-screen bg-[#080c14] text-slate-300 flex items-center justify-center">Loading StudyFlow…</div>;
  if (!currentUser) return <LoginPage />;

  function handleNavigateToSpace(spaceId) { setSelectedSpaceId(spaceId); setActivePage('space-detail'); }
  function handleNavigateToProject(projectId, targetTab = 'overview') {
    setSelectedProjectId(projectId);
    setWorkspaceTab(targetTab === 'start_quiz' ? 'quiz' : targetTab === 'open_tutor' ? 'tutor' : 'overview');
    setActivePage('project-workspace');
  }

  return <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 font-sans">
    <Navbar activePage={activePage} setActivePage={setActivePage} />
    <main className="flex-1 pb-16">
      {activePage === 'home' && <HomePage onNavigateToSpace={handleNavigateToSpace} onNavigateToProject={handleNavigateToProject} onNavigateToPage={setActivePage} />}
      {activePage === 'spaces' && <SpacesPage onNavigateToSpace={handleNavigateToSpace} />}
      {activePage === 'space-detail' && <SpaceDetailPage spaceId={selectedSpaceId} onBack={() => setActivePage('spaces')} onNavigateToProject={handleNavigateToProject} />}
      {activePage === 'project-workspace' && <ProjectWorkspacePage projectId={selectedProjectId} initialTab={workspaceTab} onBack={() => setActivePage('spaces')} />}
      {activePage === 'analytics' && <GlobalAnalyticsPage />}
      {activePage === 'admin' && <AdminDashboardPage />}
      {activePage === 'settings' && <SettingsPage />}
    </main>
    <footer className="border-t border-white/5 py-6 bg-dark-900/60 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>StudyFlow AI • Persistent, Contextual, Measurable AI Learning Companion</div>
        <div className="flex items-center gap-4 text-slate-400"><button onClick={() => setActivePage('settings')} className="hover:text-white transition">Settings</button><button onClick={() => setActivePage('admin')} className="hover:text-white transition">Observability</button><button onClick={() => setActivePage('analytics')} className="hover:text-white transition">Telemetry</button></div>
      </div>
    </footer>
  </div>;
}

export default function App() { return <AuthProvider><ToastProvider><AppContent /></ToastProvider></AuthProvider>; }
