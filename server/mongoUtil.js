/*
  For setting up a connection to the mongoDB database (project).
  The instance _db will direct to the same database, no mather
  when or where it's called. (Dont forget to 'require('MongoUtil');'!).
  Use with causion, not completly tested yet.
*/

var MongoClient = require( 'mongodb' ).MongoClient;

var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( "mongodb://localhost:27017/project", function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
