import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, X } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

interface ExportModalProps {
  boardId: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ boardId, onClose }) => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);

  const getCanvasDataURL = (): string => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const canvasImageDataURL = getCanvasDataURL();
      const response = await axiosClient.post(
        `/export/${boardId}/pdf`,
        { canvasImageBase64: canvasImageDataURL },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meeting_summary_${boardId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export PDF summary');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadPNG = async () => {
    setDownloadingPNG(true);
    try {
      const canvasImageDataURL = getCanvasDataURL();
      if (canvasImageDataURL) {
        const link = document.createElement('a');
        link.href = canvasImageDataURL;
        link.setAttribute('download', `board_diagram_${boardId}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert('Canvas diagram not found');
      }
    } catch (e) {
      alert('Failed to export PNG image');
    } finally {
      setDownloadingPNG(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-lg">Export Board & Notes</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 grid grid-cols-2 gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center gap-2 text-center transition-all disabled:opacity-50"
          >
            <FileText className="w-8 h-8 text-blue-500" />
            <span className="font-semibold text-sm">
              {downloadingPDF ? 'Generating...' : 'PDF Summary'}
            </span>
            <span className="text-xs text-slate-500">Diagram + Meeting Notes</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloadingPNG}
            className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl flex flex-col items-center gap-2 text-center transition-all disabled:opacity-50"
          >
            <ImageIcon className="w-8 h-8 text-indigo-400" />
            <span className="font-semibold text-sm">
              {downloadingPNG ? 'Exporting...' : 'PNG Diagram'}
            </span>
            <span className="text-xs text-slate-500">High-res canvas image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
