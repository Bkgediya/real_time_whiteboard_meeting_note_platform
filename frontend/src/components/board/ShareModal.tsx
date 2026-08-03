import React, { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { boardApi } from '../../api/boardApi';

interface ShareModalProps {
  boardId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ boardId, onClose }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const data = await boardApi.generateShareLink(boardId, 7);
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
    } catch (e) {
      alert('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-lg">Share Board</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6">
          <p className="text-sm text-slate-400 mb-4">
            Generate a public view-only access link valid for 7 days. Anyone with the link can view the whiteboard and meeting notes.
          </p>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition-colors text-white"
            >
              {loading ? 'Generating Link...' : 'Create Public Share Link'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
