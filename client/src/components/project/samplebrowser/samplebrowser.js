import React, { Component } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import SampleBox from './samplebox';
import MovingSampleBox from './movingsamplebox';

let RNFS = require('react-native-fs')

export default class SampleBrowser extends Component {
  constructor(props){
    super(props);
    this.state = {files: [], yOffset: 0}
  }

  componentDidMount(){
    //this.clear_files();
    this.write_dummy_samples();
  }

  write_dummy_samples() {
    for(var i=1;i<=3;i++){
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

  read_files() {
    // get a list of files and directories in the main bundle
    RNFS.readdir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        let files = [];
        let samples = [] //This list is for sending to project.js->trackmanager
        let j=0;
        result.forEach((value,i)=>{
          if(value!='ReactNativeDevBundle.js'){
            files.push({key: value,index:j});
            samples.push(value);
            j=j+1;
          }
        })
        this.update_files(files);
        this.props.onFilesLoaded(samples);

      })
      .catch((err) => {
        console.log(err.message, err.code);
      });
  }

  clear_files() {
    RNFS.readdir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        result.forEach((value,i)=>{
          RNFS.unlink(RNFS.DocumentDirectoryPath+'/'+value)
            .then(() => {
              console.log('FILE DELETED');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch((err) => {
              console.log(err.message);
            });
        })


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
        <FlatList
          style={styles.list}
          data={this.state.files}
          extraData={this.state}
          onScroll={this.handleScroll}
          renderItem={({item}) => this.displaySample(item)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
    borderRightWidth:0,
    borderColor: 'black',
  },
  list: {
  }
});
