import React, { Component } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import SampleBox from './samplebox';
import MovingSampleBox from './movingsamplebox';

let RNFS = require('react-native-fs')

export default class SampleBrowser extends Component {
  constructor(props){
    super(props);
    this.state = {files: [], eles: []}
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

  update_files(files) {
    this.setState({files:files});
  }

  update_eles(eles) {
    this.setState({eles:eles});
  }

  read_files() {
    // get a list of files and directories in the main bundle
    RNFS.readdir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        let files = [];
        let eles = [];
        result.forEach((value,i)=>{
          eles.push({key: value,movable:false});
          files.push(value);
        })

        this.update_files(files);
        this.update_eles(eles);

      })
      .catch((err) => {
        console.log(err.message, err.code);
      });
  }

  display_samples(){
    files = []

    for(let file of this.state.files){
      files.push(
        {key:file}
      );
    }

    return <FlatList
              data={files}
              renderItem={({item}) => <SampleBox onMove={this.handleSampleMove} name={item.key}></SampleBox>}
            />;
  }

  displaySample = (item) =>{
    if(!item.movable){
      return <SampleBox onMove={this.handleSampleMove} name={item.key}></SampleBox>;
    }
    else{
      return <SampleBox onRelease={()=>{}} onMove={()=>{}} name={item.key+"(X)"}></SampleBox>
    }
  }

  handleSampleMove = (sample) => {
    let { eles } = this.state;
    let ind=0
    let i=0;

    for(let ele of eles){
      if(ele.key===sample){
        ele.movable=true
      }
      else{
        ele.movable=false
      }
    }
    this.setState(eles:eles);

    this.props.onSampleMove(sample);
  }

  render() {
    //let samples = this.display_samples();
    return (
      <View style={styles.container}>
        {/* <Button onPress={()=>this.read_files()} title="Load!"/> */}
        <FlatList
          data={this.state.eles}
          extraData={this.state}
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
