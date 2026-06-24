import { Router } from 'express';
import { getHistory } from '../controllers/history.controller.js';
import { optionalJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalJWT, getHistory);

export default router;
