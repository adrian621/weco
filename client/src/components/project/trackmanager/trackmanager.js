import React, { Component } from 'react';
import { PermissionsAndroid, StyleSheet, Text, View, FlatList } from 'react-native';
import Track from './track';
import NewTrackButton from './newTrackButton';
import SoundControl from './soundControl';
import TimeLine from './timeline';
import {WecoAudio,WecoRecord} from '../../../nativemodules';
import { StackNavigator } from 'react-navigation';
import Permissions from 'react-native-permissions';

export default class TrackManager extends Component {

  constructor(props){
    super(props);

    // Request permission to access photos

    Permissions.request('microphone').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      // alert(response)
    })

    this.state = {
        tracks: [],
        sampleDropped:{},
        scrollOffset: 0,
        offsetY: 0,
        visibleBars: 2,
        bpm: 96,
        playing: false,
        recording: false,
        trackHeight: 0,
        ntbHeight: 0,
        totalHeight: 0,
        scrolledTrackID: 0,
        rTrackInd: 0
    };
    WecoAudio.init(this.state.bpm, this.state.visibleBars);
    this.socket = this.props.socket;

    this.socket.emit('get-project', {id: this.props.projectId});

    this.socket.on('on-connect', (res) => {
      this.setState({tracks: res}, () => {
        this.socket.emit('get-curr-samples', {projectID: this.props.projectId});
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

      for(let i = 0; i < updated_tracks.length; i++){
        if(updated_tracks[i].trackId == trackID){
          updated_tracks[i].sample = sampleName;
        }
      }
      this.setState({tracks: updated_tracks});
    });
  }

  componentWillUpdate(nextProps, nextState){
    if(nextState.tracks!=this.state.tracks){
      this.updateSoundMixer(nextState.tracks);
    }
  }
  componentWillReceiveProps(nextProps){
    //Handle sampledrop
    //this.setState({projectId: this.props.navigation.state.id});
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
    }
  }

  updateSoundMixer = (tracks) =>{
    let samples = [];

    for (let track of tracks){
      if(track.sample != ""){
        samples.push(track.sample.split('.')[0]);
      }
    }
    WecoAudio.mix(samples);
  }

  stopRecording = (smp) =>{
    let tracks = this.state.tracks;
    tracks[this.state.rTrackInd].sample=smp;
    this.setState({tracks:tracks},()=>{
      //This should happen in componentWillUpdate? weird
      this.updateSoundMixer(this.state.tracks);
    });
    this.props.onRecordingDone();
  }

  play = () =>{
    if(this.state.playing){
      return;
    }
    this.setState({playing: true, stopped: false, paused: false});


    WecoAudio.playSound();
  }

  play_2 = () =>{
    if(this.state.playing){
      return;
    }
    this.setState({playing: true, stopped: false, paused: false});


    // WecoAudio.playSound();
  }

  stop = () =>{
    this.setState({playing: false, stopped: true});
    WecoAudio.stopSound();
    if(this.state.recording){
      this.setState({recording: false}, ()=>{
        WecoRecord.stopRecording(()=>{

        });
      })
    }

  }

  pause = () =>{
    this.setState({playing: false, paused: true});
    WecoAudio.pauseSound();
    if(this.state.recording){
      this.setState({recording: false}, ()=>{
        WecoRecord.stopRecording(()=>{
        });
      })
    }
  }

  record = ()=>{
    this.stop();
    if(!this.state.recording){
      // this.stop();
      // this.play();
      let tracks=this.state.tracks;
      tracks[this.state.rTrackInd].sample='';
      this.setState({tracks:tracks},()=>{
        this.updateSoundMixer(this.state.tracks);
      })
      this.setState({recording:true}, ()=>{
        if(this.state.tracks.length==0) return;
        this.play();
        WecoRecord.startRecording(this.state.tracks[this.state.rTrackInd].trackId,(smp)=>{

          this.stopRecording(smp);
        });
      })
    }
    else{
      this.setState({recording:false}, ()=>{
        WecoRecord.stopRecording(()=>{
        });
      })
    }
  }

  addNewTrack = () => {
    let tracks = this.state.tracks;
    //let trackId = tracks.length;
    let trackId = Math.floor(Math.random() * 1000000000) + 1 ;

    tracks.push({key: trackId, trackId: trackId, sample: '',y:-1,width:-1,height:-1});

    this.setState({tracks: tracks}, () => {
      this.socket.emit('new-track', {trackID: trackId, projectID: this.props.projectId});
    });
  }

  handleTrackLayout = (height,width,marginBottom,placeInList) =>{
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

    this.setState({tracks: updated_tracks});
  }

  removeTrack = (id) =>{
    tracks = this.state.tracks;
    this.socket.emit('del-track', {trackID: id, projectID: this.props.projectId});


    //Force the layout method to be called for every track that is not deleted.
    this.setState({tracks:[]},()=>{
      for(let i = 0; i < tracks.length; i++){
        if (tracks[i].trackId == id){
          tracks.splice(i,1);
          this.setState({tracks:tracks});
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
            offsetY={this.state.offsetY} y={y} droppedSample={this.state.sampleDropped}
            onLayout={this.handleTrackLayout} placeInList = {placeInList}
            id={item.trackId} sample={item.sample} onSampleDrop={this.handleSampleDrop}
            removeTrack = {this.removeTrack} projectId={this.props.projectId}>
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

  handlePlayDone = () =>{
    this.stop();
  }

  handleTimeChange = (val) =>{
    WecoAudio.setTimeMarker(val);
  }

  handleRTrack = (index) =>{
    this.setState({rTrackInd: index});
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
        <View style={styles.SoundControlContainer} onLayout={this.handleSCLayout}>
          <SoundControl onPlay={this.play} onStop={this.stop} onPause={this.pause} onRecord={this.record}
            onSelectRTrack={this.handleRTrack} tracks={this.state.tracks} recording={this.state.recording}></SoundControl>
        </View>
        <TimeLine playing={this.state.playing} stopped={this.state.stopped} paused={this.state.paused}
           playDone={this.handlePlayDone} bpm={this.state.bpm} bars={this.state.visibleBars}
           onSlideComplete={this.handleTimeChange}></TimeLine>
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
