import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Folder, FolderPlus, FileCode, ChevronRight, ChevronDown, Star, History, Trash2, Edit3, Plus, AlertCircle } from 'lucide-react';
import { fetchProjectsAction, fetchProjectByIdAction, createNewProjectAction, deleteProjectAction } from '../../features/projects/projectsActions';
import { fetchFoldersAction, createNewFolderAction, renameFolderAction, deleteFolderAction } from '../../features/folders/foldersActions';
import { fetchFavoritesAction, unstarProjectAction } from '../../features/favorites/favoritesActions';
import { fetchHistoryAction } from '../../features/history/historyActions';
import Button from '../common/Button';
import CreateProjectModal from '../../features/projects/components/CreateProjectModal';

const Sidebar = ({ onOpenLogin }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const { projects, activeProject } = useSelector((state) => state.projects);
  const { folders } = useSelector((state) => state.folders);
  const { favorites } = useSelector((state) => state.favorites);
  const { historyList } = useSelector((state) => state.history);

  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'favorites' | 'history'
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Inline rename folder state
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // ✅ New state for CreateProjectModal
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [createFolderId, setCreateFolderId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProjectsAction());
      dispatch(fetchFoldersAction());
      dispatch(fetchFavoritesAction());
      dispatch(fetchHistoryAction());
    } else {
      // Fetch public history for guests (tracked by IP)
      dispatch(fetchHistoryAction());
    }
  }, [isAuthenticated, dispatch]);

  const toggleFolder = (folderId) => {
    setExpandedFolders({
      ...expandedFolders,
      [folderId]: !expandedFolders[folderId]
    });
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await dispatch(createNewFolderAction(newFolderName.trim(), null));
      setNewFolderName('');
      setShowFolderInput(false);
    } catch (err) {}
  };

  const handleRenameFolderSubmit = async (folderId) => {
    if (!editingFolderName.trim()) return;
    try {
      await dispatch(renameFolderAction(folderId, editingFolderName.trim()));
      setEditingFolderId(null);
    } catch (err) {}
  };

  // ✅ REMOVED the old prompt-based function: handleCreateNewProjectInFolder

  // Compile items in root and folders
  const renderFilesTab = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center gap-4 h-64 border border-dashed border-beige-dark/30 dark:border-darkgrey-light/30 rounded-2xl bg-white/20 dark:bg-darkgrey-light/5">
          <AlertCircle className="text-darkgrey/40 dark:text-beige-dark/40" size={32} />
          <div>
            <h4 className="text-sm font-bold text-darkgrey dark:text-beige-light">Guest Mode active</h4>
            <p className="text-xs text-darkgrey/50 dark:text-beige-dark mt-1">
              Sign up or log in to create folders, save projects, and favorite worksheets.
            </p>
          </div>
          <Button size="sm" onClick={onOpenLogin}>
            Sign In Now
          </Button>
        </div>
      );
    }

    // Filter projects at root level (no folder id)
    const rootProjects = projects.filter((p) => !p.folder);

    return (
      <div className="flex flex-col gap-2">
        {/* Create Folder Trigger */}
        <div className="flex items-center justify-between border-b border-beige-dark/20 dark:border-darkgrey-light/20 pb-2 mb-2">
          <span className="text-xs font-bold text-darkgrey/50 dark:text-beige-dark">WORKSPACE ROOT</span>
          <button
            onClick={() => setShowFolderInput(!showFolderInput)}
            className="flex items-center gap-1 text-xs text-darkgrey dark:text-beige hover:underline font-bold"
          >
            <FolderPlus size={14} />
            Add Folder
          </button>
        </div>

        {/* Folder Input */}
        {showFolderInput && (
          <form onSubmit={handleCreateFolder} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-beige-dark/50 bg-white dark:bg-darkgrey-dark text-darkgrey dark:text-beige-light outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-bold bg-darkgrey text-beige-light dark:bg-beige dark:text-darkgrey-dark rounded-lg hover:opacity-85"
            >
              Add
            </button>
          </form>
        )}

        {/* Folders List */}
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-96 pr-1">
          {folders.map((folder) => {
            const folderProjects = projects.filter((p) => p.folder === folder._id);
            const isExpanded = expandedFolders[folder._id];

            return (
              <div key={folder._id} className="flex flex-col">
                <div className="flex items-center justify-between group hover:bg-beige/40 dark:hover:bg-darkgrey-light/30 rounded-lg p-1.5 transition-colors">
                  <button
                    onClick={() => toggleFolder(folder._id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-darkgrey dark:text-beige-light text-left truncate flex-1"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Folder size={14} className="text-beige dark:text-beige-dark flex-shrink-0" />
                    
                    {editingFolderId === folder._id ? (
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onBlur={() => handleRenameFolderSubmit(folder._id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameFolderSubmit(folder._id)}
                        className="bg-white dark:bg-darkgrey-dark px-1 text-xs outline-none border rounded border-beige-dark"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{folder.name}</span>
                    )}
                  </button>

                  {/* Folder Controls */}
                  <div className="hidden group-flex md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* ✅ Replaced onClick with modal trigger */}
                    <button
                      onClick={() => {
                        setCreateFolderId(folder._id);
                        setShowCreateProjectModal(true);
                      }}
                      title="Add project inside folder"
                      className="p-0.5 hover:text-darkgrey dark:hover:text-beige"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFolderId(folder._id);
                        setEditingFolderName(folder.name);
                      }}
                      title="Rename folder"
                      className="p-0.5 hover:text-darkgrey dark:hover:text-beige"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => dispatch(deleteFolderAction(folder._id))}
                      title="Delete folder and contents"
                      className="p-0.5 text-red-600 dark:text-red-400 hover:opacity-80"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Sub-projects list */}
                {isExpanded && (
                  <div className="pl-6 border-l border-beige-dark/20 dark:border-darkgrey-light/20 ml-3 mt-1 flex flex-col gap-1">
                    {folderProjects.length === 0 && (
                      <span className="text-[10px] text-darkgrey/40 dark:text-beige-dark/40 italic py-0.5">Empty folder</span>
                    )}
                    {folderProjects.map((p) => (
                      <div
                        key={p._id}
                        className={`flex items-center justify-between group hover:bg-beige/30 dark:hover:bg-darkgrey-light/20 p-1.5 rounded-lg transition-colors cursor-pointer ${activeProject?._id === p._id ? 'bg-beige/60 dark:bg-darkgrey-light/40 border-l-2 border-darkgrey dark:border-beige font-semibold' : ''}`}
                        onClick={() => dispatch(fetchProjectByIdAction(p._id))}
                      >
                        <span className="flex items-center gap-1.5 text-xs text-darkgrey dark:text-beige-light truncate flex-1">
                          <FileCode size={12} className="text-darkgrey/50 dark:text-beige-dark/50" />
                          <span className="truncate">{p.name}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this project?')) dispatch(deleteProjectAction(p._id));
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-red-600 dark:text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Root Level Projects */}
        <div className="flex flex-col gap-1.5 border-t border-beige-dark/20 dark:border-darkgrey-light/20 pt-2 mt-2">
          <span className="text-[10px] font-bold text-darkgrey/40 dark:text-beige-dark/40 px-1.5">ROOT PROJECTS</span>
          
          {rootProjects.length === 0 && (
            <span className="text-xs text-darkgrey/40 dark:text-beige-dark/40 italic px-1.5 py-1">No root projects</span>
          )}

          {rootProjects.map((p) => (
            <div
              key={p._id}
              className={`flex items-center justify-between group hover:bg-beige/40 dark:hover:bg-darkgrey-light/35 p-1.5 rounded-lg transition-colors cursor-pointer ${activeProject?._id === p._id ? 'bg-beige/60 dark:bg-darkgrey-light/45 border-l-2 border-darkgrey dark:border-beige font-semibold' : ''}`}
              onClick={() => dispatch(fetchProjectByIdAction(p._id))}
            >
              <span className="flex items-center gap-1.5 text-xs text-darkgrey dark:text-beige-light truncate flex-1">
                <FileCode size={12} className="text-darkgrey/50 dark:text-beige-dark/50" />
                <span className="truncate">{p.name}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this project?')) dispatch(deleteProjectAction(p._id));
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-red-600 dark:text-red-400"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFavoritesTab = () => {
    if (!isAuthenticated) {
      return (
        <p className="text-xs text-center text-darkgrey/50 dark:text-beige-dark py-12">
          Login to bookmark favorite worksheets.
        </p>
      );
    }

    if (favorites.length === 0) {
      return (
        <p className="text-xs text-center text-darkgrey/40 dark:text-beige-dark/40 py-12 italic">
          No starred projects yet.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[500px]">
        {favorites.map((fav) => {
          if (!fav.project) return null;
          return (
            <div
              key={fav._id}
              className="flex items-center justify-between group hover:bg-beige/40 dark:hover:bg-darkgrey-light/30 p-1.5 rounded-lg transition-colors cursor-pointer"
              onClick={() => dispatch(fetchProjectByIdAction(fav.project._id))}
            >
              <span className="flex items-center gap-1.5 text-xs text-darkgrey dark:text-beige-light truncate flex-1">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="truncate font-semibold">{fav.project.name}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(unstarProjectAction(fav.project));
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500"
                title="Unstar project"
              >
                <Trash2 size={10} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (historyList.length === 0) {
      return (
        <p className="text-xs text-center text-darkgrey/40 dark:text-beige-dark/40 py-12 italic">
          No operations history yet.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1">
        {historyList.map((item) => (
          <div
            key={item._id}
            className="flex flex-col gap-1 p-2 rounded-xl bg-beige/30 dark:bg-darkgrey-light/20 border border-beige-dark/20 dark:border-darkgrey-light/20 hover:border-beige-dark/50 dark:hover:border-darkgrey-light/60 transition-all text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-darkgrey text-beige-light dark:bg-beige dark:text-darkgrey-dark">
                {item.operationType}
              </span>
              <span className="text-[10px] text-darkgrey/50 dark:text-beige-dark">
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <p className="text-darkgrey/80 dark:text-beige-light font-bold truncate mt-1">
              Language: <span className="font-semibold text-beige-dark dark:text-beige uppercase">{item.sourceLanguage}</span>
              {item.targetLanguage && ` ➔ ${item.targetLanguage.toUpperCase()}`}
            </p>

            <pre className="text-[10px] font-mono bg-white/40 dark:bg-darkgrey-dark/50 p-1 rounded border border-beige-dark/10 dark:border-darkgrey-light/10 max-h-12 overflow-hidden truncate">
              {item.inputCode}
            </pre>
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className="w-80 h-[calc(100vh-65px)] border-r border-beige-dark/30 dark:border-darkgrey-light/40 bg-white/50 dark:bg-darkgrey/45 flex flex-col p-4 flex-shrink-0">
      {/* Tab Selectors */}
      <div className="flex items-center bg-beige/50 dark:bg-darkgrey-dark/60 p-1 rounded-xl gap-1 mb-4 border border-beige-dark/20 dark:border-darkgrey-light/20">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'files' ? 'bg-white dark:bg-darkgrey text-darkgrey dark:text-beige shadow-sm' : 'text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light'}`}
        >
          <Folder size={12} />
          Files
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'favorites' ? 'bg-white dark:bg-darkgrey text-darkgrey dark:text-beige shadow-sm' : 'text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light'}`}
        >
          <Star size={12} />
          Stars
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-darkgrey text-darkgrey dark:text-beige shadow-sm' : 'text-darkgrey/60 hover:text-darkgrey dark:text-beige-dark dark:hover:text-beige-light'}`}
        >
          <History size={12} />
          History
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'files' && renderFilesTab()}
        {activeTab === 'favorites' && renderFavoritesTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>

      {/* Banner / Info */}
      <div className="mt-4 border-t border-beige-dark/20 dark:border-darkgrey-light/25 pt-4">
        <div className="p-3 bg-beige/30 dark:bg-darkgrey-light/10 border border-beige-dark/20 dark:border-darkgrey-light/20 rounded-2xl flex flex-col gap-1.5 text-xs text-center text-darkgrey/60 dark:text-beige-dark">
          <p className="font-semibold text-darkgrey dark:text-beige-light">CodeShift Platform</p>
        </div>
      </div>

      {/* ✅ CreateProjectModal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => {
          setShowCreateProjectModal(false);
          setCreateFolderId(null);
        }}
        defaultFolderId={createFolderId}
      />
    </aside>
  );
};

export default Sidebar;
export { Sidebar };