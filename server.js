const express = require('express');
const fetch = require('node-fetch');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = process.env.TARGET_URL || "https://www.pwthor.site";

// Proxy all requests to the target site
app.use('/', async (req, res) => {
  try {
    const targetUrl = TARGET_URL + req.originalUrl;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,/;q=0.8'
      }
    });

    let body = await response.text();

    // Optional: Replace logo/image URLs here
    body = body.replace(/https:\/\/www\.pwthor\.site\/logo\.png/g, '/logo.png');

    res.status(response.status).send(body);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).send("Proxy Server Error");
  }
});

app.listen(PORT, () => {
  console.log(Proxy server running on port ${PORT});
});
