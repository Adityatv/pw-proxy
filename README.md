
# PW Site Proxy

This Node.js project creates a reverse proxy to serve an entire site (`TARGET_URL`) while replacing the top/header image with a custom image (`REPLACE_IMAGE_URL`).

## Files

- `server.js` - main proxy server
- `package.json` - dependencies
- `README.md` - this file

## Usage

1. Install dependencies:
   ```
   npm install
   ```

2. Run:
   ```
   TARGET_URL=https://pwthor.site REPLACE_IMAGE_URL=https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTejUBwYJV9w5teT21Z3vx2I9IObd-XK1uf1YoO07gJGi0nfyG9m22Oqc&s=10 PORT=3000 npm start
   ```

3. Deploy:
   - Works on any VPS (DigitalOcean, AWS EC2, etc.)
   - For platform-as-a-service: use Render, Railway, or similar.
   - Vercel's serverless functions require a different setup.

## Notes & Legal
- This proxies `TARGET_URL` and modifies HTML on-the-fly. Make sure you have permission to proxy and display content from the target site.
- If the target site blocks embedding or proxies, the proxy may fail.
