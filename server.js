import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules don't have __dirname, so we derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration - allow all domains
app.use(cors());

// Serve static files from the 'dist' directory
// This will contain the built Svelte app (including the new index.html, JS, and CSS)
app.use(express.static(path.join(__dirname, 'dist')));

// A catch-all route to serve index.html for any non-static-file route
// This is important for single-page applications (SPAs) with client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`SEO & Web Accessibility Checker server is running at http://localhost:${port}`);
}); 