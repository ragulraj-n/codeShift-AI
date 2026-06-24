import { Router } from 'express';
import { getUserProfile, updateUserProfile, changePassword } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validateChangePassword } from '../middlewares/authValidate.middleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);
router.post('/change-password', validateChangePassword, changePassword);

export default router;
