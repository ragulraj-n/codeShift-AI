import { Router } from 'express';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  listConnections
} from '../controllers/connection.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validateConnectionRequest } from '../middlewares/validateConnectionRequest.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/', validateConnectionRequest, sendConnectionRequest);
router.get('/', listConnections);
router.patch('/:connectionId/accept', acceptConnectionRequest);

export default router;
