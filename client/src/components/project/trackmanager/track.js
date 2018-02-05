import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Track extends Component {
  constructor(props){
    super(props);
    this.state = {
        width: 0,
        height: 0,
        sample: ''
    };

    this.socket = this.props.socket;

  }
  componentWillReceiveProps(nextProps){
    this.setState({sample: nextProps.sample});

    if(nextProps.droppedSample==='undefined'){
      return;
    }

    if(nextProps.droppedSample.length!=0){
        let curr=this.props.droppedSample;
        let next=nextProps.droppedSample;
        if(curr[1]!=next[1]&&curr[2]!=next[2]){
          //Handle sample dropped here
          //Check bounding rectangle of this box
          this.handleSampleDrop(nextProps.droppedSample);
        }
    }
  }

  /*componentWillUpdate(droppedSample) {
    this.handleSampleDrop(droppedSample);
  }*/

  handleSampleDrop = (sampleData) => {
    let sample = sampleData[0];
    let sampleX = sampleData[1]-this.props.offsetX;
    let sampleY = sampleData[2]-this.props.offsetY;

    let trackX=0;
    let trackY = this.props.y-this.props.scrollOffset;

    let trackWidth = this.state.width;
    let trackHeight= this.state.height;

    if(sampleX>trackX && sampleX<trackX+trackWidth &&
      sampleY>trackY && sampleY<trackY+trackHeight+10){ //+10 is equal to marginBottom for Track
        this.setState({sample: sampleData[0]}, () => {
          this.props.onChange({trackID: this.props.id, sample: sampleData[0]});
          this.socket.emit('new-sample-track', {projectID: 1, trackID: this.props.id, name: sampleData[0]});
        });
      }
  }

  handleLayout = (event) =>{
    let layout = event.nativeEvent.layout;
    this.setState({height: layout.height, width: layout.width})
    this.props.onLayout(layout.height,layout.width,10,this.props.id);
  }

  render() {
    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        <Text style = {{textAlign: 'center'}}>Track #{this.props.id} {'\n'} ({this.state.sample})</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d9d9d9',
    borderWidth:1,
    borderColor:'black',
    height: 50,
    width: '100%',
    marginBottom: 10
  },
});
