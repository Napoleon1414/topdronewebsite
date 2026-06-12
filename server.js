const express = require('express');
const path = require('path');
const app = express();

// Serve the static site (index.html + assets/) from the repo root
app.use(express.static(__dirname));

// Health check (DigitalOcean uses this)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Fallback: send index.html for any unmatched path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
