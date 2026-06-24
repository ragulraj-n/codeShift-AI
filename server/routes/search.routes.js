import { Router } from 'express';
import { globalSearch } from '../controllers/search.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', verifyJWT, globalSearch);

export default router;
