import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workspaceRoutes from './workspace.routes.js';
import boardRoutes from './board.routes.js';
import versionRoutes from './version.routes.js';
import exportRoutes from './export.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/boards', boardRoutes);
router.use('/versions', versionRoutes);
router.use('/export', exportRoutes);

export default router;
