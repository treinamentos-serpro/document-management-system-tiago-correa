const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const appModule = require('../src/app');
const app = appModule;

async function startTestServer(t, options = {}) {
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
  const server = http.createServer(appModule.createApp({ storageDir, ...options }));
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    fs.rmSync(storageDir, { recursive: true, force: true });
  });

  return { baseUrl: `http://127.0.0.1:${port}`, storageDir };
}

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento', async (t) => {
  const { baseUrl } = await startTestServer(t);

  const formData = new FormData();
  formData.append('file', new Blob(['conteudo de teste'], { type: 'text/plain' }), 'nota.txt');
  formData.append('owner', 'tiago');
  const uploadResponse = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
  assert.strictEqual(uploadResponse.status, 201);
  const uploadedDocument = await uploadResponse.json();
  assert.strictEqual(uploadedDocument.originalName, 'nota.txt');
  assert.strictEqual(uploadedDocument.owner, 'tiago');

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(listResponse.status, 200);
  const list = await listResponse.json();
  assert.strictEqual(list.documents.length, 1);
  assert.strictEqual(list.documents[0].id, uploadedDocument.id);

  const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');
});

test('rejeita upload sem arquivo e download desconhecido', async (t) => {
  const { baseUrl } = await startTestServer(t);

  const missingFileResponse = await fetch(`${baseUrl}/upload`, { method: 'POST', body: new FormData() });
  assert.strictEqual(missingFileResponse.status, 400);
  assert.strictEqual((await missingFileResponse.json()).error.code, 'FILE_REQUIRED');

  const missingDocumentResponse = await fetch(`${baseUrl}/documents/unknown/download`);
  assert.strictEqual(missingDocumentResponse.status, 404);
  assert.strictEqual((await missingDocumentResponse.json()).error.code, 'DOCUMENT_NOT_FOUND');
});

test('rejeita arquivo acima do limite sem deixar arquivo órfão', async (t) => {
  const { baseUrl, storageDir } = await startTestServer(t, { maxFileSize: 4 });

  const formData = new FormData();
  formData.append('file', new Blob(['arquivo grande']), 'grande.txt');
  const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });

  assert.strictEqual(response.status, 413);
  assert.strictEqual((await response.json()).error.code, 'FILE_TOO_LARGE');
  assert.deepStrictEqual(fs.readdirSync(storageDir), []);
});

test('retorna 404 quando o arquivo físico foi removido', async (t) => {
  const { baseUrl, storageDir } = await startTestServer(t);
  const formData = new FormData();
  formData.append('file', new Blob(['conteudo']), 'nota.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
  const document = await uploadResponse.json();
  fs.rmSync(path.join(storageDir, fs.readdirSync(storageDir)[0]));

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`);

  assert.strictEqual(response.status, 404);
  assert.strictEqual((await response.json()).error.code, 'FILE_NOT_FOUND');
});

test('não expõe mensagens de erros internos', async (t) => {
  const repository = {
    list: async () => { throw new Error('/segredo/caminho-interno'); },
  };
  const upload = { single: () => (req, res, next) => next() };
  const { baseUrl } = await startTestServer(t, { repository, upload });

  const response = await fetch(`${baseUrl}/documents`);
  const body = await response.json();

  assert.strictEqual(response.status, 500);
  assert.strictEqual(body.error.code, 'INTERNAL_ERROR');
  assert.strictEqual(body.error.message, 'Ocorreu um erro interno.');
});
