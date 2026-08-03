import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkBoardRole } from '../middlewares/rbac.middleware.js';

const router = Router();
const exportController = new ExportController();

router.use(authenticateJWT);

router.get('/:id/pdf', checkBoardRole('viewer'), exportController.exportPDF);
router.get('/:id/png', checkBoardRole('viewer'), exportController.exportPNG);

export default router;
