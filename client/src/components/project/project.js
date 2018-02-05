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

export default class App extends React.Component {
  constructor(){
      super();

      this.state = {
          pan: new Animated.ValueXY(),
          movingsample: '',
          sampleDroppedAt: [],
          sampleBrowserWidth: 0,
          socket: SocketIOClient('http://10.0.2.2:3000')
      };

      //this.socket = SocketIOClient('http://10.0.2.2:3000');
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

  render() {

    return (
      <View style={styles.container}>

        <View style={{flex: 2}} onLayout={this.handleLayout}>
          <SampleBrowser onRelease={this.handleSampleDrop} onSampleMove={this.handleSampleMove}></SampleBrowser>
        </View>
        <View style = {{flex: 0.01, backgroundColor: 'black'}}/>
          <View style = {{flex: 7}}>
            <TrackManager socket={this.state.socket} offsetX={this.state.sampleBrowserWidth} sampleDroppedAt={this.state.sampleDroppedAt}></TrackManager>
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
