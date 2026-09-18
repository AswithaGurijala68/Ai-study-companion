// Determine API Base URL dynamically
const resolveApiBaseUrl = () => {
  // 1. Explicit Vite environment variable
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  // 2. Runtime browser check
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When running locally in dev mode, use relative /api (handled by Vite proxy)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    // When deployed on the Render client domain
    if (hostname.includes('ai-study-companion-client.onrender.com')) {
      return 'https://ai-study-companion-server-ysjy.onrender.com/api';
    }
  }

  // 3. Fallback production backend URL
  return 'https://ai-study-companion-server-ysjy.onrender.com/api';
};

export const BASE_URL = resolveApiBaseUrl();

let authToken = localStorage.getItem('study_auth_token') || '';

export function setAuthToken(token) { 
  authToken = token || ''; 
  if (authToken) localStorage.setItem('study_auth_token', authToken); 
  else localStorage.removeItem('study_auth_token'); 
}

export function clearAuthToken() { setAuthToken(''); }
export function getAuthToken() { return authToken; }

async function request(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  // Don't set Content-Type if uploading FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr) {
    console.error(`Network error reaching ${BASE_URL}${endpoint}:`, netErr);
    throw new Error(
      'Unable to connect to the backend server. If the server is starting up (e.g. Render free tier spin-up), please wait ~30 seconds and try again.'
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorBody.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  getCurrentUser: () => request('/auth/me'),
  listUsers: () => request('/auth/users'),

  // Spaces
  getSpaces: () => request('/spaces'),
  createSpace: (data) => request('/spaces', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSpace: (id) => request(`/spaces/${id}`),
  updateSpace: (id, data) => request(`/spaces/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSpace: (id) => request(`/spaces/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (spaceId) => request(`/projects${spaceId ? `?spaceId=${spaceId}` : ''}`),
  createProject: (data) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getProjectWorkspace: (id) => request(`/projects/${id}/workspace`),
  updateProject: (id, data) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Materials & Async Processing
  getMaterials: (projectId) => request(`/projects/${projectId}/materials`),
  uploadMaterial: (projectId, formData) => request(`/projects/${projectId}/materials`, {
    method: 'POST',
    body: formData
  }),
  getMaterialStatus: (id) => request(`/materials/${id}/status`),
  getMaterialChunks: (id) => request(`/materials/${id}/chunks`),
  retryMaterialProcessing: (id) => request(`/materials/${id}/retry`, { method: 'POST' }),
  deleteMaterial: (id) => request(`/materials/${id}`, { method: 'DELETE' }),

  // AI Tutor & Grounding
  getConversation: (projectId) => request(`/projects/${projectId}/tutor`),
  sendTutorMessage: (projectId, data) => request(`/projects/${projectId}/tutor/message`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  clearConversation: (projectId) => request(`/projects/${projectId}/tutor/clear`, { method: 'DELETE' }),

  // Adaptive Quiz & Assessments
  startAdaptiveQuiz: (projectId, data) => request(`/projects/${projectId}/quiz/adaptive`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getQuiz: (id) => request(`/quiz/${id}`),
  submitAnswer: (questionId, answer) => request(`/quiz/questions/${questionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answer })
  }),
  completeQuiz: (id) => request(`/quiz/${id}/complete`, { method: 'POST' }),
  getProjectQuizzes: (projectId) => request(`/projects/${projectId}/quizzes`),

  // Concept Mastery & Knowledge Tools
  getProjectMastery: (projectId) => request(`/projects/${projectId}/mastery`),
  getConceptHistory: (projectId, conceptId) => request(`/projects/${projectId}/mastery/history${conceptId ? `?conceptId=${conceptId}` : ''}`),
  getKnowledgeGraph: (projectId) => request(`/projects/${projectId}/knowledge-graph`),
  getFlashcards: (projectId) => request(`/projects/${projectId}/flashcards`),
  reviewFlashcard: (id, rating) => request(`/flashcards/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ rating })
  }),
  getRoadmap: (projectId) => request(`/projects/${projectId}/roadmap`),
  updateMilestone: (projectId, milestoneId, status) => request(`/projects/${projectId}/roadmap/milestones/${milestoneId}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  // Recommendations
  getProjectRecommendations: (projectId) => request(`/projects/${projectId}/recommendations`),
  getGlobalRecommendations: () => request('/recommendations/global'),
  dismissRecommendation: (id) => request(`/recommendations/${id}/dismiss`, { method: 'POST' }),

  // Analytics & Activity
  getGlobalAnalytics: () => request('/analytics/global'),
  getProjectAnalytics: (projectId) => request(`/analytics/projects/${projectId}`),
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/events${query ? `?${query}` : ''}`);
  },

  // Admin Dashboard & Observability
  getAdminDashboard: () => request('/admin/dashboard'),
  inspectUserJourney: (userId) => request(`/admin/users/${userId}/journey`),
  getTelemetryLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/telemetry${query ? `?${query}` : ''}`);
  },
  getQueueStatus: () => request('/admin/queue'),
  resetDatabase: () => request('/admin/reset-db', { method: 'POST' }),

  // AI Evaluation Benchmark Suite
  getEvaluations: () => request('/evaluations'),
  runBenchmarks: () => request('/evaluations/run', { method: 'POST' }),

  // AI Configuration
  getAIConfig: () => request('/config/ai'),
  saveAIConfig: (data) => request('/config/ai', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
