import React, { Component } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import SampleBox from './samplebox';
import MovingSampleBox from './movingsamplebox';

let RNFS = require('react-native-fs')

export default class SampleBrowser extends Component {
  constructor(props){
    super(props);
    this.state = {eles: [], yOffset: 0}
  }
  componentDidMount(){
    this.write_dummy_samples();
  }

  write_dummy_samples() {
    for(var i=1;i<10;i++){
      let sample = '/sample'+i+'.wav';
      RNFS.writeFile(RNFS.DocumentDirectoryPath+sample, 'tomt :(', 'utf8')
        .then((success) => {
          this.read_files();
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }

  update_eles(eles) {
    this.setState({eles:eles});
  }

  read_files() {
    // get a list of files and directories in the main bundle
    RNFS.readdir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        let eles = [];

        result.forEach((value,i)=>{
          eles.push({key: value,index:i});
        })

        this.update_eles(eles);

      })
      .catch((err) => {
        console.log(err.message, err.code);
      });
  }

  displaySample = (item) =>{
    return <SampleBox index={item.index} onRelease={()=>{this.props.onRelease}} onMove={this.handleSampleMove} name={item.key}></SampleBox>;
  }

  handleSampleMove = (sample, index, height, margin) => {
    let x = 0;
    let y = index*(height+margin)
    this.props.onSampleMove(sample,x,y-this.state.yOffset);
  }

  handleScroll = (e) =>{
    this.setState({yOffset: e.nativeEvent.contentOffset.y})
  }
  
  handleRelease = () =>{
    this.props.onRelease();
  }

  render() {
    //let samples = this.display_samples();
    return (
      <View style={styles.container}>
        {/* <Button onPress={()=>this.read_files()} title="Load!"/> */}
        <FlatList
          data={this.state.eles}
          extraData={this.state}
          onScroll={this.handleScroll}
          renderItem={({item}) => this.displaySample(item)}
        />
        {/* {samples} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
    borderRightWidth:2,
    borderColor: 'black',
  }
});
