import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  listFavorites
} from '../controllers/favorite.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Secure all favorite routes
router.use(verifyJWT);

router.post('/', addFavorite);
router.get('/', listFavorites);
router.delete('/:projectId', removeFavorite);

export default router;
