const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // Return the official contact email for the site.
  // This allows the frontend to fetch the official email rather than hardcoding it.
  res.json({ email: 'vibestore2027@gmail.com' });
});

module.exports = router;
