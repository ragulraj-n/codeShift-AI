import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, Save, Share2, FolderCode, User as UserIcon } from 'lucide-react';
import { logoutAction } from '../../features/auth/authActions';
import { saveCurrentWorksheetAction } from '../../features/projects/projectsActions';
import { generateShareLinkAction } from '../../features/sharing/sharingActions';
import { setTheme } from '../../features/editor/editorSlice';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const Header = ({ onOpenLogin, onOpenSignup, onOpenSaveModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { theme, sourceCode, outputCode, sourceLang, targetLang, report, resultType } = useSelector((state) => state.editor);
  const { activeProject } = useSelector((state) => state.projects);

  const [showDropdown, setShowDropdown] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'vs-dark' ? 'light' : 'vs-dark';
    dispatch(setTheme(nextTheme));
    if (nextTheme === 'vs-dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    setShowDropdown(false);
    navigate('/');
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }

    if (activeProject) {
      const finalOutput = resultType === 'markdown' ? report : outputCode;
      await dispatch(
        saveCurrentWorksheetAction(activeProject._id, {
          sourceCode,
          outputCode: finalOutput,
          sourceLang,
          targetLang
        })
      );
    } else {
      onOpenSaveModal();
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }

    if (!activeProject) {
      toast.error('Please save your project before sharing.');
      onOpenSaveModal();
      return;
    }

    try {
      const url = await dispatch(generateShareLinkAction(activeProject._id));
      navigator.clipboard.writeText(url);
      toast.success('Share link copied!');
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-beige-dark/30 dark:border-darkgrey-light/40 bg-white/75 dark:bg-darkgrey/75 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-wider text-darkgrey dark:text-beige-light">
          <FolderCode className="text-darkgrey dark:text-beige" />
          CODE<span className="text-beige dark:text-beige-dark">SHIFT</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm font-bold">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-beige/40 text-darkgrey dark:bg-darkgrey-light/50 dark:text-beige-light' : 'text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light'}`}
          >
            Editor Workspace
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-beige/40 text-darkgrey dark:bg-darkgrey-light/50 dark:text-beige-light' : 'text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light'}`}
            >
              Dashboard
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {location.pathname === '/' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border border-beige-dark/50 hover:bg-beige-dark/20 text-darkgrey dark:text-beige-light dark:border-darkgrey-light dark:hover:bg-darkgrey-light/35 transition-all"
              title="Save worksheet"
            >
              <Save size={16} />
              <span className="hidden sm:inline">
                {activeProject ? 'Save' : 'Save Project'}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border border-beige-dark/50 hover:bg-beige-dark/20 text-darkgrey dark:text-beige-light dark:border-darkgrey-light dark:hover:bg-darkgrey-light/35 transition-all"
              title="Share project link"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-beige-dark/40 hover:bg-beige/40 text-darkgrey dark:border-darkgrey-light dark:hover:bg-darkgrey-light/50 dark:text-beige-light transition-all duration-200"
          title="Toggle color theme"
        >
          {theme === 'vs-dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full border border-beige-dark/30 hover:border-beige-dark focus:outline-none transition-colors"
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'User'}`}
                alt="user avatar"
                className="w-8 h-8 rounded-full bg-beige-light dark:bg-darkgrey-light"
              />
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setShowDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 z-50 w-48 rounded-2xl border border-beige-dark/20 bg-beige-light dark:bg-darkgrey dark:border-darkgrey-light p-2 shadow-2xl">
                  <div className="px-3 py-2 border-b border-beige-dark/20 dark:border-darkgrey-light/50 mb-1">
                    <p className="text-sm font-bold text-darkgrey dark:text-beige-light truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-darkgrey/50 dark:text-beige-dark truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-darkgrey hover:bg-beige/40 dark:text-beige-light dark:hover:bg-darkgrey-light/50 transition-colors"
                  >
                    <UserIcon size={16} />
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl text-sm font-bold text-darkgrey hover:bg-beige/30 dark:text-beige-light dark:hover:bg-darkgrey-light/30 transition-all"
            >
              Log In
            </button>
            <Button size="sm" onClick={onOpenSignup}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
export { Header };