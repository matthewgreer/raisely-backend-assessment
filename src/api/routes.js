const express = require('express');

const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
  res.send('Welcome to my fundraising API, Raisely team!');
});

module.exports = router;
