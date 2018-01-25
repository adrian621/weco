var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/project";

server.listen(process.env.PORT || 3000);
console.log('server is running');

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
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
  });

  io.on('new-track', (id) => {
    db.createCollection("tracks")
  });

  io.on('connection', function (socket) {
    console.log('User connected!');
  });
