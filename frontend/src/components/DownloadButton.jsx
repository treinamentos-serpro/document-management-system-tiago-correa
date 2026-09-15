import { useState } from 'react';
import { downloadDocument } from '../services/documentService';

export default function DownloadButton({ document, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    onError('');
    try {
      const blob = await downloadDocument(document.id);
      const objectUrl = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = document.originalName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      className="download-button"
      type="button"
      disabled={isDownloading}
      onClick={handleDownload}
      aria-label={`Baixar ${document.originalName}`}
    >
      {isDownloading ? 'Baixando...' : 'Baixar'} <span aria-hidden="true">↓</span>
    </button>
  );
}