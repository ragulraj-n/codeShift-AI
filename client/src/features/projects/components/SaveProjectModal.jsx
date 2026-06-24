import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { createNewProjectAction } from '../projectsActions';
import { fetchFoldersAction } from '../../folders/foldersActions';

const SaveProjectModal = ({ isOpen, onClose, sourceCode, outputCode, sourceLang, targetLang,onSaveSuccess }) => {
  const dispatch = useDispatch();
  const { folders } = useSelector((state) => state.folders);
  const { loading } = useSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    folderId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchFoldersAction());
    }
  }, [isOpen, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({
      ...errors,
      [e.target.name]: ''
    });
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Project name is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await dispatch(
        createNewProjectAction({
          name: formData.name,
          description: formData.description,
          sourceCode,
          outputCode,
          sourceLang,
          targetLang,
          folderId: formData.folderId || null
        })
      );
       if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      // Handled
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Workspace Project">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        <Input
          label="Project Name"
          name="name"
          placeholder="My Python Converter Worksheet"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="description" className="text-sm font-semibold text-darkgrey/80 dark:text-beige-light/85">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            placeholder="Describe what this code snippet does..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 bg-white dark:bg-darkgrey-dark dark:border-darkgrey-light text-darkgrey dark:text-beige-light placeholder-darkgrey/40 dark:placeholder-beige-dark/40 focus:ring-2 focus:ring-beige-dark dark:focus:ring-beige outline-none transition-all duration-200 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="folderId" className="text-sm font-semibold text-darkgrey/80 dark:text-beige-light/85">
            Save in Folder
          </label>
          <select
            id="folderId"
            name="folderId"
            value={formData.folderId}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 bg-white dark:bg-darkgrey-dark dark:border-darkgrey-light text-darkgrey dark:text-beige-light focus:ring-2 focus:ring-beige-dark dark:focus:ring-beige outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Root Workspace</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-3 border-t border-beige-dark/20 dark:border-darkgrey-light pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SaveProjectModal;
