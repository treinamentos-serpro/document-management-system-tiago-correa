function createDocumentService(repository, options = {}) {
  const defaultOwner = normalizeOwner(options.defaultOwner || process.env.DEFAULT_OWNER || 'anonymous');

  return {
    async upload(file, owner) {
      if (!file) {
        const error = new Error('É necessário enviar um arquivo.');
        error.code = 'FILE_REQUIRED';
        error.statusCode = 400;
        throw error;
      }

      try {
        validateOriginalName(file.originalname);
        return await repository.save(file, normalizeOwner(owner || defaultOwner));
      } catch (error) {
        await repository.removeUploadedFile(file);
        throw error;
      }
    },

    async list() {
      return repository.list();
    },

    async getDownload(id) {
      const document = await repository.findById(id);
      if (!document) {
        const error = new Error('Documento não encontrado.');
        error.code = 'DOCUMENT_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      const filePath = await repository.getFilePath(document);
      if (!filePath) {
        const error = new Error('Arquivo do documento não está disponível.');
        error.code = 'FILE_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      return { document, filePath };
    },
  };
}

function normalizeOwner(owner) {
  const normalizedOwner = String(owner).trim();
  if (!normalizedOwner || normalizedOwner.length > 100 || /[\u0000-\u001f\u007f]/.test(normalizedOwner)) {
    const error = new Error('O proprietário informado é inválido.');
    error.code = 'INVALID_OWNER';
    error.statusCode = 400;
    throw error;
  }
  return normalizedOwner;
}

function validateOriginalName(originalName) {
  if (!originalName || originalName.length > 255 || /[\u0000-\u001f\u007f]/.test(originalName)) {
    const error = new Error('O nome do arquivo é inválido.');
    error.code = 'INVALID_FILE_NAME';
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { createDocumentService };