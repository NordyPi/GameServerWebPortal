var https = require('https');

var hostname = 'hahbrug.hopto.org'
var port = 443;

var server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
  });

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});