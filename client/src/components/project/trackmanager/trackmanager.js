import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Track from './track';
import NewTrackButton from './newTrackButton';
import SoundControl from './soundControl';
import TimeLine from './timeline';

var Sound = require('react-native-sound');


export default class TrackManager extends Component {

  constructor(props){
    super(props);

    Sound.setCategory('Playback', true); // true = mixWithOthers

    this.state = {
        tracks: [],
        sampleDropped:[],
        toPlay: [],
        loadedSamples: [],
        loadedSamplesMap: [],
        scrollOffset: 0,
        offsetY: 0,
        bpm: 96,
        trackHeight: 0,
        ntbHeight: 0,
        totalHeight: 0
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
        //tracks[trackID].sample = sample;
        for(let i = 0; i < tracks.length; i++){
          if(tracks[i].trackId == trackID){
            tracks[i].sample = sample;
          }
        }
      }
      this.setState({tracks: tracks});
    });

    this.socket.on('get-new-track', (res) => {
      let tracks = this.state.tracks;

      tracks.push({'trackId': res});
      this.setState({tracks: tracks});
    });

    this.socket.on('get-del-track', (res)  => {
      
      let updated_tracks = this.state.tracks;
      let trackID = res;
      for(let i = 0; i < updated_tracks.length; i++){
        if(updated_tracks[i].trackId == trackID){
          tracks.splice(i,1);
          this.setState({tracks:updated_tracks});
        }
      }
    
    
    });


    this.socket.on('update-track', (res) => {
      let updated_tracks = [...this.state.tracks];
      let sampleName = res.name;
      let trackID = res.trackID;

      //updated_tracks[trackID].sample = sampleName;
      for(let i = 0; i < updated_tracks.length; i++){
        if(updated_tracks[i].trackId == trackID){
          updated_tracks[i].sample = sampleName;
        }
      }
      this.setState({tracks: updated_tracks});
    });
  }

  componentWillReceiveProps(nextProps){
    //Handle sampledrop
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

  loadSample = (sample) =>{
    //If sample already loaded, return
    let loadedSamplesMap = this.state.loadedSamplesMap;
    if(sample in loadedSamplesMap){
      return;
    }

    let sampleFile=0;
    switch(sample){
      case 'sample1.wav':
        sampleFile=(require('../../../audio/sample1.wav'));
        break;
      case 'sample2.wav':
        sampleFile=(require('../../../audio/sample2.wav'));
        break;
      case 'sample3.wav':
        sampleFile=(require('../../../audio/sample3.wav'));
        break;
      default:
      break;
    }
    let loadedSamples = this.state.loadedSamples;

    let context = this;
    let sPromise =  new Promise(function(resolve, reject) {
      const sound = new Sound(sampleFile, error => context.loadCallback(error, sound));
      resolve(sound);
    });

    loadedSamples.push(sPromise);
    loadedSamplesMap.push(sample);
    this.setState({loadedSamples:loadedSamples,loadedSamplesMap:loadedSamplesMap}, ()=>{

    });
  }
  
  loadCallback = (error,sound) =>{
    if (error) {
      Alert.alert('error', error.message);
      return 0;
    }
  }

  playSounds = () =>{
    let context = this;
    //Play all sounds when they are loaded
    Promise.all(this.state.loadedSamples).then(function(sounds) {
      for(let sound of sounds){
        context.playSound(sound);
      }
    });
  }

  playSound = (sound) =>{
    sound.play(() => {
      //Not releasing. Might be undesirable.
    });
  }


  addNewTrack = () => {
    let tracks = this.state.tracks;
    //let trackId = tracks.length; 
    let trackId = Math.floor(Math.random() * 1000000000) + 1 ;

    tracks.push({key: trackId, trackId: trackId, sample: '',y:-1,width:-1,height:-1});

    this.setState({tracks: tracks}, () => {
      this.socket.emit('new-track', {trackID: trackId, projectID: 1});
    });
  }

  handleTrackLayout = (height,width,marginBottom,placeInList) =>{
    //alert(placeInList);
    let y = placeInList*(height+marginBottom);

    let tracks = this.state.tracks;

    tracks[placeInList].height=height;
    tracks[placeInList].width=width;
    tracks[placeInList].y=placeInList*(height+marginBottom);

    this.setState({tracks:tracks,trackHeight:height+marginBottom});

  }

  handleScroll = (e) =>{
    this.setState({scrollOffset: e.nativeEvent.contentOffset.y})
  }

  handleSampleDrop = (data) => {
    let trackID = data.trackID;
    let sample = data.sample;

    let updated_tracks = [...this.state.tracks];

    //updated_tracks[trackID].sample = sample;
    for(let i = 0; i< tracks.length; i++){
      if(tracks[i].trackId == trackID){
        tracks[i].sample = sample;
      }
    }

    this.setState({tracks: updated_tracks});

    //Load sample
    this.loadSample(sample);
  }


  removeTrack = (id) =>{
    tracks = this.state.tracks;
    this.socket.emit('del-track', {trackID: id, projectID: 1});
    
    
    //Force the layout method to be called for every track that is not deleted.
    this.setState({tracks:[]});
    
    for(let i = 0; i < tracks.length; i++){
    if (tracks[i].trackId == id){
      tracks.splice(i,1);
      this.setState({tracks:tracks});
    }
    }

  }


  displayTrack = (item) =>{
    tracks = this.state.tracks;
    for(let i = 0; i < tracks.length; i++){
    if (item.trackId == tracks[i].trackId){
      y = this.state.tracks[i].y;
      placeInList = i;
    }
    }

    return <Track socket={this.socket} scrollOffset={this.state.scrollOffset} offsetX={this.props.offsetX}

            offsetY={this.state.offsetY} y={y}
            droppedSample={this.state.sampleDropped} onLayout={this.handleTrackLayout} placeInList = {placeInList}
            id={item.trackId} sample={item.sample} onSampleDrop={this.handleSampleDrop}
            removeTrack = {this.removeTrack}
            >

           </Track>;
  }

  handleSCLayout = (e) =>{
    this.setState({offsetY: e.nativeEvent.layout.height});
  }

  handleNTBLayout = (height) =>{
    this.setState({ntbHeight: height});
  }
  handleTMLayout = (e) =>{
    this.setState({tmHeight: e.nativeEvent.layout.height});
  }

  render() {
    let tListHeight = 0;
    if(this.state.tracks.length!=0){
      tListHeight = this.state.tracks.length*this.state.trackHeight;

      if(tListHeight > this.state.tmHeight-this.state.ntbHeight){
        tListHeight=this.state.tmHeight-this.state.ntbHeight;
      }
    }


    return (
      <View style={styles.container}>
        <View style = {styles.SoundControlContainer} onLayout={this.handleSCLayout}>
          <SoundControl onPlay = {this.playSounds} onStop= {()=>{}} onPause ={()=>{}}></SoundControl>
        </View>
        <TimeLine></TimeLine>
        <View style = {styles.TrackMContainer} onLayout={this.handleTMLayout}>
          <View style={{height:tListHeight}}>
            <FlatList
              data={this.state.tracks}
              extraData={this.state}
              onScroll={this.handleScroll}
              renderItem={({item}) => this.displayTrack(item)}
              keyExtractor={(item, index) => index}
            />

          </View>
          <NewTrackButton onLayout={this.handleNTBLayout} OnNewTrack = {this.addNewTrack}></NewTrackButton>
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
  SoundControlContainer:{
    alignItems: 'center',
    marginBottom:15
  },
  TrackMContainer: {
    flex: 4

  }
});
