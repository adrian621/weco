import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Track from './track';
import NewTrackButton from './newTrackButton';
import SocketIOClient from 'socket.io-client';
import SoundControl from './soundControl';

var Sound = require('react-native-sound');




export default class TrackManager extends Component {

  constructor(){
    super();

    Sound.setCategory('Playback', true); // true = mixWithOthers

    this.state = {
        tracks: [],
        sampleDropped:[],
        scrollOffset: 0,
        offsetY: 0
    };

    this.socket = SocketIOClient('http://10.0.2.2:3000');

    this.socket.on('on-connect', (res) => {
      //alert(tracks.length);
      this.setState({tracks: res});
    });

    this.socket.on('get-new-track', (res) => {
      let tracks = this.state.tracks;

      tracks.push({'trackId': res});
      this.setState({tracks: tracks});
      /*
      if(res != tracks.length-1) {
        tracks.push({'trackId': res});
        this.setState({tracks: tracks});
      }
      */
    });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.sampleDroppedAt.length!=0){
        let curr=this.props.sampleDroppedAt;
        let next=nextProps.sampleDroppedAt;
        if(curr[1]!=next[1]&&curr[2]!=next[2]){
          if(this.state.tracks.length!=0){//Annars blir det fakd när man inte har några tracks
            this.setState({sampleDropped:next});
          }
        }
    }
  }

  playSound = () =>{
    const r = `./${this.state.sampleDropped[0]}` 
    alert(r);

      const callback = (error, sound) => {
        if (error) {
          Alert.alert('error', error.message);
          return;
        }
        // Run optional pre-play callback
        sound.play(() => {
          // Success counts as getting to the end
          //setTestState(testInfo, component, 'win');
          // Release when it's done so we're not using up resources
          sound.release();
        });
    };
      if(this.state.sampleDropped[1] != undefined){
      const sound = new Sound(require('./sample1.mp3'), error => callback(error, sound));
      //const sound2 = new Sound(require('./sample1.mp3'), error => callback(error, sound));
      }
    }

  addNewTrack = () => {
    let tracks = this.state.tracks;
    let trackId = tracks.length;

    tracks.push({key: trackId, trackId: trackId, sample: '',y:-1,width:-1,height:-1});

    this.setState({tracks: tracks}, () => {
      this.socket.emit('new-track', {trackID: trackId, projectID: 1});
    });
  }

  handleTrackLayout = (height,width,marginBottom,id) =>{
    let y = id*(height+marginBottom);

    let tracks = this.state.tracks;
    tracks[id].height=height;
    tracks[id].width=width;
    tracks[id].y=id*(height+marginBottom);

    this.setState({tracks:tracks});

  }

  handleScroll = (e) =>{
    this.setState({offsetY: e.nativeEvent.contentOffset.y})
  }

  displayTrack = (item) =>{
    return <Track scrollOffset={this.state.scrollOffset} offsetX={this.props.offsetX}
            offsetY={this.state.offsetY} y={this.state.tracks[item.trackId].y}
            droppedSample={this.state.sampleDropped} onLayout={this.handleTrackLayout}
            id={item.trackId} sample={item.sample}>
           </Track>;
  }

  handleSCLayout = (e) =>{
    this.setState({offsetY: e.nativeEvent.layout.height});
  }

  render() {
    return (

      <View style={styles.container}>
        <View style = {styles.SoundControlContainer} onLayout={this.handleSCLayout}>
         <SoundControl onPlay = {this.playSound} onStop= {()=>{}} onPause ={()=>{}}></SoundControl>
         </View>
        <View style = {styles.TrackMContainer}>
        <Text style = {{textAlign: 'center'}}>Track manager</Text>
        <FlatList
          data={this.state.tracks}
          extraData={this.state}
          onScroll={this.handleScroll}
          renderItem={({item}) => this.displayTrack(item)}
        />
        <NewTrackButton OnNewTrack = {this.addNewTrack}></NewTrackButton>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9'
  },
  flatListStyle:{
    height: '100%'
  },
  SoundControlContainer:{
    flex: 1
  },
  TrackMContainer: {
    flex: 4

  }
});
