import { Router } from 'express';
import { BoardController } from '../controllers/board.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { checkWorkspaceRole, checkBoardRole } from '../middlewares/rbac.middleware.js';

const router = Router();
const boardController = new BoardController();

// Public share link route (unauthenticated allowed)
router.get('/public/:shareToken', boardController.getPublicBoard);

// Authenticated routes below
router.use(authenticateJWT);

router.post('/', checkWorkspaceRole('editor'), boardController.create);
router.get('/workspace/:workspaceId', checkWorkspaceRole('viewer'), boardController.getWorkspaceBoards);

router.get('/invitations/pending', boardController.getPendingBoardInvitations);
router.post('/accept-invite/:token', boardController.acceptBoardInvitation);
router.post('/decline-invite/:token', boardController.declineBoardInvitation);

router.get('/:id', checkBoardRole('viewer'), boardController.getById);
router.post('/:id/invite', checkBoardRole('editor'), boardController.inviteToBoard);
router.delete('/:id/members/:memberId', checkBoardRole('editor'), boardController.removeBoardMember);

router.put('/:id/snapshot', checkBoardRole('editor'), boardController.updateSnapshot);
router.put('/:id/star', checkBoardRole('viewer'), boardController.toggleStar);
router.delete('/:id/delete', checkBoardRole('owner'), boardController.delete);

router.post('/:id/share-link', checkBoardRole('owner'), boardController.generateShareLink);

export default router;
