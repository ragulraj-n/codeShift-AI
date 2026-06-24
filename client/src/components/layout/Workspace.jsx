import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import {
  Play,
  Sparkles,
  Bug,
  BookOpen,
  Copy,
  Download,
  Trash2,
  Maximize2,
  Minimize2,
  Upload,
  Star,
  Check,
  RefreshCw,
  FolderOpen,
  FilePlus // ✅ ADDED
} from 'lucide-react';
import {
  setSourceCode,
  setOutputCode,
  setSourceLang,
  setTargetLang,
  clearEditor,
  setTheme
} from '../../features/editor/editorSlice';
import {
  convertCodeAction,
  optimizeCodeAction,
  debugCodeAction,
  explainCodeAction
} from '../../features/aiOperations/aiActions';
import { starProjectAction, unstarProjectAction } from '../../features/favorites/favoritesActions';
import { fetchHistoryAction } from '../../features/history/historyActions';
import { saveCurrentWorksheetAction } from '../../features/projects/projectsActions'; // ✅ ADDED
import Button from '../common/Button';
import CreateProjectModal from '../../features/projects/components/CreateProjectModal'; // ✅ ADDED
import toast from 'react-hot-toast';

const SUPPORTED_LANGS = [
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'typescript', label: 'TypeScript', ext: '.ts' },
  { value: 'python', label: 'Python', ext: '.py' },
  { value: 'java', label: 'Java', ext: '.java' },
  { value: 'c', label: 'C', ext: '.c' },
  { value: 'cpp', label: 'C++', ext: '.cpp' }
];

// ✅ Default code matches initial state in editorSlice
const DEFAULT_CODE = `// Enter your code here
function greet(name) {
    console.log("Hello, " + name + "!");
}

greet("World");`;

// ✅ Added onOpenSaveModal prop
const Workspace = ({ onOpenLogin, onOpenSaveModal }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Redux States
  const { isAuthenticated } = useSelector((state) => state.user);
  const {
    sourceCode: reduxSourceCode,
    outputCode,
    sourceLang,
    targetLang,
    operationMode,
    theme,
    isLoading,
    resultType,
    report
  } = useSelector((state) => state.editor);
  const { activeProject } = useSelector((state) => state.projects);

  // Local state for editor to prevent re-renders
  const [localSourceCode, setLocalSourceCode] = useState(reduxSourceCode);
  const debounceTimerRef = useRef(null);

  // Local States for UI
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // ✅ New state for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Monaco editor instance refs
  const leftEditorRef = useRef(null);
  
  // Track if we're currently syncing to prevent loops
  const isSyncingRef = useRef(false);

  // Update local state when Redux changes (for external updates like loading saved projects)
  useEffect(() => {
    if (!isSyncingRef.current) {
      setLocalSourceCode(reduxSourceCode);
    }
  }, [reduxSourceCode]);

  // Debounced sync to Redux (only when user stops typing for 500ms)
  const syncToRedux = useCallback((value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      isSyncingRef.current = true;
      dispatch(setSourceCode(value));
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
    }, 500);
  }, [dispatch]);

  // Handle editor mount - store reference and set up listeners
  const handleLeftEditorDidMount = useCallback((editor, monaco) => {
    leftEditorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      tabSize: 2,
      insertSpaces: true,
      automaticLayout: true
    });

    // Set initial value
    editor.setValue(reduxSourceCode);
    
    // Listen to content changes
    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      setLocalSourceCode(newValue);
      syncToRedux(newValue);
    });
  }, [reduxSourceCode, syncToRedux]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Format Document
  const handleFormat = useCallback(() => {
    if (leftEditorRef.current) {
      leftEditorRef.current.getAction('editor.action.formatDocument').run();
      toast.success('Document formatted.');
      // Sync after format
      setTimeout(() => {
        const newValue = leftEditorRef.current.getValue();
        setLocalSourceCode(newValue);
        syncToRedux(newValue);
      }, 100);
    }
  }, [syncToRedux]);

  // Clear Editor
  const handleClear = useCallback(() => {
    if (leftEditorRef.current) {
      leftEditorRef.current.setValue('');
      setLocalSourceCode('');
      dispatch(clearEditor());
      toast.success('Workspace cleared.');
    }
  }, [dispatch]);

  // Copy to Clipboard
  const copyToClipboard = useCallback((text, isLeft) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isLeft) {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    } else {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
    toast.success('Copied to clipboard!');
  }, []);

  // Download Code
  const downloadCodeFile = useCallback((text, lang, isOutput = false) => {
    if (!text) return;
    const langObj = SUPPORTED_LANGS.find((l) => l.value === lang);
    const extension = isOutput && resultType === 'markdown' ? '.md' : (langObj?.ext || '.txt');
    const filename = `codeshift_${isOutput ? 'output' : 'input'}${extension}`;
    
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded: ${filename}`);
  }, [resultType]);

  // File handling
  const processFile = useCallback((file) => {
    if (file.size > 500 * 1024) {
      toast.error('File size exceeds 500 KB limit.');
      return;
    }

    const filename = file.name.toLowerCase();
    const matchedLang = SUPPORTED_LANGS.find((lang) => filename.endsWith(lang.ext));

    if (!matchedLang) {
      toast.error('Unsupported file format. Please upload .js, .ts, .py, .java, .c, or .cpp.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (leftEditorRef.current) {
        leftEditorRef.current.setValue(text || '');
      }
      setLocalSourceCode(text || '');
      isSyncingRef.current = true;
      dispatch(setSourceCode(text || ''));
      dispatch(setSourceLang(matchedLang.value));
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 100);
      toast.success(`Loaded file: ${file.name} (${matchedLang.label})`);
    };
    reader.readAsText(file);
  }, [dispatch]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileUpload = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  // Auto-detect language
  const autoDetectLanguage = useCallback(() => {
    const code = localSourceCode.trim();
    if (!code) {
      toast.error('Editor is empty, write code first.');
      return;
    }

    let detected = 'javascript';
    if (code.includes('def ') && (code.includes('import ') || code.includes('print(') || code.includes(':'))) {
      detected = 'python';
    } else if (code.includes('public class ') || code.includes('System.out.println')) {
      detected = 'java';
    } else if (code.includes('#include <iostream>') || code.includes('using namespace std;')) {
      detected = 'cpp';
    } else if (code.includes('#include <stdio.h>')) {
      detected = 'c';
    } else if (code.includes('interface ') || code.includes('type ') || (code.includes(':') && (code.includes('string') || code.includes('number')))) {
      detected = 'typescript';
    }

    dispatch(setSourceLang(detected));
    toast.success(`Language auto-detected: ${SUPPORTED_LANGS.find(l => l.value === detected)?.label}`);
  }, [localSourceCode, dispatch]);

  // Star/Favorite handler
  const handleToggleFavorite = useCallback(() => {
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }

    if (!activeProject) {
      toast.error('Save project first to mark as favorite.');
      return;
    }

    if (activeProject.isFavorite) {
      dispatch(unstarProjectAction(activeProject));
    } else {
      dispatch(starProjectAction(activeProject));
    }
  }, [isAuthenticated, activeProject, dispatch, onOpenLogin]);

  // AI Action Handlers - use localSourceCode for current editor content
  const handleConvert = useCallback(() => {
    const currentCode = leftEditorRef.current?.getValue() || localSourceCode;
    if (!currentCode.trim()) {
      toast.error('Please input some code first.');
      return;
    }
    dispatch(convertCodeAction(currentCode, sourceLang, targetLang)).then(() => {
      dispatch(fetchHistoryAction());
    });
  }, [localSourceCode, sourceLang, targetLang, dispatch]);

  const handleOptimize = useCallback(() => {
    const currentCode = leftEditorRef.current?.getValue() || localSourceCode;
    if (!currentCode.trim()) {
      toast.error('Please input some code first.');
      return;
    }
    dispatch(optimizeCodeAction(currentCode, sourceLang)).then(() => {
      dispatch(fetchHistoryAction());
    });
  }, [localSourceCode, sourceLang, dispatch]);

  const handleDebug = useCallback(() => {
    const currentCode = leftEditorRef.current?.getValue() || localSourceCode;
    if (!currentCode.trim()) {
      toast.error('Please input some code first.');
      return;
    }
    dispatch(debugCodeAction(currentCode, sourceLang)).then(() => {
      dispatch(fetchHistoryAction());
    });
  }, [localSourceCode, sourceLang, dispatch]);

  const handleExplain = useCallback(() => {
    const currentCode = leftEditorRef.current?.getValue() || localSourceCode;
    if (!currentCode.trim()) {
      toast.error('Please input some code first.');
      return;
    }
    dispatch(explainCodeAction(currentCode, sourceLang)).then(() => {
      dispatch(fetchHistoryAction());
    });
  }, [localSourceCode, sourceLang, dispatch]);

  // ========== NEW FEATURE: "New" button and unsaved changes ==========
  
  // Check if there are unsaved changes
  const isDirty = useMemo(() => {
    const currentSource = leftEditorRef.current?.getValue() || localSourceCode || '';
    if (activeProject) {
      // Compare with saved project
      return currentSource !== (activeProject.sourceCode || '') ||
             (resultType === 'markdown' ? report : outputCode) !== (activeProject.outputCode || '');
    } else {
      // Compare with default code (or empty if user cleared)
      return currentSource.trim() !== '' && currentSource !== DEFAULT_CODE;
    }
  }, [localSourceCode, activeProject, outputCode, report, resultType]);

  const handleNewProject = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleSaveAndNew = async () => {
    if (activeProject) {
      try {
        const finalOutput = resultType === 'markdown' ? report : outputCode;
        await dispatch(
          saveCurrentWorksheetAction(activeProject._id, {
            sourceCode: localSourceCode,
            outputCode: finalOutput,
            sourceLang,
            targetLang
          })
        );
        setShowUnsavedModal(false);
        setShowCreateModal(true);
      } catch (err) {
        // error toast already shown by action
      }
    } else {
      // No active project → open the global SaveProjectModal (passed from parent)
      setShowUnsavedModal(false);
      if (onOpenSaveModal) onOpenSaveModal();
      // After saving, user can click "New" again – we won't auto-open create modal
    }
  };

  const handleDiscardAndNew = () => {
    // Clear editor state and set default code
    dispatch(clearEditor());
    dispatch(setSourceCode(DEFAULT_CODE));
    // Reset local editor content
    if (leftEditorRef.current) {
      leftEditorRef.current.setValue(DEFAULT_CODE);
    }
    setLocalSourceCode(DEFAULT_CODE);
    setShowUnsavedModal(false);
    setShowCreateModal(true);
  };

  // ========== End of new feature ==========

  // Memoize output content
  const outputContent = useMemo(() => 
    resultType === 'markdown' ? report : outputCode,
  [resultType, report, outputCode]);

  // Memoize editor options to prevent re-creation
  const editorOptions = useMemo(() => ({
    fontSize: 14,
    fontFamily: 'Fira Code, monospace',
    minimap: { enabled: false },
    lineNumbers: 'on',
    automaticLayout: true,
    padding: { top: 12 },
    scrollBeyondLastLine: false,
    wordWrap: 'on'
  }), []);

  const readOnlyEditorOptions = useMemo(() => ({
    ...editorOptions,
    readOnly: true,
    domReadOnly: true
  }), [editorOptions]);

  return (
    <div className={`flex flex-col flex-grow ${isFullScreen ? 'fixed inset-0 z-50 bg-beige-light dark:bg-darkgrey-dark' : 'h-[calc(100vh-65px)]'} p-6 gap-6 transition-all duration-300`}>
      
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-beige-dark/20 dark:border-darkgrey-light/35 pb-4">
        <div className="flex items-center gap-3">
          {activeProject ? (
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-beige-dark" />
              <h2 className="text-lg font-bold text-darkgrey dark:text-beige-light">
                {activeProject.name}
              </h2>
              {activeProject.description && (
                <span className="text-xs text-darkgrey/50 dark:text-beige-dark truncate hidden lg:inline max-w-xs">
                  ({activeProject.description})
                </span>
              )}
              <button
                onClick={handleToggleFavorite}
                className="p-1 hover:bg-beige/40 dark:hover:bg-darkgrey-light/40 rounded-lg transition-colors text-yellow-500"
                title={activeProject.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star size={16} className={activeProject.isFavorite ? 'fill-yellow-500' : ''} />
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-darkgrey dark:text-beige-light">
                Sandbox Editor
              </h2>
              <p className="text-xs text-darkgrey/50 dark:text-beige-dark">
                Unsaved workspace sheet. Conversions and audits will not be recorded in projects.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* ✅ NEW BUTTON */}
          <button
            onClick={handleNewProject}
            className="p-2 rounded-xl border border-beige-dark/40 hover:bg-beige/40 text-darkgrey dark:border-darkgrey-light dark:hover:bg-darkgrey-light/50 dark:text-beige-light transition-all duration-200 text-xs font-semibold flex items-center gap-1.5"
            title="Create a new project"
          >
            <FilePlus size={16} />
            New
          </button>

          <button
            onClick={handleFormat}
            className="p-2 rounded-xl border border-beige-dark/40 hover:bg-beige/40 text-darkgrey dark:border-darkgrey-light dark:hover:bg-darkgrey-light/50 dark:text-beige-light transition-all duration-200 text-xs font-semibold flex items-center gap-1.5"
            title="Auto-format code content"
          >
            Auto Format
          </button>
          
          <button
            onClick={autoDetectLanguage}
            className="p-2 rounded-xl border border-beige-dark/40 hover:bg-beige/40 text-darkgrey dark:border-darkgrey-light dark:hover:bg-darkgrey-light/50 dark:text-beige-light transition-all duration-200 text-xs font-semibold flex items-center gap-1.5"
            title="Auto detect language signature"
          >
            Auto Detect
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl border border-beige-dark/40 hover:bg-beige/40 text-darkgrey dark:border-darkgrey-light dark:hover:bg-darkgrey-light/50 dark:text-beige-light transition-all duration-200 text-xs font-semibold flex items-center gap-1.5"
            title={isFullScreen ? 'Minimize workspace' : 'Expand full screen'}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-950/20 dark:hover:bg-red-950/25 dark:text-red-400 transition-all duration-200 text-xs font-semibold flex items-center gap-1.5"
            title="Clear all fields"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Split-Screen Editors - (unchanged) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[400px]">
        {/* Left Input Editor Panel */}
        <div 
          className={`flex-1 flex flex-col rounded-2xl border bg-white dark:bg-darkgrey border-beige-dark/20 dark:border-darkgrey-light/30 overflow-hidden relative ${isDragOver ? 'border-2 border-dashed border-beige dark:border-beige-dark scale-[0.99] transition-all' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-darkgrey/75 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-beige-light p-6 gap-3">
              <Upload size={48} className="animate-bounce" />
              <h3 className="text-xl font-bold">Drop your code file here</h3>
              <p className="text-sm text-beige-dark">Supports .js, .ts, .py, .java, .c, .cpp (max 500 KB)</p>
            </div>
          )}

          <div className="bg-beige/20 dark:bg-darkgrey-dark/40 px-4 py-2 flex items-center justify-between border-b border-beige-dark/20 dark:border-darkgrey-light/25">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-darkgrey/60 dark:text-beige-dark">SOURCE CODE</span>
              <select
                value={sourceLang}
                onChange={(e) => dispatch(setSourceLang(e.target.value))}
                className="px-2 py-1 text-xs rounded border border-beige-dark/50 bg-white dark:bg-darkgrey-dark text-darkgrey dark:text-beige-light outline-none"
              >
                {SUPPORTED_LANGS.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">             
              <button onClick={() => copyToClipboard(localSourceCode, true)} title="Copy code" className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light">
                {copiedLeft ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button onClick={() => downloadCodeFile(localSourceCode, sourceLang, false)} title="Download file" className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light">
                <Download size={14} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                title="Upload code file" 
                className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
              >
                <Upload size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".js,.ts,.py,.java,.c,.cpp"
                className="hidden"
              />
            </div>
          </div>

          {/* Monaco Editor Left - NO key prop, mount once */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={sourceLang}
              theme={theme}
              onMount={handleLeftEditorDidMount}
              options={editorOptions}
              loading={<div className="flex items-center justify-center h-full">Loading Editor...</div>}
            />
          </div>
        </div>

        {/* Right Output Editor Panel - (unchanged) */}
        <div className="flex-1 flex flex-col rounded-2xl border bg-white dark:bg-darkgrey border-beige-dark/20 dark:border-darkgrey-light/30 overflow-hidden relative">
          
          <div className="bg-beige/20 dark:bg-darkgrey-dark/40 px-4 py-2 flex items-center justify-between border-b border-beige-dark/20 dark:border-darkgrey-light/25">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-darkgrey/60 dark:text-beige-dark">OUTPUT RESULT</span>
              {operationMode === 'convert' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-darkgrey/40 dark:text-beige-dark/40">➔ TO</span>
                  <select
                    value={targetLang}
                    onChange={(e) => dispatch(setTargetLang(e.target.value))}
                    className="px-2 py-1 text-xs rounded border border-beige-dark/50 bg-white dark:bg-darkgrey-dark text-darkgrey dark:text-beige-light outline-none"
                  >
                    {SUPPORTED_LANGS.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => copyToClipboard(outputContent, false)} 
                title="Copy result" 
                className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
              >
                {copiedRight ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button 
                onClick={() => downloadCodeFile(outputContent, resultType === 'markdown' ? 'markdown' : targetLang, true)} 
                title="Download file" 
                className="p-1 text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] overflow-y-auto bg-white dark:bg-darkgrey-dark relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-darkgrey-dark/50 z-10 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-darkgrey dark:text-beige" size={32} />
                <span className="text-xs font-bold text-darkgrey/70 dark:text-beige-dark">AI Model executing...</span>
              </div>
            )}

            {!isLoading && !outputCode && !report && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-darkgrey/40 dark:text-beige-dark/40 gap-2">
                <Sparkles size={36} className="text-beige dark:text-beige-dark" />
                <h3 className="text-sm font-bold">Result panel is idle</h3>
                <p className="text-xs max-w-xs">Select an operation in the toolbar below to run AI tasks on your source code.</p>
              </div>
            )}

            {!isLoading && resultType === 'code' && outputCode && (
              <Editor
                height="100%"
                language={targetLang}
                value={outputCode}
                theme={theme}
                options={readOnlyEditorOptions}
                loading={<div className="flex items-center justify-center h-full">Loading Editor...</div>}
              />
            )}

            {!isLoading && resultType === 'markdown' && report && (
              <div className="p-6 prose prose-slate dark:prose-invert max-w-none text-darkgrey dark:text-beige-light font-sans text-sm leading-relaxed overflow-x-hidden">
                {report.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-xl font-extrabold border-b border-beige-dark/20 pb-2 mb-4 mt-2 text-darkgrey dark:text-beige-light">{line.substring(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-lg font-bold border-b border-beige-dark/10 pb-1 mb-3 mt-4 text-darkgrey dark:text-beige-light">{line.substring(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-base font-bold mb-2 mt-3 text-darkgrey dark:text-beige-light">{line.substring(4)}</h3>;
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <li key={idx} className="list-disc ml-5 mb-1.5">{line.substring(2)}</li>;
                  }
                  if (line.trim().startsWith('```')) {
                    return null;
                  }
                  if (line.trim() === '') return <div key={idx} className="h-2" />;
                  return <p key={idx} className="mb-2">{line}</p>;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Operations Toolbar - (unchanged) */}
      <div className="bg-white dark:bg-darkgrey border border-beige-dark/20 dark:border-darkgrey-light/35 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="text-beige dark:text-beige-dark animate-pulse" size={18} />
          <span className="text-sm font-bold text-darkgrey/80 dark:text-beige-light/85">AI OPERATIONS TOOLBAR:</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleConvert}
            loading={isLoading && operationMode === 'convert'}
            disabled={isLoading}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Play size={14} />
            Convert Code
          </Button>

          <Button
            onClick={handleOptimize}
            loading={isLoading && operationMode === 'optimize'}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            Optimize Code
          </Button>

          <Button
            onClick={handleDebug}
            loading={isLoading && operationMode === 'debug'}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-950/20"
          >
            <Bug size={14} />
            Audit & Debug
          </Button>

          <Button
            onClick={handleExplain}
            loading={isLoading && operationMode === 'explain'}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <BookOpen size={14} />
            Explain Code
          </Button>
        </div>
      </div>

      {/* ========== UNSAVED CHANGES CONFIRMATION MODAL ========== */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-darkgrey/70 backdrop-blur-sm" onClick={() => setShowUnsavedModal(false)} />
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-beige-dark/20 bg-beige-light dark:bg-darkgrey dark:border-darkgrey-light p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-darkgrey dark:text-beige-light">Unsaved Changes</h3>
            <p className="mt-2 text-sm text-darkgrey/70 dark:text-beige-dark">
              You have unsaved changes. What would you like to do?
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowUnsavedModal(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleDiscardAndNew}>
                Discard
              </Button>
              <Button onClick={handleSaveAndNew}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CREATE PROJECT MODAL ========== */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Workspace;
export { Workspace };