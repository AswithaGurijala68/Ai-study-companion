import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Notification Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          let Icon = Info;
          let borderClass = 'border-blue-500/40 bg-blue-950/80 text-blue-200';
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderClass = 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-amber-500/40 bg-amber-950/80 text-amber-200';
          } else if (toast.type === 'error') {
            Icon = XCircle;
            borderClass = 'border-rose-500/40 bg-rose-950/80 text-rose-200';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up ${borderClass}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold text-white">{toast.title}</div>}
                {toast.message && <div className="text-xs opacity-90 mt-0.5">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
