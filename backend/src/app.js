const express = require('express');
const { createDocumentRepository } = require('./repositories/documentRepository');
const { createDocumentService } = require('./services/documentService');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRoutes } = require('./routes/documentRoutes');

function createApp(options = {}) {
  const app = express();
  const repository = options.repository || createDocumentRepository(options.storageDir);
  const service = createDocumentService(repository, {
    defaultOwner: options.defaultOwner,
  });
  const controller = createDocumentController(service);

  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(createDocumentRoutes({ controller, upload: repository.upload }));

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho permitido.' },
      });
    }

    const status = error.statusCode || 500;
    return res.status(status).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Ocorreu um erro interno.',
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
