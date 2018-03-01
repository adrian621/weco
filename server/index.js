var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoUtil = require('./mongoUtil');
var dbHandler = require('./dbFunctions');
var jsonParser = require('./jsonParser');
var db;

var clients = {};
var namespaces = [];
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

  dbHandler.getAllProjects(db, (rawProjects) => {
    jsonParser.reconstructRawProjects(rawProjects, (projects) => {
      //console.log(projects);
      socket.emit('rec-projects', projects);
    });
  });
  /*
  socket.on('get-projects', () => {
    console.log('Client asking for all projects!');
    dbHandler.getAllProjects(db, (rawProjects) => {
      jsonParser.reconstructRawProjects(rawProjects, (projects) => {
        console.log(projects);
        socket.emit('rec-projects', projects);
      });
    });
  });
  */

  /*
    Send all tracks to a newly connected client.

    CHANGE WHAT 'ProjectX' IS CALLED WHEN ROOMS ARE ADDED
  */
  socket.on('get-project', (projectInfo) => {
    dbHandler.tracksFromProjectID(db, projectInfo.id, (tracks) => {
      jsonParser.reconstructRawTracks(tracks, (res) => {
        socket.emit('on-connect', res);
      });
    });
  });

  socket.on('create-project', (projectInfo) => {
      socket.broadcast.emit('new-project', projectInfo.id);
      socket.join(projectInfo.id);
      dbHandler.createProject(db, projectInfo.id, (id) => {
      });
  });

  socket.on('join-project', (projectInfo) => {
    socket.join(projectInfo.id);
  });

  socket.on('del-project', (projectInfo) => {
    console.log('project ' + projectInfo.id + ' was deleted!');
    dbHandler.removeProject(db, projectInfo.id, (id) => {
      socket.broadcast.emit('get-del-project', projectInfo.id);
    });
  });

  socket.on('get-curr-samples', (projectInfo) => {
    var projectID = projectInfo.projectID;
    dbHandler.samplesFromProjectID(db, projectInfo, (samples) => {
      // _id is sent with all tracks, can be removed with a new function
      // in jsonParser.js (not written yet tho')
      socket.emit('on-connect-samples', samples);
    });
  });

  socket.on('new-sample-track', (sampleInfo) => {
    dbHandler.addNewSampleTrack(db, sampleInfo, (res) => {
      socket.broadcast.to(sampleInfo.projectID).emit('update-track', res);
    });
  });

  /*
    Event handler for 'new-track', see 'addNewTrack' documentation for
    more information on what happens on the server/database side when triggered.
  */
  socket.on('new-track', (trackInfo) => {
    dbHandler.addNewTrack(db, trackInfo, (id) => {
      //console.log(nsp);
      socket.broadcast.to(trackInfo.projectID).emit('get-new-track', id);
    });
  });

  /*
    Event handler for 'del-track', see 'removeTrack' documentation for
    more information on what happens on the server/database side when triggered.

    *** NOT TESTED! ***
    Test when it's possible to delete tracks using the client.
  */
  socket.on('del-track', (trackInfo) => {
    dbHandler.removeTrack(db, trackInfo, (id) => {
      socket.broadcast.emit('get-del-track', id);
    });
  });

  /*
    Event handler for 'get-num-tracks', see 'numOfTracks' documenation in
    'dbFunctions.js' for more information.

    THIS FUNCTION IS ONLY FOR SERVER -> CLIENT COMMUNICATION TESTING!!!
  */
  socket.on('get-num-tracks', (projectId) => {
    dbHandler.numOfTracks(db, projectId, (val) => {
      socket.emit('num-of-tracks', {number: val})
    });
  });
});
