const fs = require('node:fs');
const path = require('node:path');

function createDocumentRepository(storageDir = process.env.STORAGE_DIR || path.resolve(__dirname, '../../storage')) {
  const resolvedStorageDir = path.resolve(storageDir);
  fs.mkdirSync(resolvedStorageDir, { recursive: true });
  const documents = new Map();

  return {
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

    async removeUploadedFile(file) {
      if (!file?.filename) {
        return;
      }

      const filePath = path.resolve(resolvedStorageDir, file.filename);
      if (path.dirname(filePath) !== resolvedStorageDir) {
        return;
      }
      await fs.promises.unlink(filePath).catch((error) => {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      });
    },

    async getFilePath(document) {
      const filePath = path.resolve(resolvedStorageDir, document.storedName);
      if (path.dirname(filePath) !== resolvedStorageDir) {
        return null;
      }

      try {
        const fileStats = await fs.promises.lstat(filePath);
        if (!fileStats.isFile() || fileStats.isSymbolicLink()) {
          return null;
        }

        const [realStorageDir, realFilePath] = await Promise.all([
          fs.promises.realpath(resolvedStorageDir),
          fs.promises.realpath(filePath),
        ]);
        return path.dirname(realFilePath) === realStorageDir ? realFilePath : null;
      } catch (error) {
        if (error.code === 'ENOENT') {
          return null;
        }
        throw error;
      }
    },
  };
}

module.exports = { createDocumentRepository };