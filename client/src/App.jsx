import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const KanbanPage = lazy(() => import('./pages/KanbanPage'));
const AISalesAssistantPage = lazy(() => import('./pages/AISalesAssistantPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent" />
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading AI LeadDesk...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kanban"
          element={
            <ProtectedRoute>
              <KanbanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assistant"
          element={
            <ProtectedRoute>
              <AISalesAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
