import { Router } from 'express';
import {
  createProject,
  updateProject,
  deleteProject,
  getProject,
  listProjects
} from '../controllers/project.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Secure all project routes
router.use(verifyJWT);

router.post('/', createProject);
router.get('/', listProjects);
router.get('/:projectId', getProject);
router.patch('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

export default router;
