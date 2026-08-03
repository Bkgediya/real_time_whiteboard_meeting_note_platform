import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, X } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

interface ExportModalProps {
  boardId: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ boardId, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await axiosClient.get(`/export/${boardId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meeting_summary_${boardId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export PDF summary');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    try {
      const { data } = await axiosClient.get(`/export/${boardId}/png`);
      const blob = new Blob([JSON.stringify(data.snapshot, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `board_canvas_${boardId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Failed to export PNG/JSON representation');
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
            disabled={downloading}
            className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center gap-2 text-center transition-all"
          >
            <FileText className="w-8 h-8 text-blue-500" />
            <span className="font-semibold text-sm">PDF Meeting Summary</span>
            <span className="text-xs text-slate-500">Board info + rich notes</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl flex flex-col items-center gap-2 text-center transition-all"
          >
            <ImageIcon className="w-8 h-8 text-indigo-400" />
            <span className="font-semibold text-sm">Canvas Snapshot</span>
            <span className="text-xs text-slate-500">Vector canvas JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
