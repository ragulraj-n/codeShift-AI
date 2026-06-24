import { Router } from 'express';
import {
  generateShareLink,
  getSharedProject,
  forkProject
} from '../controllers/sharing.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Publicly view shared project code
router.get('/:shareToken', getSharedProject);

// Secured sharing actions
router.post('/', verifyJWT, generateShareLink);
router.post('/fork', verifyJWT, forkProject);

export default router;
