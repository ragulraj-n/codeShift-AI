import { Router } from 'express';
import { getSystemConfig } from '../controllers/helper.controller.js';

const router = Router();

router.get('/config', getSystemConfig);

export default router;
