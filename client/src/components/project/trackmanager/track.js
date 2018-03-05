import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView, FlatList } from 'react-native';
import GridPage from './gridPage';

/*
  samplesPos, the element should consists of:
    {
      width: the width in % (length of audio file / gridPage length in milisec)
      page: page index in the 'samples' state (For finding what sample)
      index: box index in the 'samples' state (For finding what sample)
    },

  TODO:
    find a good way to handle samples that exceed the end of a gridPage
*/
export default class Track extends Component {
  constructor(props){
    super(props);
    this.state = {
        width: 0,
        height: 0,
        sample: '',
        page: 0,
        samples: [['','','','']],
        samplesPos: []
    };

    this.socket = this.props.socket;



  }
  componentWillReceiveProps(nextProps){
    this.setState({sample: nextProps.sample, samples: nextProps.samples, page: nextProps.page});

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

    if(sampleX>trackX &&
      sampleY>trackY && sampleY<trackY+trackHeight+10){ //+10 is equal to marginBottom for Track
        this.setState({sample: sampleData[0]}, () => {
          let new_samples = this.state.samples;
          let page = this.state.page;
          let indSampleBox = (sampleX/(trackWidth*(2/9))) | 0;
          new_samples[page][indSampleBox] = sample;
          this.setState({sample: sampleData[0], samples: new_samples}, () => {
            this.props.onSampleDrop({trackID: this.props.id, sample: sampleData[0]});
            this.socket.emit('new-sample-track', {projectID: this.props.projectId, trackID: this.props.id, name: sampleData[0], ind: indSampleBox, page: page});
          });

          let currPos = this.state.samplesPos;
          let lenAudio = '50%'; //Change so that it's actual the sample's length compared to the page length
          currPos.push({width: lenAudio, page: page, ind: indSampleBox});
          this.setState({samplesPos: currPos});
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

  changePage = (pageNum) => {
    this.setState({page: pageNum});
  }

  handleSampleMargin = (ind) => {
    let proc = ind * 25;
    let margin = proc.toString() + '%';

    return margin;
  }

  displaySamples = (sample) => {
    return (
      <View style={styles.sample}></View>
    )
  }

  render() {

    //<Text style = {{textAlign: 'center'}}>Track #{this.props.id} PlaceInlist: {this.props.placeInList} {'\n'} ({this.state.sample})</Text>
    // Use this: (?)
    // https://github.com/glepur/react-native-swipe-gestures
    return (
      <View style={styles.container} onLayout={this.handleLayout}>
        <TouchableOpacity style={styles.trackCont} onLongPress={this.onLongPress}>
          <Animated.View style={{flex: 1}}>
            <GridPage samples={this.state.samples[this.state.page]}> </GridPage>
          </Animated.View>
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
    marginBottom: 10
  },
  trackCont: {
    flex: 1
  },
  sample: {
    flex: 1,
    height: '100%',
    width: '45%',
    borderWidth:1,
    borderColor:'black',
    position: 'absolute',
    backgroundColor: "white",
  }
});
