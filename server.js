const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('*', (req, res) => {
  const filePath = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(fs.readFileSync(filePath, 'utf8'));
  }
  res.send('<h1>File not found</h1>');
});

module.exports = app;
