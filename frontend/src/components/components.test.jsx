import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadComponent from './UploadComponent';
import DocumentList from './DocumentList';
import DownloadButton from './DownloadButton';
import { downloadDocument, uploadDocument } from '../services/documentService';

vi.mock('../services/documentService', () => ({
  downloadDocument: vi.fn(),
  uploadDocument: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UploadComponent', () => {
  it('informa quando nenhum arquivo foi selecionado', async () => {
    const onError = vi.fn();
    render(<UploadComponent onUploaded={vi.fn()} onError={onError} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar documento' }));

    expect(onError).toHaveBeenCalledWith('Selecione um arquivo antes de enviar.');
    expect(uploadDocument).not.toHaveBeenCalled();
  });

  it('envia o documento e atualiza a listagem', async () => {
    uploadDocument.mockResolvedValue({ id: 'document-id' });
    const onUploaded = vi.fn().mockResolvedValue();
    render(<UploadComponent onUploaded={onUploaded} onError={vi.fn()} />);
    const file = new File(['conteúdo'], 'nota.txt', { type: 'text/plain' });

    await userEvent.upload(screen.getByLabelText('Arquivo'), file);
    await userEvent.type(screen.getByLabelText('Proprietário'), 'tiago');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar documento' }));

    expect(uploadDocument).toHaveBeenCalledWith(file, 'tiago');
    expect(onUploaded).toHaveBeenCalledOnce();
    expect(await screen.findByRole('status')).toHaveTextContent('Documento enviado com sucesso.');
  });
});

describe('DocumentList', () => {
  it('mostra estado vazio e fallbacks para metadados inválidos', () => {
    const { rerender } = render(<DocumentList documents={[]} onError={vi.fn()} />);
    expect(screen.getByText('Ainda não há documentos nesta biblioteca.')).toBeInTheDocument();

    rerender(<DocumentList documents={[{
      id: 'document-id',
      originalName: 'nota.txt',
      size: Number.NaN,
      uploadedAt: 'data-inválida',
    }]} onError={vi.fn()} />);

    expect(screen.getByText(/Tamanho desconhecido · Sem proprietário · Data desconhecida/)).toBeInTheDocument();
  });
});

describe('DownloadButton', () => {
  it('exibe o erro retornado pelo download', async () => {
    downloadDocument.mockRejectedValue(new Error('Documento não encontrado.'));
    const onError = vi.fn();
    render(<DownloadButton document={{ id: 'document-id', originalName: 'nota.txt' }} onError={onError} />);

    await userEvent.click(screen.getByRole('button', { name: 'Baixar nota.txt' }));

    expect(onError).toHaveBeenNthCalledWith(1, '');
    expect(onError).toHaveBeenNthCalledWith(2, 'Documento não encontrado.');
  });
});