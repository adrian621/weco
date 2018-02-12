import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default class Track extends Component {
  constructor(props){
    super(props);
    this.state = {
        width: 0,
        height: 0,
        scrollOffset: 0,
        sample: '',
        points:3,
        swidth: 0,
        pWidth: 0,
        samples: [{sample: 'a'}, {sample: ''}, {sample: ''}, {sample: 'd'}, {sample: 'e'}, {sample: ''},
                  {sample: ''}, {sample: 'h'}, {sample: 'i'}, {sample: ''}, {sample: ''}, {sample: 'l'}, ]
    };

    this.socket = this.props.socket;



  }
  componentWillReceiveProps(nextProps){
    this.setState({sample: nextProps.sample}, () => {
      // this.updateOffsetX(nextProps.scrollOffsetX);
    });

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
    let sampleX = sampleData[1]-this.props.offsetX+this.state.scrollOffset;
    let sampleY = sampleData[2]-this.props.offsetY;

    let trackX=0;
    let trackY = this.props.y-this.props.scrollOffset;

    let trackWidth = this.state.width;
    let trackHeight= this.state.height;

    let indSampleBox = (sampleX/(trackWidth*(2/9))) | 0;

    if(sampleX>trackX &&
      sampleY>trackY && sampleY<trackY+trackHeight+10){ //+10 is equal to marginBottom for Track
        this.updateSampleBox(sample, indSampleBox);
        this.setState({sample: sampleData[0]}, () => {
          this.props.onSampleDrop({trackID: this.props.id, sample: sampleData[0]});
          this.socket.emit('new-sample-track', {projectID: 1, trackID: this.props.id, name: sampleData[0]});
        });
      }
  }

  updateSampleBox = (sample, id) => {
    let updated_track = [...this.state.samples];
    updated_track[id].sample = sample;

    this.setState({samples: updated_track});
  }

  handleLayout = (event) =>{
    //alert('Layout change invoked for track in list:' + this.props.placeInList)
    let layout = event.nativeEvent.layout;
    this.setState({height: layout.height, width: layout.width})
    this.props.onLayout(layout.height,layout.width,10,this.props.placeInList);
  }

  onLongPress = () =>{

    this.props.removeTrack(this.props.id);
  }

  render() {


    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        <TouchableOpacity onLongPress={this.onLongPress}>
        <Text style = {{textAlign: 'center'}}>Track #{this.props.id} PlaceInlist: {this.props.placeInList} {'\n'} ({this.state.sample})</Text>
        </TouchableOpacity>
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

  sampleContainer: {
    flex: 1,
    borderWidth:1,
    borderColor: 'black',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },

  sample: {
    flex: 1,
    alignSelf: 'center',
    justifyContent:'center',
    alignItems:'center'
  }
});
