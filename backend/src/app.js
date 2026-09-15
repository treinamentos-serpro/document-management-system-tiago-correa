const express = require('express');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRoutes } = require('./routes/documentRoutes');
const { createDocumentUpload } = require('./routes/documentUpload');

const DEFAULT_STORAGE_DIR = require('node:path').resolve(__dirname, '../storage');

function createApp(options = {}) {
  const app = express();
  const storageDir = options.storageDir || process.env.STORAGE_DIR || DEFAULT_STORAGE_DIR;
  const repository = options.repository || createDocumentRepository(storageDir);
  const upload = options.upload || createDocumentUpload(storageDir, options.maxFileSize);
  const service = createDocumentService(repository, {
    defaultOwner: options.defaultOwner,
  });
  const controller = createDocumentController(service);

  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(createDocumentRoutes({ controller, upload }));

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho permitido.' },
      });
    }

    if (typeof error.code === 'string' && error.code.startsWith('LIMIT_')) {
      return res.status(400).json({
        error: { code: 'INVALID_MULTIPART', message: 'Os dados do upload são inválidos.' },
      });
    }

    const status = error.statusCode || 500;
    return res.status(status).json({
      error: {
        code: error.statusCode ? error.code : 'INTERNAL_ERROR',
        message: error.statusCode ? error.message : 'Ocorreu um erro interno.',
      },
    });
  });

  return app;
}

const app = createApp();
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
