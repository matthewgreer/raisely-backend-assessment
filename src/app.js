const express = require('express');
const setupMiddleware = require('./middleware');

const app = express();
const port = process.env.PORT || 8080;

// Setup middleware
setupMiddleware(app);

// Setup routes
const routes = require('./api/routes');
app.use('/', routes);

// handle 404 errors for unknown routes
app.use(function(req, res, next) {
  res.status(404).json({ error: "Resource not found. Check the URL and try again." })
});

if (process.env.NODE_ENV !== 'TEST') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
