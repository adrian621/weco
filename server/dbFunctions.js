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
          dbt.createCollection("project1", function(err, res) {
            if (err) throw err;
            console.log("Collection 'tracks.project1' created.");

            var track_info = { info: "new track", trackNum: "0"};
            dbt.collection("project1").insertOne(track_info, function(err,res) {
              if (err) throw err;
              console.log("Project1.track info inserted.");
            });
          });
        }
      });
    /*
    var dbs = db.db("samples");
    console.log("Database 'samples' exists/created");

    dbs.listCollections()
    .next(function(err, collinfo) {
      if (err) throw err;

      if(collinfo) {
        console.log(collinfo.name, " exists.");
      }

      else {
        dbs.createCollection("project1", function(err, res) {
          if (err) throw err;
          console.log("Collection 'tracks.project1' created.");

          // sampleID is the ID of the actual sample in the device database.
          var sample_info = { info: "new sample", trackNum: "0", sampleNum: "0", sampleID: "0"};
          dbs.collection("project1").insertOne(sample_info, function(err,res) {
            if (err) throw err;
            console.log("Project1.sample info inserted.");
          });
        });
      }
    });*/
  }

  /*
    Adds a new sample to the database 'samples' in the collection 'projectID'. This function is called when the event
    'new-sample' is emitted from a client.

    sampleInfo = {
                    projectID: _projectID,   // Used for finding right project-collection (int)
                    trackNum: _trackNum,     // ID of sample in a track                   (int)
                    sampleNum: _sampleNum,   // ID of track where the sample is placed    (int)
                    sampleID: _sampleIDs     // ID of sample on the client databases      (???)
                  }

    VERY ALPHA! Everything in this function is mainly for checking that the
    communication between the client, server and database works!
  */

  function addNewSampleTrack(db, sampleInfo, callback) {
    /*
    var sampleNum = sampleInfo.sampleNum.toString();
    var trackID = sampleInfo.trackNum.toString();
    var sampleID = "dummyID"; //sampleInfo.sampleID.toString();
    */
    var projectID = "project" + sampleInfo.projectID.toString();
    var trackID = sampleInfo.trackID;
    var sample = sampleInfo.name;
    var page = sampleInfo.page;
    var ind = sampleInfo.ind;

    var dbs = db.db("samples");

    var newSample = {trackID: trackID, name: sample, page: page, ind: ind};
    //var newSample = {info: "new sample", trackNum: trackID, sampleNum: sampleNum, sampleID: sampleID};
    dbs.collection(projectID).insertOne(newSample, function(err, res) {
      if(err) throw err;

      callback(newSample);
    });
  }

  /*
    Returns an array of all samples that are in the collection of
    'projectId' that satifies the query '{trackID: trackID}' in the
    database 'samples' to a callback function.
  */
  function samplesFromIDs(db, projectId, trackId, callback) {
    var query = {trackID: trackId};
    var projectID = "project" + projectId.toString();
    var dbs = db.db("samples");

    dbs.collection(projectID).find({query}).toArray(function(err, res) {
      if (err) throw err;
      //console.log(res);
      callback(res);
    });
  }

  function samplesFromProjectID(db, projectId, callback) {
    var projectID = "project" + projectId.toString();
    var dbs = db.db("samples");

    dbs.collection(projectID).find({}).toArray(function(err, res) {
      if (err) throw err;
      console.log(res);
      callback(res);
    });
  }

  /*
    Adds a new track to the database. This function is called when the event
    'new-track' is emitted from a client.

    VERY ALPHA! Everything in this function is mainly for checking that the
    communication between the client, server and database works!
  */
  function addNewTrack(db, trackInfo, callback) {
    var projectID = "project" + trackInfo.projectID.toString();
    var trackID = trackInfo.trackID.toString();

    var dbt = db.db("tracks");

    dbt.collection(projectID).insertOne({info: "new track", trackNum: trackID}, function(err, res) {
      if(err) throw err;
      callback(trackID);
    })
  }

  /*
    Removes the track with id 'trackInfo.trackID' from the trackmanager and
    from the database to the corresponding 'project' collection in the
    'tracks' database. The trackID is then broadcasted to all other clients
    connected to that project.

    VERY ALPHA! Has not yet been tested so use carefully.
  */
  function removeTrack(db, trackInfo, callback) {
    var projectID = "project" + trackInfo.projectID.toString();
    var trackID = trackInfo.trackID.toString();
    var query = {trackNum: trackID};

    var dbt = db.db("tracks");

    dbt.collection(projectID).deleteOne(query, function(err, res) {
      if (err) throw err;
      console.log("Track num ", trackID);
      callback(trackID);
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
    //tracksFromProjectID(db, "project1");  // testy-testy

    var query = {trackNum: "1"};
    var projectID = "project1";   // use 'info.projectId' here in the future.
    var dbt = db.db("tracks");

    dbt.collection(projectID).count(query, function(err, res) {
      //return res;
      callback(res);
    });
  }

  /*
    Returns an array of all tracks that are in the collection of
    'projectId' in the database 'tracks' to a callback function. The callback
    function (for now) is 'reconstructRawTracks' so that the elements in
    the array is of the right JSON structure. ({trackId: id}).
  */
  function tracksFromProjectID(db, projectId, callback) {
    //var query = {projectID: projID};
    var dbt = db.db("tracks");

    dbt.collection(projectId).find({}).toArray(function(err, res) {
      if (err) throw err;
      callback(res);
    })
  }

  module.exports = {setUpDB,
                    addNewTrack, numOfTracks, tracksFromProjectID,
                    addNewSampleTrack, samplesFromIDs, samplesFromIDs, samplesFromProjectID, removeTrack}
