async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(body.error?.message || 'Não foi possível concluir a operação.');
}

export async function fetchDocuments(options = {}) {
  const response = await parseResponse(await fetch('/api/documents', { signal: options.signal }));
  const body = await response.json();
  if (!Array.isArray(body.documents)) {
    throw new Error('A resposta da listagem de documentos é inválida.');
  }
  return body.documents;
}

export async function uploadDocument(file, owner = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (owner.trim()) {
    formData.append('owner', owner.trim());
  }

  const response = await parseResponse(await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  }));
  return response.json();
}

export function getDownloadUrl(id) {
  return `/api/documents/${encodeURIComponent(id)}/download`;
}

export async function downloadDocument(id) {
  const response = await parseResponse(await fetch(getDownloadUrl(id)));
  return response.blob();
}