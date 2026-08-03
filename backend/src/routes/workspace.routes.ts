import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkWorkspaceRole } from '../middlewares/rbac.middleware.js';

const router = Router();
const workspaceController = new WorkspaceController();

router.use(authenticateJWT);

router.post('/', workspaceController.create);
router.get('/', workspaceController.getAll);
router.get('/:id', checkWorkspaceRole('viewer'), workspaceController.getById);
router.put('/:id', checkWorkspaceRole('owner'), workspaceController.update);
router.delete('/:id', checkWorkspaceRole('owner'), workspaceController.delete);

router.post('/:id/invite', checkWorkspaceRole('owner'), workspaceController.inviteMember);
router.post('/accept-invite/:token', workspaceController.acceptInvitation);
router.delete('/:id/members/:memberId', checkWorkspaceRole('owner'), workspaceController.removeMember);

export default router;
