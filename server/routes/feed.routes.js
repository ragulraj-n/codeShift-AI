import { Router } from 'express';
import { getFeed } from '../controllers/feed.controller.js';
import { optionalJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalJWT, getFeed);

export default router;
