const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// База данных ключевых слов
const keywordDB = {
  'javascript': [
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    'https://javascript.info',
    'https://www.w3schools.com/js/'
  ],
  'nodejs': [
    'https://nodejs.org',
    'https://www.tutorialspoint.com/nodejs/',
    'https://www.w3schools.com/nodejs/'
  ]
};

// Корневой маршрут
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// API для получения URL по ключевому слову
app.get('/api/urls', (req, res) => {
  const keyword = req.query.keyword?.toLowerCase();
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });
  
  if (keywordDB[keyword]) {
    res.json({ urls: keywordDB[keyword] });
  } else {
    res.status(404).json({ error: 'Keyword not found' });
  }
});

// API для загрузки контента
app.get('/api/download', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const response = await axios.get(url);
    res.json({
      content: response.data,
      size: response.headers['content-length'] || 'Unknown',
      url: url
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to download content',
      details: err.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});