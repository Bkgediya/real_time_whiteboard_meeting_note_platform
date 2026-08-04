import PDFDocument from 'pdfkit';

export interface PDFExportData {
  boardTitle: string;
  notesContent: string;
  authorName?: string;
  createdAt?: string;
  elementCount?: number;
  canvasImageBase64?: string;
}

export const generateMeetingNotesPDF = (data: PDFExportData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    // Page Header Banner Card
    doc.rect(40, 40, 515, 65).fill('#0F172A');

    doc
      .fillColor('#FFFFFF')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('COLLABORATIVE MEETING SUMMARY', 55, 52);

    doc
      .fillColor('#94A3B8')
      .fontSize(10)
      .font('Helvetica')
      .text(`Board: ${data.boardTitle}  •  Created by: ${data.authorName || 'User'}  •  Date: ${new Date().toLocaleDateString()}`, 55, 76);

    doc.y = 120;

    // Section 1: Whiteboard Canvas Diagram
    if (data.canvasImageBase64) {
      try {
        const base64Data = data.canvasImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');

        doc
          .fillColor('#1E293B')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text('1. Whiteboard Canvas Diagram', 40, doc.y);

        doc.moveDown(0.4);
        const imageStartY = doc.y;
        const boxHeight = 230;

        // Background card container for image
        doc.rect(40, imageStartY, 515, boxHeight).fillAndStroke('#020617', '#334155');

        // Render embedded canvas image inside box
        doc.image(imgBuffer, 45, imageStartY + 5, {
          fit: [505, boxHeight - 10],
          align: 'center',
          valign: 'center',
        });

        // Crucial fix: Advance doc.y past the image height so text never overlaps!
        doc.y = imageStartY + boxHeight + 25;
      } catch (e) {
        console.error('[PDF Generator] Error embedding canvas image:', e);
        doc.moveDown(1);
      }
    }

    // Check if new page is needed for notes
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 40;
    }

    // Section 2: Meeting Notes
    doc
      .fillColor('#1E293B')
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('2. Collaborative Meeting Notes', 40, doc.y);

    doc.moveDown(0.5);
    const notesStartY = doc.y;

    const cleanNotes = data.notesContent?.trim() || 'No meeting notes recorded for this session.';

    // Render Notes Container Box
    doc
      .rect(40, notesStartY, 515, 140)
      .fillAndStroke('#F8FAFC', '#E2E8F0');

    doc
      .fillColor('#334155')
      .fontSize(10)
      .font('Helvetica')
      .text(cleanNotes, 52, notesStartY + 12, {
        width: 490,
        height: 116,
        lineGap: 4,
      });

    doc.y = notesStartY + 155;

    // Footer
    doc
      .fillColor('#94A3B8')
      .fontSize(9)
      .font('Helvetica')
      .text('Generated automatically by CollabBoard Whiteboard & Meeting Platform', 40, 780, {
        align: 'center',
        width: 515,
      });

    doc.end();
  });
};
