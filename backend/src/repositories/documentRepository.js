const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');

function createDocumentRepository(storageDir = process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage')) {
  fs.mkdirSync(storageDir, { recursive: true });
  const documents = new Map();
  const storage = multer.diskStorage({
    destination: storageDir,
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${crypto.randomUUID()}${extension}`);
    },
  });

  return {
    upload: multer({
      storage,
      limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
    }),

    async save(file, owner) {
      const id = path.basename(file.filename, path.extname(file.filename));
      const document = {
        id,
        originalName: file.originalname,
        storedName: file.filename,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
        mimeType: file.mimetype,
      };
      documents.set(id, document);
      return document;
    },

    async list() {
      return [...documents.values()].sort((first, second) =>
        second.uploadedAt.localeCompare(first.uploadedAt));
    },

    async findById(id) {
      return documents.get(id) || null;
    },

    getFilePath(document) {
      const filePath = path.resolve(storageDir, document.storedName);
      if (path.dirname(filePath) !== path.resolve(storageDir)) {
        return null;
      }
      return filePath;
    },
  };
}

module.exports = { createDocumentRepository };