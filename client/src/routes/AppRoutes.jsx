import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Layout & Pages
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Workspace from '../components/layout/Workspace';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import SharedProjectPage from '../features/sharing/pages/SharedProjectPage';

// Modals
import LoginModal from '../features/auth/components/LoginModal';
import SignupModal from '../features/auth/components/SignupModal';
import SaveProjectModal from '../features/projects/components/SaveProjectModal';

// Actions
import { checkAuthSession } from '../features/auth/authActions';
import { clearUser } from '../features/auth/authSlice';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  const [isInitializing, setIsInitializing] = useState(true);
  const { sourceCode, outputCode, sourceLang, targetLang } = useSelector((state) => state.editor);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  // ✅ Only run once on mount
  useEffect(() => {
    const initSession = async () => {
      await dispatch(checkAuthSession());
      setIsInitializing(false);
    };
    initSession();
  }, []); // ✅ Empty dependency array - runs only once

  // Session expiry listener
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error('Your session has expired. Please log in again.');
      dispatch(clearUser());
      setIsLoginOpen(true);
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session_expired', handleSessionExpired);
  }, [dispatch]);

  // ✅ Show loading state
  if (isInitializing || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-beige-light dark:bg-darkgrey-dark">
        <RefreshCw className="animate-spin text-darkgrey dark:text-beige" size={32} />
        <span className="text-sm font-semibold mt-3 text-darkgrey/75 dark:text-beige-dark">
          {isInitializing ? 'Loading CodeShift...' : 'Verifying session...'}
        </span>
      </div>
    );
  }

  const openLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const openSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const EditorWorkspaceLayout = () => (
    <div className="min-h-screen flex flex-col bg-beige-light dark:bg-darkgrey-dark transition-colors duration-300">
      <Header 
        onOpenLogin={openLogin} 
        onOpenSignup={openSignup} 
        onOpenSaveModal={() => setIsSaveOpen(true)} 
      />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <Sidebar onOpenLogin={openLogin} />
        {/* ✅ Pass onOpenSaveModal to Workspace */}
        <Workspace 
          onOpenLogin={openLogin} 
          onOpenSaveModal={() => setIsSaveOpen(true)} 
        />
      </div>

      <SaveProjectModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        sourceCode={sourceCode}
        outputCode={outputCode}
        sourceLang={sourceLang}
        targetLang={targetLang}
      />
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<EditorWorkspaceLayout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/shared/:shareToken" element={<SharedProjectPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={
            <div className="min-h-screen flex flex-col bg-beige-light dark:bg-darkgrey-dark">
              <Header 
                onOpenLogin={openLogin} 
                onOpenSignup={openSignup} 
                onOpenSaveModal={() => setIsSaveOpen(true)} 
              />
              <DashboardPage />
            </div>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={openSignup}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={openLogin}
      />
    </>
  );
};

export default AppRoutes;
export { AppRoutes };