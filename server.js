var https = require('https');

var host = '192.168.50.22'
var port = 443;

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("My first server!");
};

const server = https.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});