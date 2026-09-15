async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(body.error?.message || 'Não foi possível concluir a operação.');
}

export async function fetchDocuments() {
  const response = await parseResponse(await fetch('/api/documents'));
  const body = await response.json();
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