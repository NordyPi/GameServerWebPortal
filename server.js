var http = require('http');

var host = 'hahbrug.hopto.org'
var port = 80;

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("My first server!");
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});