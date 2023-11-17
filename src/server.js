const http = require('http');
const fs = require('fs');

const port = 80;

http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<a href=/windmill.html>windmill</a> <a href=/pyramid.html>pyramid</a>");
        res.end();
    } else if (req.url === '/windmill.html') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<script src=./windmill.js></script>");
        res.end();
    } else if (req.url === '/pyramid.html') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<script src=./pyramid.js></script>");
        res.end();
    }
    else if (req.url === '/windmill.js') {
        fs.readFile('dist/windmill/windmill.js', (err, jsModule) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error: ' + err.message);
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.write(jsModule);
            res.end();
        });
    }
    else if (req.url === '/pyramid.js') {
        fs.readFile('dist/pyramid/pyramid.js', (err, jsModule) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error: ' + err.message);
                return;
            }

            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.write(jsModule);
            res.end();
        });
    }
    else if (req.url === '/resources/windmill.glb') {
        fs.readFile('dist/resources/windmill.glb', (err, file) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error: ' + err.message);
                return;
            }

            res.writeHead(200, {'Content-Type': 'application/octet-stream'});
            res.write(file);
            res.end();
        });
    }
}).listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
