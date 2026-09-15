import { useEffect, useRef, useState } from 'react';
import { fetchDocuments } from './services/documentService';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  async function loadDocuments(options = {}) {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    try {
      const loadedDocuments = await fetchDocuments(options);
      if (requestId === latestRequest.current) {
        setDocuments(loadedDocuments);
        setError('');
      }
    } catch (loadError) {
      if (loadError.name !== 'AbortError' && requestId === latestRequest.current) {
        setError(loadError.message);
      }
    } finally {
      if (requestId === latestRequest.current) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadDocuments({ signal: controller.signal });
    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ARQUIVO LOCAL</p>
          <h1>Seus documentos,<br /><em>sempre por perto.</em></h1>
          <p className="hero-copy">Envie, organize e baixe seus arquivos em um espaço simples e seguro.</p>
        </div>
        <span className="hero-mark" aria-hidden="true">DMS</span>
      </header>

      <section className="workspace">
        <UploadComponent onUploaded={loadDocuments} onError={setError} />

        <section className="documents-section" aria-labelledby="documents-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BIBLIOTECA</p>
              <h2 id="documents-heading">Documentos recentes</h2>
            </div>
            <span className="document-count">{documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
          </div>
          {error && <p className="feedback error" role="alert">{error}</p>}
          {isLoading ? <p className="empty-state">Carregando documentos...</p> : <DocumentList documents={documents} onError={setError} />}
        </section>
      </section>
    </main>
  );
}
