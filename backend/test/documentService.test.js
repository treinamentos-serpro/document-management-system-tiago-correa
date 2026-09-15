const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDocumentService } = require('../src/services/documentService');

function createRepository(overrides = {}) {
  return {
    save: async (file, owner) => ({ id: 'document-id', owner, ...file }),
    list: async () => [],
    findById: async () => null,
    getFilePath: async () => null,
    removeUploadedFile: async () => {},
    ...overrides,
  };
}

test('usa o proprietário padrão normalizado no upload', async () => {
  const service = createDocumentService(createRepository(), { defaultOwner: '  tiago  ' });

  const document = await service.upload({ originalname: 'nota.txt', filename: 'id.txt' });

  assert.equal(document.owner, 'tiago');
});

test('rejeita proprietário inválido e remove o arquivo enviado', async () => {
  let removedFile;
  const repository = createRepository({
    removeUploadedFile: async (file) => {
      removedFile = file;
    },
  });
  const service = createDocumentService(repository);
  const file = { originalname: 'nota.txt', filename: 'id.txt' };

  await assert.rejects(
    service.upload(file, 'usuario\nforjado'),
    (error) => error.code === 'INVALID_OWNER' && error.statusCode === 400,
  );
  assert.equal(removedFile, file);
});

test('remove o arquivo quando a persistência dos metadados falha', async () => {
  const persistenceError = new Error('falha de persistência');
  let wasRemoved = false;
  const repository = createRepository({
    save: async () => { throw persistenceError; },
    removeUploadedFile: async () => { wasRemoved = true; },
  });
  const service = createDocumentService(repository);

  await assert.rejects(
    service.upload({ originalname: 'nota.txt', filename: 'id.txt' }, 'tiago'),
    persistenceError,
  );
  assert.equal(wasRemoved, true);
});

test('retorna erro de domínio quando o arquivo do documento não existe', async () => {
  const repository = createRepository({
    findById: async () => ({ id: 'document-id', storedName: 'document-id.txt' }),
  });
  const service = createDocumentService(repository);

  await assert.rejects(
    service.getDownload('document-id'),
    (error) => error.code === 'FILE_NOT_FOUND' && error.statusCode === 404,
  );
});