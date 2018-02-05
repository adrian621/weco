import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Track from './track';
import NewTrackButton from './newTrackButton';
import SoundControl from './soundControl';


var Sound = require('react-native-sound');


export default class TrackManager extends Component {

  constructor(props){
    super(props);

    Sound.setCategory('Playback', true); // true = mixWithOthers

    this.state = {
        tracks: [],
        sampleDropped:[],
        scrollOffset: 0,
        offsetY: 0
    };

    this.socket = this.props.socket;

    this.socket.on('on-connect', (res) => {
      //alert(tracks.length);
      this.setState({tracks: res}, () => {
        this.socket.emit('get-curr-samples', {projectID: "project1"});
      });
    });

    this.socket.on('on-connect-samples', (res) => {
      let tracks = this.state.tracks;
      for(let i=0; i<res.length; i++) {
        let trackID = res[i].trackID;
        let sample = res[i].name;
        tracks[trackID].sample = sample;
      }
      this.setState({tracks: tracks});
    });

    this.socket.on('get-new-track', (res) => {
      let tracks = this.state.tracks;

      tracks.push({'trackId': res});
      this.setState({tracks: tracks});
    });

    this.socket.on('update-track', (res) => {
      //alert(res.name);
      let updated_tracks = [...this.state.tracks];
      let sampleName = res.name;
      let trackID = res.trackID;

      updated_tracks[trackID].sample = sampleName;

      this.setState({tracks: updated_tracks});
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
    //const r = `./${this.state.sampleDropped[0]}` 
    let samplesReq = [];
    this.state.tracks.forEach(function(track){
      switch(track.sample){
        case 'sample1.wav': 
          samplesReq.push(require('./sample1.mp3'));
          break;
        case 'sample2.wav':
          samplesReq.push(require('./sample2.mp3'));
          break; 
        case 'sample3.wav': alert(3); break;
          samplesReq.push(require('./sample3.mp3'));
          break;
        default: 
        break;
      }
    });

    //alert(samples[0]);
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
     
     const sound = new Sound(samplesReq[0], error => callback(error, sound));
     //const sound2 = new Sound(samplesReq[0], error => callback(error, sound));
      
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
    this.setState({scrollOffset: e.nativeEvent.contentOffset.y})
  }

  onChange = (data) => {
    let trackID = data.trackID;
    let sample = data.sample;

    let updated_tracks = [...this.state.tracks];

    updated_tracks[trackID].sample = sample;

    this.setState({tracks: updated_tracks});
  }

  displayTrack = (item) =>{
    return <Track socket={this.socket} scrollOffset={this.state.scrollOffset} offsetX={this.props.offsetX}
            offsetY={this.state.offsetY} y={this.state.tracks[item.trackId].y}
            droppedSample={this.state.sampleDropped} onLayout={this.handleTrackLayout}
            id={item.trackId} sample={item.sample} onChange={this.onChange}>
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
          keyExtractor={(item, index) => index}
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
