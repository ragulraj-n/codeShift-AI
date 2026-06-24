import { Router } from 'express';
import {
  createFolder,
  renameFolder,
  deleteFolder,
  listFolders
} from '../controllers/folder.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Secure all folder routes
router.use(verifyJWT);

router.post('/', createFolder);
router.get('/', listFolders);
router.patch('/:folderId', renameFolder);
router.delete('/:folderId', deleteFolder);

export default router;
