import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import SampleBox from './sampleBox';
import Track from './track';
import NewTrackButton from './newTrackButton';
import SocketIOClient from 'socket.io-client';

export default class TrackManager extends Component {

  constructor(){
    super();

    this.state = {
        tracks: []
    };

    this.socket = SocketIOClient('http://10.0.2.2:3000');

    this.addNewTrack = this.addNewTrack.bind(this);
    this.display_tracks = this.display_tracks.bind(this);

    this.socket.on('on-connect', (res) => {
      //alert(tracks.length);
      this.setState({tracks: res});
    });

    this.socket.on('get-new-track', (res) => {
      //alert(tracks.length);
      var tracks = this.state.tracks;
      
      if(res != tracks.length-1) {
        tracks.push({'trackId': res});
        this.setState({tracks: tracks});
      }
    });
  }

  addNewTrack(){
    var tracks = this.state.tracks;
    var trackId = tracks.length;
    tracks.push({'trackId': trackId});
    this.setState({tracks: tracks}, () => {
      this.socket.emit('new-track', {trackID: trackId, projectID: 1});
    });
  }



  display_tracks(){
    tracks = []
    for(let track of this.state.tracks){
      tracks.push({key:track.trackId});
    }
    return <FlatList style ={styles.flatListStyle}
      data={tracks}
      renderItem={({item}) => <Track key = {item.key}></Track>}
    />

  }


  render() {
    let tracks = this.display_tracks();

    return (
      <View style={styles.container}>

        <Text style = {{textAlign: 'center'}}>Track manager</Text>
        {tracks}
        <NewTrackButton OnNewTrack = {this.addNewTrack}></NewTrackButton>


      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  flatListStyle:{
    height: '100%'
  }
});
