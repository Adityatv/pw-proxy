
/**
 * pw-site-proxy - Reverse proxy for an entire site with header image replacement
 *
 * Usage:
 *   Set environment variables:
 *     TARGET_URL - the live site to proxy (e.g. https://pwthor.site)
 *     REPLACE_IMAGE_URL - full URL of the image you want to show in the header
 *
 * Example:
 *   TARGET_URL=https://pwthor.site REPLACE_IMAGE_URL=https://... node server.js
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cheerio = require('cheerio');

const TARGET = process.env.TARGET_URL || 'https://pwthor.site';
const REPLACE_IMAGE = process.env.REPLACE_IMAGE_URL || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTejUBwYJV9w5teT21Z3vx2I9IObd-XK1uf1YoO07gJGi0nfyG9m22Oqc&s=10';
const PORT = process.env.PORT || 3000;

const app = express();

// Helper to set proper headers and send body
function sendResponse(res, proxyRes, body) {
  // copy content-type and status code
  if (proxyRes && proxyRes.headers) {
    const ct = proxyRes.headers['content-type'];
    if (ct) res.setHeader('Content-Type', ct);
  }
  res.status(proxyRes ? proxyRes.statusCode : 200);
  res.send(body);
}

app.use('*', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  selfHandleResponse: true,
  onProxyReq: (proxyReq, req, res) => {
    // Remove accept-encoding so we get uncompressed responses and can modify HTML.
    proxyReq.removeHeader('accept-encoding');
  },
  onProxyRes: async (proxyRes, req, res) => {
    try {
      const chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        const contentType = proxyRes.headers['content-type'] || '';

        // If HTML, parse and replace header image
        if (contentType.includes('text/html')) {
          const html = bodyBuffer.toString('utf8');
          const $ = cheerio.load(html, { decodeEntities: false });

          // Strategy (tries multiple ways):
          // 1) Replace any <img> inside a <header> element
          // 2) Replace any element with class or id containing 'logo' (logo, brand, header)
          // 3) Replace the first <img> in the document as a fallback

          let replaced = false;

          // 1) header img
          const headerImgs = $('header img');
          if (headerImgs.length > 0) {
            headerImgs.each((i, el) => {
              $(el).attr('src', REPLACE_IMAGE);
              replaced = true;
            });
          }

          // 2) classes/ids with 'logo' or 'brand'
          if (!replaced) {
            const logoImgs = $("img[class*='logo'], img[id*='logo'], img[class*='brand'], img[id*='brand']");
            if (logoImgs.length > 0) {
              logoImgs.each((i, el) => {
                $(el).attr('src', REPLACE_IMAGE);
                replaced = true;
              });
            }
          }

          // 3) fallback: first image inside top of body
          if (!replaced) {
            const firstImg = $('body img').first();
            if (firstImg.length) {
              firstImg.attr('src', REPLACE_IMAGE);
              replaced = true;
            }
          }

          // 4) final fallback: simple string replace of common logo filenames (optional)
          let outHtml = $.html();
          if (!replaced) {
            outHtml = outHtml.replace(/logo(\.[a-zA-Z]{2,4})/g, function(m) {
              return REPLACE_IMAGE;
            });
          }

          sendResponse(res, proxyRes, outHtml);
        } else {
          // Non-HTML: stream the content unchanged (images/css/js etc.)
          res.status(proxyRes.statusCode || 200);
          // Copy proxy response headers (except content-encoding)
          Object.entries(proxyRes.headers || {}).forEach(([k, v]) => {
            if (k.toLowerCase() !== 'content-encoding') res.setHeader(k, v);
          });
          res.send(bodyBuffer);
        }
      });
    } catch (err) {
      console.error('Proxy error:', err);
      res.status(500).send('Proxy error');
    }
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
  console.log(`Target: ${TARGET}`);
  console.log(`Replacing header image with: ${REPLACE_IMAGE}`);
});
