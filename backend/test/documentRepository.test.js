const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDocumentRepository } = require('../src/repositories/documentRepository');

function createTemporaryStorage(t) {
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-repository-'));
  t.after(() => fs.rmSync(storageDir, { recursive: true, force: true }));
  return storageDir;
}

test('resolve apenas arquivos regulares dentro do armazenamento', async (t) => {
  const storageDir = createTemporaryStorage(t);
  const repository = createDocumentRepository(storageDir);
  const storedName = 'document-id.txt';
  fs.writeFileSync(path.join(storageDir, storedName), 'conteúdo');

  const filePath = await repository.getFilePath({ storedName });

  assert.equal(filePath, path.join(storageDir, storedName));
});

test('bloqueia path traversal no nome armazenado', async (t) => {
  const storageDir = createTemporaryStorage(t);
  const repository = createDocumentRepository(storageDir);

  const filePath = await repository.getFilePath({ storedName: '../segredo.txt' });

  assert.equal(filePath, null);
});

test('bloqueia link simbólico que aponta para fora do armazenamento', async (t) => {
  const storageDir = createTemporaryStorage(t);
  const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-outside-'));
  t.after(() => fs.rmSync(outsideDir, { recursive: true, force: true }));
  const outsideFile = path.join(outsideDir, 'segredo.txt');
  fs.writeFileSync(outsideFile, 'segredo');
  fs.symlinkSync(outsideFile, path.join(storageDir, 'link.txt'));
  const repository = createDocumentRepository(storageDir);

  const filePath = await repository.getFilePath({ storedName: 'link.txt' });

  assert.equal(filePath, null);
});

test('não remove arquivos fora do armazenamento', async (t) => {
  const storageDir = createTemporaryStorage(t);
  const outsideFile = path.join(path.dirname(storageDir), 'dms-protected.txt');
  fs.writeFileSync(outsideFile, 'preservar');
  t.after(() => fs.rmSync(outsideFile, { force: true }));
  const repository = createDocumentRepository(storageDir);

  await repository.removeUploadedFile({ filename: '../dms-protected.txt' });

  assert.equal(fs.existsSync(outsideFile), true);
});