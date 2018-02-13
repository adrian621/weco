/*
  Returns a reconstructed array of JSON 'track' objects, from
      {_id: id, info: _info, trackNum: _trackNum},  to
      {trackId: id}
  to a callback function. The callback function (for now) is a socket.emit
  call that sends all tracks to a client when it connects.
*/
function reconstructRawTracks(rawTracks, callback) {
  var recTracks = new Array(rawTracks.length);
  for(var i=0; i<rawTracks.length; i++) {
    recTracks[i] = {trackId: rawTracks[i].trackNum, samples: [['', '', '', ''],['', '', '', '']]};
  }
  callback(recTracks);
}

module.exports = {reconstructRawTracks}
