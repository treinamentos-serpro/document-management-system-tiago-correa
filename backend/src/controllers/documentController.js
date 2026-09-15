function createDocumentController(service) {
  return {
    upload: async (req, res, next) => {
      try {
        const document = await service.upload(req.file, req.body.owner);
        res.status(201).json(toPublicDocument(document));
      } catch (error) {
        next(error);
      }
    },

    list: async (req, res, next) => {
      try {
        const documents = await service.list();
        res.json({ documents: documents.map(toPublicDocument) });
      } catch (error) {
        next(error);
      }
    },

    download: async (req, res, next) => {
      try {
        const { document, filePath } = await service.getDownload(req.params.id);
        res.download(filePath, document.originalName, {
          headers: { 'Content-Type': document.mimeType || 'application/octet-stream' },
        }, next);
      } catch (error) {
        next(error);
      }
    },
  };
}

function toPublicDocument(document) {
  const { storedName, storagePath, ...publicDocument } = document;
  return publicDocument;
}

module.exports = { createDocumentController };