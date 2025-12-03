/**
 * Development HTTP Server
 * Simple HTTP server for local development and testing
 * Run with: node scripts/dev-server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    // Serve files from dist directory (where build output is)
    let filePath = path.join(__dirname, '..', 'dist', req.url);
    
    // Handle root path
    if (req.url === '/' || req.url === '') {
        filePath = path.join(__dirname, '..', 'dist', 'index.html');
    }
    
    // Normalize the path to prevent directory traversal
    const distDir = path.join(__dirname, '..', 'dist');
    filePath = path.normalize(filePath);
    
    // Ensure the file is within dist directory
    if (!filePath.startsWith(distDir)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 - File Not Found</h1><p>Requested: ${req.url}</p>`, 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log(`📝 Open http://localhost:${PORT}/index.html in your browser`);
    console.log(`📝 Or http://localhost:${PORT}/pages/start.html for onboarding`);
    console.log(`📝 Or http://localhost:${PORT}/pages/dashboard.html for dashboard`);
    console.log(`\n💡 Press Ctrl+C to stop the server\n`);
});

