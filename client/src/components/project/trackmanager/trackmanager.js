import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
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
        gestureName: 'none',
        tracks: [],
        sampleDropped:{},
        toPlay: [],
        sounds: [],
        soundFiles: {},
        loadedSounds: [],
        scrollOffset: 0,
        offsetY: 0,
        bpm: 96,
        trackHeight: 0,
        ntbHeight: 0,
        totalHeight: 0,
        scrolledTrackID: 0,
        gridPage: 0,
      };

    this.socket = this.props.socket;

    this.socket.on('on-connect', (res) => {
      this.setState({tracks: res}, () => {
        this.socket.emit('get-curr-samples', {projectID: "project1"});
      });
    });

    this.socket.on('on-connect-samples', (res) => {
      let tracks = this.state.tracks;
      for(let i=0; i<res.length; i++) {
        let trackID = res[i].trackID;
        let sample = res[i].name;

        for(let i = 0; i < tracks.length; i++){
          if(tracks[i].trackId == trackID){
            tracks[i].sample = sample;
          }
        }
      }
      this.setState({tracks: tracks},this.generateToPlay());
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
          this.setState({tracks:updated_tracks},this.generateToPlay);
        }
      }


    });


    this.socket.on('update-track', (res) => {
      let updated_tracks = [...this.state.tracks];
      let sampleName = res.name;
      let trackID = res.trackID;

      for(let i = 0; i < updated_tracks.length; i++){
        if(updated_tracks[i].trackId == trackID){
          updated_tracks[i].sample = sampleName;
        }
      }
      this.setState({tracks: updated_tracks},this.generateToPlay());
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
    //Load files only if new ones have been added and there exists files
    if(nextProps.files.length!=0 && JSON.stringify(nextProps.files)!=JSON.stringify(this.props.files)){
      this.loadSoundFiles(nextProps.files);
    }
  }

  loadSoundFiles = (files) =>{
    //Load sound files here
    let soundFiles = {};
    for(let file of files){
      switch(file){
        case 'sample1.wav':
          soundFiles[file]=(require('../../../audio/sample1.wav'));
          break;
        case 'sample2.wav':
          soundFiles[file]=(require('../../../audio/sample2.wav'));
          break;
        case 'sample3.wav':
          soundFiles[file]=(require('../../../audio/sample3.wav'));
          break;
        default:
        break;
      }
    }
    this.setState({soundFiles:soundFiles})
  }

  loadSounds = ()=>{
    let loadedSounds=[];

    let context=this;
    let tracks = this.state.tracks;
    let sample=0;

    for(let id of this.state.toPlay){
      //Find sample of trackID(will be fixed later)
      for(let i = 0; i< tracks.length; i++){
        if(tracks[i].trackId == id){
          sample = tracks[i].sample;
          break;
        }
      }

      let sPromise =  new Promise(function(resolve, reject) {
        const sound = new Sound(context.state.soundFiles[sample], error => context.loadCallback(error, sound,id,resolve,reject));

      });
      loadedSounds.push(sPromise);
    }

    this.setState({loadedSounds:loadedSounds}, ()=>{
      console.log("loaded",loadedSounds)
    });
  }

  loadCallback = (error,sound,id,resolve,reject) =>{
    let sounds = this.state.sounds;
    sounds[id]=sound;

    this.setState({sounds:sounds}, ()=>{
      if (error) {
        reject(0)
        return;
      }
      else{
        resolve(sound)
      }
    })

  }

  play = () =>{
    this.playSounds().then(()=>{
      this.loadSounds();
    }).catch((error)=>{
      console.log("play error", error)
    });
  }

  loadCallback = (error,sound) =>{
    if (error) {
      Alert.alert('error', error.message);
      return 0;
    }
  }

  pause = () =>{

  }
  playSounds = () =>{
    //Play all sounds when they are loaded
    let context = this;
    return Promise.all(this.state.loadedSounds).then(function(sounds) {
      for(let sound of sounds){
        context.playSound(sound);
      }
    }).catch((error)=>{alert("Failed to load play some sound(s)")});
  }

  playSound = (sound) =>{
    if(!sound.isLoaded()){
      alert("not loaded when played")
    }
    sound.play((success) => {
      sound.release();
      if(!success){
        //Kör om alla ljud igen här tills de funkar
        alert("failed to play: ", sound)
      }
      //Not releasing. Might be undesirable.
    });
  }


  addNewTrack = () => {
    let tracks = this.state.tracks;
    //let trackId = tracks.length;
    let trackId = Math.floor(Math.random() * 1000000000) + 1 ;

    tracks.push({key: trackId, trackId: trackId, samples: [['a', '', '', ''],['e', '', '', '']], sample: '',y:-1,width:-1,height:-1});

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

  handleTrackScroll = (x, id) => {
    this.setState({scrollOffsetX: x, scrolledTrackID: id});
  }

  handleSampleDrop = (data) => {
    let trackID = data.trackID;
    let sample = data.sample;

    let updated_tracks = [...this.state.tracks];

    for(let i = 0; i< tracks.length; i++){
      if(tracks[i].trackId == trackID){
        tracks[i].sample = sample;
      }
    }

    this.setState({tracks: updated_tracks}, this.generateToPlay());
  }

  releaseSounds = (samples)=>{
    let sounds = this.state.sounds;
    let id = 0;
    for(let sample of samples){
      for(let i=0;i<this.state.tracks.length;i++){
        if(this.state.tracks[i].sample===sample){
          id=this.state.tracks[i].trackId;
        }
      }
      if(Object.keys(sounds).includes(id)){
        sounds[id].release();
        delete sounds[id];
      }
    }
  }

  generateToPlay = () =>{
    let newToPlay = [];

    for (let track of this.state.tracks){
      if(track.sample!=''){
        newToPlay.push(track.trackId);
      }
    }

    //Release sounds that were on track(s) but have now been replaced/removed
    let deltaToPlay = this.state.toPlay.filter(x => !newToPlay.includes(x));
    this.releaseSounds(deltaToPlay);

    this.setState({toPlay: newToPlay},()=>this.loadSounds());
  }

  removeTrack = (id) =>{
    tracks = this.state.tracks;
    this.socket.emit('del-track', {trackID: id, projectID: 1});


    //Force the layout method to be called for every track that is not deleted.
    this.setState({tracks:[]},()=>{
      for(let i = 0; i < tracks.length; i++){
        if (tracks[i].trackId == id){
          tracks.splice(i,1);
          this.setState({tracks:tracks},()=>{this.generateToPlay()});
        }
      }
    });



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
            offsetY={this.state.offsetY} y={y} droppedSample={this.state.sampleDropped} samples={item.samples}
            onLayout={this.handleTrackLayout} placeInList = {placeInList} page={this.state.gridPage}
            id={item.trackId} sample={item.sample} onSampleDrop={this.handleSampleDrop}
            removeTrack = {this.removeTrack}>
           </Track>;
  }

  handleSCLayout = (e) =>{
    this.setState({offsetY: e.nativeEvent.layout.height,
                    offsetX: e.nativeEvent.layout.width});
  }
  handleNTBLayout = (height) =>{
    this.setState({ntbHeight: height});
  }
  handleTMLayout = (e) =>{
    this.setState({tmHeight: e.nativeEvent.layout.height});
  }

  onSwipeLeft = (gestureState) => {
    let new_page = this.state.gridPage + 1;

    this.setState({gridPage: new_page});
  }

  onSwipeRight(gestureState) {
    if(this.state.gridPage < 1) {
      return
    }

    let new_page = this.state.gridPage - 1;

    this.setState({gridPage: new_page});
  }

  onSwipe(gestureName, gestureState) {
    const {SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    switch (gestureName) {
      case SWIPE_LEFT:
        break;
      case SWIPE_RIGHT:
        break;
    }
  }

  render() {
    let tListHeight = 0;
    if(this.state.tracks.length!=0){
      tListHeight = this.state.tracks.length*this.state.trackHeight;

      if(tListHeight > this.state.tmHeight-this.state.ntbHeight){
        tListHeight=this.state.tmHeight-this.state.ntbHeight;
      }
    }

    const config = {
      velocityThreshold: 0.1,
      directionalOffsetThreshold: 200
    };


    return (
      <GestureRecognizer
        onSwipe={(direction, state) => this.onSwipe(direction, state)}
        onSwipeLeft={(state) => this.onSwipeLeft(state)}
        onSwipeRight={(state) => this.onSwipeRight(state)}
        config={config}
        style={{
          flex: 1,
        }}
        >
        <View style={styles.container}>
          <View style = {styles.SoundControlContainer} onLayout={this.handleSCLayout}>
            <SoundControl onPlay = {this.playSounds} onStop={this.stop} onPause={this.pause}></SoundControl>
          </View>
          <TimeLine bars={1}></TimeLine>
          <View style = {styles.TrackMContainer} onLayout={this.handleTMLayout}>
            <View style={{height:tListHeight}}>
              <FlatList
                ref={(ref) => { this._flatList = ref; }}
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
      </GestureRecognizer>
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
