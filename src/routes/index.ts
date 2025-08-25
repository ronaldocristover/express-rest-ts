import { Router } from 'express';
import { env } from '@/config/env';
import healthRoutes from './health.route';
import userRoutes from '@/services/user-service/src/routes/user.route';

const router = Router();

const API_BASE = `/api/${env.API_VERSION}`;

router.use(`${API_BASE}/health`, healthRoutes);
router.use(`${API_BASE}/users`, userRoutes);

export default router;