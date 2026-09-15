import { getDownloadUrl } from '../services/documentService';

export default function DownloadButton({ document }) {
  return (
    <a className="download-button" href={getDownloadUrl(document.id)} download aria-label={`Baixar ${document.originalName}`}>
      Baixar <span aria-hidden="true">↓</span>
    </a>
  );
}