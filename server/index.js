var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoUtil = require('./mongoUtil');
var dbHandler = require('./dbFunctions');
var db;

var clients = {};
/*
  Connect and store an open connection to the mongoDB aswell as running the
  node.js server on 'http://localhost:3000'.

  Runs the mongoDB setup when both the server is up and the connection to the
  database is made, check function 'setUpDB' for information on the database
  setup.
*/
mongoUtil.connectToServer(function(err) {
  server.listen(process.env.PORT || 3000);
  console.log('server is running');

  db = mongoUtil.getDb();
  dbHandler.setUpDB(db);

});

/*
  All event handlers. The 'connection' event is for when a client connects to
  the node.js server.
*/
io.on('connection', function (socket) {
  console.log('User connected!');
  /*
    Send all tracks to a newly connected client.
  */
  dbHandler.tracksFromProjectID(db, "project1", (tracks) => {
    dbHandler.reconstructRawTracks(tracks, (res) => {
      socket.emit('on-connect', res);
      console.log('Sent tracks to new user!');
    });
  });

  /*
    Event handler for 'new-track', see 'addNewTrack' documentation for
    more information on what happends on the server/database side when triggered.
  */
  socket.on('new-track', (trackInfo) => {
    dbHandler.addNewTrack(db, trackInfo, socket.id);
  });

  /*
    Event handler for 'get-num-tracks', see 'numOfTracks' documenation in
    'dbFunctions.js' for more information.

    THIS FUNCTION IS ONLY FOR SERVER -> CLIENT COMMUNICATION TESTING!!!
  */
  socket.on('get-num-tracks', (projectId) => {
    console.log("A client is asking for number of tracks?");
    dbHandler.numOfTracks(db, projectId, (val) => {
      socket.emit('num-of-tracks', {number: val})
    });
  });
});
