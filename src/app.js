const express = require('express');
const setupMiddleware = require('./middleware');

const app = express();
const port = process.env.PORT || 8080;

// Setup middleware
setupMiddleware(app);

// Setup routes
const routes = require('./api/routes');
app.use('/', routes);

if (process.env.NODE_ENV !== 'TEST') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
