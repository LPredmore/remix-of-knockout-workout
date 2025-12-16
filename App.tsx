import React, { PropsWithChildren } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SessionPage from './pages/Session';
import Progress from './pages/Progress';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Routines from './pages/Routines';
import RoutineDetail from './pages/RoutineDetail';

const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-brand-900 text-slate-50">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;
  
  // If user is logged in but not onboarded, and not currently on onboarding page
  if (!user.onboarding_completed_at && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  // If user is onboarded but tries to access onboarding page, send to dashboard
  if (user.onboarding_completed_at && location.pathname === '/onboarding') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/session" element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          } />
          
          <Route path="/library" element={
            <ProtectedRoute>
               <ExerciseLibrary />
            </ProtectedRoute>
          } />
          
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          
          <Route path="/routines" element={
            <ProtectedRoute>
              <Routines />
            </ProtectedRoute>
          } />
          
          <Route path="/routines/:routineId" element={
            <ProtectedRoute>
              <RoutineDetail />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
