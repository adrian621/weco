import React from 'react';
import {StyleSheet,
        Text,
        View,
        PanResponder,
        Animated} from 'react-native';
import SampleBrowser from './samplebrowser/samplebrowser';
import TrackManager from './trackmanager/trackmanager';
import MovingSampleBox from './samplebrowser/movingsamplebox';
import SocketIOClient from 'socket.io-client';
import { StackNavigator } from 'react-navigation';

/* THIS IS A WORKING BUILD OF weco NOT ANYTHING SPECIAL! */

export default class App extends React.Component {
  constructor(props){
      super(props);

      let socketConfig = { path: '/socket' };
      this.state = {
          files: [],
          pan: new Animated.ValueXY(),
          movingsample: '',
          sampleDroppedAt: [],
          sampleBrowserWidth: 0,
          projectId: this.props.navigation.state.params.id,
          updateSoundLibrary: 0
      };

      this.socket = this.props.navigation.state.params.socket;
  }
  componentWillMount(){
    // Add a listener for the delta value change
    this._val = { x:0, y:0 }
    this.state.pan.addListener((value) => this._val = value);

    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: (e, gestureState) => {

        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({ x:0, y:0});
      },

      /*
      onStartShouldSetPanResponder: (e, gesture) => true,
      */
      //pre
      onPanResponderMove: (e, gestureState) => {
        Animated.event([null, {
          dx: this.state.pan.x,
          dy: this.state.pan.y,
        }])(e, gestureState);
      },

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        this.setState({respond: false})
        }
    });
  }

  handleSampleMove = (sample,x,y) => {
    this.setState({movingsample:[]}, ()=>{
      this.setState({movingsample: [sample,x,y]} )
    });

  }

  handleSampleDrop = (sample,x,y) => {
    this.setState({movingsample: []});
    this.setState({sampleDroppedAt:[sample,x,y]});
  }

  handleFilesLoaded = (files) =>{
    this.setState({files:files});
  }

  display_movingsample() {
    const panStyle = {
        transform: this.state.pan.getTranslateTransform()
    }
    if (this.state.movingsample.length==0){
      return [];
    }

    return <MovingSampleBox onRelease={this.handleSampleDrop} onMove={()=>{}} name={this.state.movingsample[0]}
       offset={{x:this.state.movingsample[1],y:this.state.movingsample[2]}}></MovingSampleBox>
  }

  handleLayout = (event) =>{
    this.setState({sampleBrowserWidth: event.nativeEvent.layout.width})
  }

  handleUpdatedSamples = ()=>{
    this.setState({updateSoundLibrary: this.state.updateSoundLibrary+1});
  }

  render() {

    return (
      <View style={styles.container}>

        <View style={{flex: 2}} onLayout={this.handleLayout}>
          <SampleBrowser onRelease={this.handleSampleDrop} onSampleMove={this.handleSampleMove}
            onFilesLoaded={this.handleFilesLoaded} updateSoundLibrary={this.state.updateSoundLibrary}
            projectId={this.state.projectId}></SampleBrowser>
        </View>
        <View style = {{flex: 0.01, backgroundColor: 'black'}}/>
          <View style = {{flex: 7}}>
            <TrackManager socket={this.socket} offsetX={this.state.sampleBrowserWidth}
              files={this.state.files} sampleDroppedAt={this.state.sampleDroppedAt}
              projectId={this.state.projectId} onRecordingDone={this.handleUpdatedSamples}></TrackManager>
        </View>
        {this.display_movingsample()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  movingSample:{
  }
});
