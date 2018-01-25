var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000);
console.log('server is running');


io.on('connection', function (socket) {
  console.log('User connected!');
});
