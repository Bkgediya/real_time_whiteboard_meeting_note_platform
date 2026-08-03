import { Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const exportService = new ExportService();

export class ExportController {
  async exportPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const boardId = req.params.id;
      const authorName = req.user?.email || 'User';
      const pdfBuffer = await exportService.exportBoardPDF(boardId, authorName);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="meeting_summary_${boardId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async exportPNG(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const boardId = req.params.id;
      const result = await exportService.exportBoardPNG(boardId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
