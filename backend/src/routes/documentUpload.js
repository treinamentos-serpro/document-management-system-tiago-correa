const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

function createDocumentUpload(storageDir, maxFileSize = process.env.MAX_FILE_SIZE) {
  const resolvedStorageDir = path.resolve(storageDir);
  const fileSize = parsePositiveInteger(maxFileSize, DEFAULT_MAX_FILE_SIZE, 'MAX_FILE_SIZE');
  fs.mkdirSync(resolvedStorageDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: resolvedStorageDir,
    filename: (req, file, callback) => {
      const extension = sanitizeExtension(path.extname(file.originalname));
      callback(null, `${crypto.randomUUID()}${extension}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize,
      files: 1,
      fields: 1,
      parts: 3,
      fieldNameSize: 100,
      fieldSize: 256,
    },
  });
}

function parsePositiveInteger(value, fallback, name) {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsedValue = Number(value);
  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} deve ser um número inteiro positivo.`);
  }
  return parsedValue;
}

function sanitizeExtension(extension) {
  return extension.toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 16);
}

module.exports = { createDocumentUpload };