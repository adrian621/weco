var mongoUtil = require('./mongoUtil');

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
  function addNewTrack(db, trackInfo, id) {
    var projectID = "project" + trackInfo.projectID.toString();
    var trackID = trackInfo.trackID.toString();

    var dbt = db.db("tracks");

    dbt.collection(projectID).insertOne({info: "new track", trackNum: trackID}, function(err, res) {
      if(err) throw err;
      console.log("New track (TrackID ", trackID, " | ProjectID ", projectID, ") was added by userId: ", id);
    })
  }

  /*
    Returns the number of tracks for a project specified in the argument
    'info.projectID'.

    The function runs a query on the database 'tracks' and on the collection
    specified by 'projectID'. Then returns a callback with the number of
    tracks found, see in 'index.js -> Event Handlers' for how/when it's
    used.

    VERY ALPHA, MAINLY USED FOR SERVER -> CLIENT COMMUNICATION TESTING!
  */
  function numOfTracks(db, info, callback) {
    var query = {trackNum: "1"};
    var projectID = "project1";   // use 'info.projectId' here in the future.
    var dbt = db.db("tracks");

    dbt.collection(projectID).count(query, function(err, res) {
      console.log(res, " numbers of tracks.");
      //return res;
      callback(res);
    });
  }

  module.exports = {setUpDB, addNewTrack, numOfTracks}
