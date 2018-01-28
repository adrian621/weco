import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import SampleBox from './sampleBox';
import Track from './track';
import NewTrackButton from './newTrackButton';

export default class TrackManager extends Component {

  constructor(){
    super();

    this.state = {
        tracks: []
    };
    this.addNewTrack = this.addNewTrack.bind(this);
    this.display_tracks = this.display_tracks.bind(this);
  }

  addNewTrack(){
    var tracks = this.state.tracks;
    tracks.push({'trackId': tracks.length});
    this.setState({tracks: tracks});
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
