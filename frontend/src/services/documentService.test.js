import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadDocument, fetchDocuments, getDownloadUrl, uploadDocument } from './documentService';

afterEach(() => vi.restoreAllMocks());

describe('documentService', () => {
  it('lista documentos usando o prefixo /api', async () => {
    const documents = [{ id: 'document-id' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ documents }),
    }));

    await expect(fetchDocuments()).resolves.toEqual(documents);
    expect(fetch).toHaveBeenCalledWith('/api/documents', { signal: undefined });
  });

  it('rejeita uma resposta de listagem malformada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    await expect(fetchDocuments()).rejects.toThrow('A resposta da listagem de documentos é inválida.');
  });

  it('propaga a mensagem pública de erro da API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Documento não encontrado.' } }),
    }));

    await expect(downloadDocument('inexistente')).rejects.toThrow('Documento não encontrado.');
  });

  it('envia arquivo e proprietário normalizado como multipart', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'document-id' }),
    }));
    const file = new File(['conteúdo'], 'nota.txt', { type: 'text/plain' });

    await uploadDocument(file, '  tiago  ');

    const [, options] = fetch.mock.calls[0];
    expect(fetch.mock.calls[0][0]).toBe('/api/upload');
    expect(options.method).toBe('POST');
    expect(options.body.get('file')).toBe(file);
    expect(options.body.get('owner')).toBe('tiago');
  });

  it('codifica o identificador na URL de download', () => {
    expect(getDownloadUrl('../documento')).toBe('/api/documents/..%2Fdocumento/download');
  });
});