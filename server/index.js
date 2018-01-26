var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoUtil = require('./mongoUtil');
var db;

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
  setUpDB(db);

});

/*
  Basic setup for the db 'projects', might be different in another phase!!!
  The functions creates (if a database or collections doesn't exists) all needed
  databases and collections for phase 1.

  Will run when the node.js server is started.
*/
function setUpDB(db) {
  //if (err) throw err;                       might need to find a fix for this
  var dbo = db.db("projects");
  console.log("Database 'projects' exists/created");

  dbo.listCollections()
    .next(function(err, collinfo) {
      if (err) throw err;

      if(collinfo) {
        console.log(collinfo.name, " exists.");
      }

      else {
        dbo.createCollection("project1", function(err, res) {
          if (err) throw err;
          console.log("Collection 'project1' created.");

          var proj_info = { name: "Project1", created: "some date"};
          dbo.collection("project1").insertOne(proj_info, function(err,res) {
            if (err) throw err;
            console.log("Project1 info inserted.");
          });
        });
      }
    });

    var dbt = db.db("tracks");
    console.log("Database 'tracks' exists/created");

    dbt.listCollections()
      .next(function(err, collinfo) {
        if (err) throw err;

        if(collinfo) {
          console.log(collinfo.name, " exists.");
        }

        else {

        }
      })
  }

/*
  Adds a new track to the database. This function is called when the event
  'new-track' is emitted from a client.

  VERY ALPHA! Everything in this function is mainly for checking that the
  communication between the client, server and database works!
*/
function addNewTrack(trackInfo, id) {
  var projectID = "project" + trackInfo.projectID.toString();
  var trackID = trackInfo.trackID.toString();

  var dbt = db.db("tracks");

  dbt.collection(projectID).insertOne({info: "new track", trackNum: trackID}, function(err, res) {
    if(err) throw err;
    console.log("New track (TrackID ", trackID, " | ProjectID ", projectID, ") was added by userId: ", id);
  })
}

/*
  All event handlers. The 'connection' event is for when a client connects to
  the node.js server.
*/
io.on('connection', function (socket) {
  console.log('User connected!');

  /*
    Event handler for 'new-track', see 'addNewTrack' documentation for
    more information on what happends on the server/database side when triggered.
  */
  socket.on('new-track', (trackInfo) => {
    addNewTrack(trackInfo, socket.id);
  });
});
