const express = require('express');
const setupMiddleware = (app) => {
  app.use(express.json()); // Parse JSON bodies

  // any future middleware can be added here
};

module.exports = setupMiddleware;
