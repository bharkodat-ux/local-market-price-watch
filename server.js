const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3200;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data', 'prices.json');

app.get('/api/prices', (req, res) => {
  const item = req.query.item ? req.query.item.toLowerCase() : null;
  const vendor = req.query.vendor ? req.query.vendor.toLowerCase() : null;
  fs.readFile(dataPath, 'utf8', (err, raw) => {
    if (err) return res.status(500).json({ error: 'failed to read data' });
    let list = JSON.parse(raw || '[]');
    if (item) {
      list = list.filter(p => (p.item||'').toLowerCase().includes(item));
    }
    if (vendor) {
      list = list.filter(p => (p.vendor||'').toLowerCase().includes(vendor));
    }
    res.json(list);
  });
});

app.post('/api/prices', (req, res) => {
  const entry = req.body;
  if (!entry || !entry.item || !entry.vendor || typeof entry.price !== 'number') {
    return res.status(400).json({ error: 'invalid entry, required: item, vendor, price (number)' });
  }
  entry.date = entry.date || new Date().toISOString();
  fs.readFile(dataPath, 'utf8', (err, raw) => {
    const list = raw ? JSON.parse(raw) : [];
    list.push(entry);
    fs.writeFile(dataPath, JSON.stringify(list, null, 2), 'utf8', (werr) => {
      if (werr) return res.status(500).json({ error: 'failed to save' });
      res.status(201).json(entry);
    });
  });
});

app.listen(PORT, () => console.log(`local-market-price-watch running on http://localhost:${PORT}`));
