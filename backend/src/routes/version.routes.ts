import { Router } from 'express';
import { VersionController } from '../controllers/version.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkBoardRole } from '../middlewares/rbac.middleware.js';

const router = Router();
const versionController = new VersionController();

router.use(authenticateJWT);

router.get('/:id/history', checkBoardRole('viewer'), versionController.getHistory);
router.post('/:id/restore/:versionId', checkBoardRole('editor'), versionController.restore);

export default router;
