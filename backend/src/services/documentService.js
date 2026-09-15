function createDocumentService(repository, options = {}) {
  const defaultOwner = options.defaultOwner || process.env.DEFAULT_OWNER || 'anonymous';

  return {
    async upload(file, owner) {
      if (!file) {
        const error = new Error('É necessário enviar um arquivo.');
        error.code = 'FILE_REQUIRED';
        error.statusCode = 400;
        throw error;
      }

      return repository.save(file, owner || defaultOwner);
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

      const filePath = repository.getFilePath(document);
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

module.exports = { createDocumentService };