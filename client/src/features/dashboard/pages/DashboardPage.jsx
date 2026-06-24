import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Folder,
  FileCode,
  Star,
  Search,
  Plus,
  Trash2,
  FolderPlus,
  StarHalf,
  History,
  Calendar,
  Share2,
  RefreshCw
} from 'lucide-react';
import { fetchProjectsAction, deleteProjectAction, createNewProjectAction } from '../../projects/projectsActions';
import { fetchFoldersAction, createNewFolderAction, deleteFolderAction } from '../../folders/foldersActions';
import { fetchFavoritesAction, starProjectAction, unstarProjectAction } from '../../favorites/favoritesActions';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
  const { folders, loading: foldersLoading } = useSelector((state) => state.folders);
  const { favorites } = useSelector((state) => state.favorites);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    dispatch(fetchProjectsAction());
    dispatch(fetchFoldersAction());
    dispatch(fetchFavoritesAction());
  }, [dispatch]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await dispatch(createNewFolderAction(newFolderName.trim(), null));
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (err) {}
  };

  const handleCreateNewProject = async () => {
    const name = prompt('Enter project name:');
    if (!name || !name.trim()) return;

    try {
      const p = await dispatch(
        createNewProjectAction({
          name: name.trim(),
          sourceLang: 'javascript',
          sourceCode: '// Start coding...',
          folderId: null
        })
      );
      navigate('/'); // Redirect to editor workspace
    } catch (err) {}
  };

  const handleToggleFavorite = (project) => {
    const isFav = favorites.some((fav) => fav.project?._id === project._id);
    if (isFav) {
      dispatch(unstarProjectAction(project));
    } else {
      dispatch(starProjectAction(project));
    }
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project worksheet?')) {
      dispatch(deleteProjectAction(projectId));
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-light via-white to-beige/20 dark:from-darkgrey-dark dark:via-darkgrey dark:to-darkgrey-dark transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide text-darkgrey dark:text-beige-light">
              My Workspace
            </h1>
            <p className="text-sm text-darkgrey/60 dark:text-beige-dark mt-1">
              Organize, star, share, and review your code assistant workspaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setShowFolderModal(true)} variant="outline" className="flex items-center gap-1.5">
              <FolderPlus size={16} />
              New Folder
            </Button>
            <Button onClick={handleCreateNewProject} className="flex items-center gap-1.5">
              <Plus size={16} />
              New Project
            </Button>
          </div>
        </div>

        {/* Workspace Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/40 dark:bg-darkgrey-light/10 border border-beige-dark/20 dark:border-darkgrey-light/25 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-darkgrey/50 dark:text-beige-dark uppercase">TOTAL WORKSHEETS</p>
              <h3 className="text-2xl font-extrabold mt-1 text-darkgrey dark:text-beige-light">{projects.length}</h3>
            </div>
            <div className="p-3 bg-beige/40 dark:bg-darkgrey-light/30 text-darkgrey dark:text-beige rounded-xl">
              <FileCode size={24} />
            </div>
          </div>

          <div className="bg-white/40 dark:bg-darkgrey-light/10 border border-beige-dark/20 dark:border-darkgrey-light/25 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-darkgrey/50 dark:text-beige-dark uppercase">WORKSPACE FOLDERS</p>
              <h3 className="text-2xl font-extrabold mt-1 text-darkgrey dark:text-beige-light">{folders.length}</h3>
            </div>
            <div className="p-3 bg-beige/40 dark:bg-darkgrey-light/30 text-darkgrey dark:text-beige rounded-xl">
              <Folder size={24} />
            </div>
          </div>

          <div className="bg-white/40 dark:bg-darkgrey-light/10 border border-beige-dark/20 dark:border-darkgrey-light/25 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-darkgrey/50 dark:text-beige-dark uppercase">FAVORITES</p>
              <h3 className="text-2xl font-extrabold mt-1 text-darkgrey dark:text-beige-light">{favorites.length}</h3>
            </div>
            <div className="p-3 bg-beige/40 dark:bg-darkgrey-light/30 text-darkgrey dark:text-beige rounded-xl">
              <Star size={24} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </div>

        {/* Dashboard Worksheets Table / List */}
        <div className="bg-white/50 backdrop-blur-md dark:bg-darkgrey-light/5 border border-beige-dark/20 dark:border-darkgrey-light/20 rounded-3xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-darkgrey dark:text-beige-light">Saved Worksheets</h2>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3.5 text-darkgrey/40 dark:text-beige-dark" size={16} />
              <input
                type="text"
                placeholder="Search worksheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-beige-dark/50 bg-white dark:bg-darkgrey-dark text-darkgrey dark:text-beige-light outline-none"
              />
            </div>
          </div>

          {/* Worksheet Items Table List */}
          {projectsLoading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="animate-spin text-darkgrey dark:text-beige" size={24} />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-darkgrey/50 dark:text-beige-dark">
              <FileCode className="mx-auto mb-3 text-beige-dark" size={32} />
              <p className="font-semibold">No project worksheets found.</p>
              <p className="text-xs mt-1">Click "New Project" to start your first AI-powered helper session.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-beige-dark/20 dark:border-darkgrey-light/25 text-xs font-bold text-darkgrey/60 dark:text-beige-dark uppercase">
                    <th className="pb-3 px-2">Worksheet Name</th>
                    <th className="pb-3 px-2">Source Language</th>
                    <th className="pb-3 px-2">Folder Location</th>
                    <th className="pb-3 px-2">Last Updated</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-dark/15 dark:divide-darkgrey-light/15 text-sm">
                  {filteredProjects.map((p) => {
                    const isFav = favorites.some((fav) => fav.project?._id === p._id);
                    const folder = folders.find((f) => f._id === p.folder);

                    return (
                      <tr key={p._id} className="hover:bg-beige/25 dark:hover:bg-darkgrey-light/10 transition-colors">
                        {/* Name */}
                        <td className="py-4 px-2">
                          <Link
                            to="/"
                            onClick={() => {
                              // Load Project action
                              dispatch(fetchProjectByIdAction(p._id));
                            }}
                            className="font-bold text-darkgrey hover:text-beige-dark dark:text-beige-light dark:hover:text-beige flex items-center gap-2"
                          >
                            <FileCode size={16} className="text-beige-dark" />
                            <span>{p.name}</span>
                          </Link>
                          {p.description && (
                            <p className="text-xs text-darkgrey/50 dark:text-beige-dark mt-0.5 truncate max-w-sm">
                              {p.description}
                            </p>
                          )}
                        </td>
                        
                        {/* Source Lang */}
                        <td className="py-4 px-2">
                          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-beige/50 dark:bg-darkgrey-dark text-darkgrey dark:text-beige uppercase">
                            {p.sourceLang}
                          </span>
                        </td>
                        
                        {/* Folder */}
                        <td className="py-4 px-2">
                          <span className="text-darkgrey/70 dark:text-beige-dark/80 flex items-center gap-1.5">
                            <Folder size={14} className="text-beige" />
                            {folder ? folder.name : 'Root Workspace'}
                          </span>
                        </td>
                        
                        {/* Date */}
                        <td className="py-4 px-2">
                          <span className="text-xs text-darkgrey/50 dark:text-beige-dark flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Controls */}
                        <td className="py-4 px-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Star */}
                            <button
                              onClick={() => handleToggleFavorite(p)}
                              className={`p-1.5 rounded-lg border hover:bg-beige/40 dark:hover:bg-darkgrey-light/35 transition-colors ${isFav ? 'border-yellow-200 text-yellow-500 bg-yellow-50/20' : 'border-beige-dark/20 text-darkgrey/50 dark:border-darkgrey-light dark:text-beige-dark'}`}
                            >
                              <Star size={14} className={isFav ? 'fill-yellow-500' : ''} />
                            </button>
                            
                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteProject(p._id)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950/25 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-darkgrey/60 backdrop-blur-sm" onClick={() => setShowFolderModal(false)} />
          <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-beige-dark/20 bg-beige-light dark:bg-darkgrey dark:border-darkgrey-light p-6 shadow-2xl transition-all">
            <h3 className="text-lg font-bold mb-4 text-darkgrey dark:text-beige-light">Create Workspace Folder</h3>
            <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
              <Input
                label="Folder Name"
                placeholder="e.g. Python Scripts"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowFolderModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
export { DashboardPage };
