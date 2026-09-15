import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadComponent({ onUploaded, onError }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      onError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setSuccess('');
    onError('');
    try {
      await uploadDocument(file, owner);
      setFile(null);
      event.target.reset();
      setSuccess('Documento enviado com sucesso.');
      await onUploaded();
    } catch (error) {
      onError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div className="upload-icon" aria-hidden="true">+</div>
      <div className="upload-fields">
        <div>
          <p className="eyebrow">NOVO DOCUMENTO</p>
          <h2>Adicionar arquivo</h2>
          <p className="muted">Escolha um arquivo para guardar no armazenamento local.</p>
        </div>
        <div className="file-field">
          <label htmlFor="document-file">Arquivo</label>
          <input id="document-file" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <strong>{file?.name || 'Selecionar arquivo'}</strong>
        </div>
        <div className="owner-field">
          <label htmlFor="document-owner">Proprietário</label>
          <input id="document-owner" value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Opcional" />
        </div>
        <button type="submit" disabled={isUploading}>{isUploading ? 'Enviando...' : 'Enviar documento'}</button>
        {success && <p className="feedback success" role="status">{success}</p>}
      </div>
    </form>
  );
}