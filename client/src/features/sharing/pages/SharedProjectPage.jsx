import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Copy, Download, Star, Check, GitFork, RefreshCw, FolderCode, FileCode } from 'lucide-react';
import { fetchSharedProjectAction, forkProjectAction } from '../sharingActions';
import LoginModal from '../../auth/components/LoginModal';
import SignupModal from '../../auth/components/SignupModal';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';

const SharedProjectPage = () => {
  const { shareToken } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { sharedProject, loading, error } = useSelector((state) => state.sharing);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.editor);

  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);
  const [forking, setForking] = useState(false);

  // Auth modals triggers
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  useEffect(() => {
    if (shareToken) {
      dispatch(fetchSharedProjectAction(shareToken));
    }
  }, [shareToken, dispatch]);

  const copyToClipboard = (text, isLeft) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isLeft) {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    } else {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
    toast.success('Code copied to clipboard!');
  };

  const downloadCodeFile = (text, lang, isLeft = true) => {
    if (!text) return;
    const extension = lang === 'javascript' ? '.js' : lang === 'python' ? '.py' : lang === 'typescript' ? '.ts' : lang === 'java' ? '.java' : lang === 'c' ? '.c' : lang === 'cpp' ? '.cpp' : '.txt';
    const filename = `shared_${isLeft ? 'source' : 'output'}${extension}`;

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded: ${filename}`);
  };

  const handleFork = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in or sign up to fork this project to your workspace!');
      setIsLoginOpen(true);
      return;
    }

    try {
      setForking(true);
      await dispatch(forkProjectAction(sharedProject.projectId));
      navigate('/dashboard'); // Go to dashboard showing forked project
    } catch (err) {
      // Handled
    } finally {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-beige-light dark:bg-darkgrey-dark gap-4">
        <RefreshCw className="animate-spin text-darkgrey dark:text-beige" size={32} />
        <p className="text-sm font-semibold text-darkgrey/70 dark:text-beige-dark">Loading shared worksheet...</p>
      </div>
    );
  }

  if (error || !sharedProject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-beige-light dark:bg-darkgrey-dark text-center p-6 gap-4">
        <div className="p-3 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full">
          <FolderCode size={36} />
        </div>
        <h2 className="text-2xl font-bold text-darkgrey dark:text-beige-light">Shared Project Not Found</h2>
        <p className="text-sm text-darkgrey/50 dark:text-beige-dark max-w-sm">
          The link might be invalid, deleted, or expired.
        </p>
        <Link to="/">
          <Button>Go to Editor Sandbox</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-beige-light dark:bg-darkgrey-dark transition-colors duration-300">
      
      {/* Shared Navbar Header */}
      <header className="border-b border-beige-dark/30 dark:border-darkgrey-light/45 bg-white/75 dark:bg-darkgrey/75 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-wider text-darkgrey dark:text-beige-light">
            <FolderCode className="text-darkgrey dark:text-beige" />
            CODE<span className="text-beige dark:text-beige-dark">SHIFT</span>
          </Link>
          <span className="h-5 w-px bg-beige-dark/30 dark:bg-darkgrey-light" />
          <span className="text-xs font-bold text-darkgrey/50 dark:text-beige-dark uppercase tracking-wider">
            Public Share View
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleFork} loading={forking} className="flex items-center gap-1.5">
            <GitFork size={16} />
            Fork to My Workspace
          </Button>
        </div>
      </header>

      {/* Share View Body */}
      <div className="flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Project Header card */}
        <div className="bg-white/40 dark:bg-darkgrey-light/5 border border-beige-dark/20 dark:border-darkgrey-light/20 p-6 rounded-3xl flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-darkgrey dark:text-beige-light">
            <FileCode size={20} className="text-beige-dark" />
            <h1 className="text-2xl font-extrabold">{sharedProject.projectName}</h1>
          </div>
          {sharedProject.description && (
            <p className="text-sm text-darkgrey/60 dark:text-beige-dark">
              {sharedProject.description}
            </p>
          )}
          <p className="text-xs text-darkgrey/40 dark:text-beige-dark/40 mt-1">
            Shared on {new Date(sharedProject.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Split screen preview code panels */}
        <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-[450px]">
          {/* Source block */}
          <div className="flex-1 flex flex-col rounded-2xl border bg-white dark:bg-darkgrey border-beige-dark/20 dark:border-darkgrey-light/30 overflow-hidden">
            <div className="bg-beige/20 dark:bg-darkgrey-dark/40 px-4 py-2.5 flex items-center justify-between border-b border-beige-dark/20 dark:border-darkgrey-light/25">
              <span className="text-xs font-bold text-darkgrey/60 dark:text-beige-dark uppercase">
                Source Code ({sharedProject.sourceLang})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(sharedProject.sourceCode, true)}
                  className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
                  title="Copy Code"
                >
                  {copiedLeft ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => downloadCodeFile(sharedProject.sourceCode, sharedProject.sourceLang, true)}
                  className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
                  title="Download File"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div className="flex-grow h-96">
              <Editor
                height="100%"
                language={sharedProject.sourceLang}
                value={sharedProject.sourceCode}
                theme={theme}
                options={{
                  fontSize: 14,
                  fontFamily: 'Fira Code, monospace',
                  readOnly: true,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 12 }
                }}
              />
            </div>
          </div>

          {/* Output block */}
          <div className="flex-1 flex flex-col rounded-2xl border bg-white dark:bg-darkgrey border-beige-dark/20 dark:border-darkgrey-light/30 overflow-hidden">
            <div className="bg-beige/20 dark:bg-darkgrey-dark/40 px-4 py-2.5 flex items-center justify-between border-b border-beige-dark/20 dark:border-darkgrey-light/25">
              <span className="text-xs font-bold text-darkgrey/60 dark:text-beige-dark uppercase">
                Output {sharedProject.targetLang ? `(${sharedProject.targetLang})` : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(sharedProject.outputCode, false)}
                  className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
                  title="Copy Output"
                >
                  {copiedRight ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => downloadCodeFile(sharedProject.outputCode, sharedProject.targetLang || 'markdown', false)}
                  className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
                  title="Download File"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div className="flex-grow h-96 overflow-y-auto bg-white dark:bg-darkgrey-dark">
              {/* Parse code or markdown */}
              {sharedProject.outputCode?.trim()?.startsWith('## ') || sharedProject.outputCode?.trim()?.startsWith('# ') ? (
                <div className="p-6 prose prose-slate dark:prose-invert max-w-none text-darkgrey dark:text-beige-light text-sm leading-relaxed">
                  {sharedProject.outputCode.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) return <h1 key={idx} className="text-xl font-extrabold pb-2 mb-4 border-b border-beige-dark/20">{line.substring(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={idx} className="text-lg font-bold pb-1 mb-3 mt-4 border-b border-beige-dark/10">{line.substring(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={idx} className="text-base font-bold mb-2 mt-3">{line.substring(4)}</h3>;
                    if (line.startsWith('- ') || line.startsWith('* ')) return <li key={idx} className="list-disc ml-5 mb-1.5">{line.substring(2)}</li>;
                    if (line.trim().startsWith('```')) return null;
                    if (line.trim() === '') return <div key={idx} className="h-2" />;
                    return <p key={idx} className="mb-2">{line}</p>;
                  })}
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={sharedProject.targetLang || 'python'}
                  value={sharedProject.outputCode}
                  theme={theme}
                  options={{
                    fontSize: 14,
                    fontFamily: 'Fira Code, monospace',
                    readOnly: true,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    padding: { top: 12 }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Logins Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
};

export default SharedProjectPage;
export { SharedProjectPage };
