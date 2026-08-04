import { Board } from '../models/Board.js';
import { Note } from '../models/Note.js';
import { generateMeetingNotesPDF } from '../utils/pdf.generator.js';

export class ExportService {
  async exportBoardPDF(boardId: string, authorName?: string, canvasImageBase64?: string): Promise<Buffer> {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const note = await Note.findOne({ boardId });
    const elementsCount = board.snapshot?.elements?.length || 0;

    const pdfBuffer = await generateMeetingNotesPDF({
      boardTitle: board.title,
      notesContent: note?.content || '',
      authorName: authorName || 'Anonymous',
      elementCount: elementsCount,
      canvasImageBase64,
    });

    return pdfBuffer;
  }

  async exportBoardPNG(boardId: string) {
    const board = await Board.findById(boardId);
    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    return {
      title: board.title,
      snapshot: board.snapshot,
    };
  }
}
