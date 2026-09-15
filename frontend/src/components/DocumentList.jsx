import DownloadButton from './DownloadButton';

function formatSize(size) {
  if (!Number.isFinite(size) || size < 0) return 'Tamanho desconhecido';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(uploadedAt) {
  const date = new Date(uploadedAt);
  return Number.isNaN(date.getTime()) ? 'Data desconhecida' : date.toLocaleDateString('pt-BR');
}

export default function DocumentList({ documents, onError }) {
  if (!documents.length) {
    return <p className="empty-state">Ainda não há documentos nesta biblioteca.</p>;
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <article className="document-row" key={document.id}>
          <div className="document-type" aria-hidden="true">DOC</div>
          <div className="document-info">
            <h3>{document.originalName}</h3>
            <p>{formatSize(document.size)} · {document.owner || 'Sem proprietário'} · {formatDate(document.uploadedAt)}</p>
          </div>
          <DownloadButton document={document} onError={onError} />
        </article>
      ))}
    </div>
  );
}