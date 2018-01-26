import React, { Component } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

let RNFS = require('react-native-fs')

export default class SampleBrowser extends Component {
  constructor(props){
    super(props);
    this.state = {files: []}
  }
  componentDidMount(){
    this.write_dummy_samples();
  }

  write_dummy_samples() {
    for(var i=1;i<10;i++){
      let sample = '/sample'+i+'.wav';
      RNFS.writeFile(RNFS.DocumentDirectoryPath+sample, 'tomt :(', 'utf8')
        .then((success) => {
          console.log('FILE WRITTEN!');
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }

  update_files(files) {
    this.setState({files:files},()=>{
      console.log("updated files", this.state.files)
    })
  }

  read_files() {
    // get a list of files and directories in the main bundle
    RNFS.readdir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        console.log('GOT RESULT');
        let files = [];
        result.forEach((value,i)=>{
          files.push(value);
        })

        this.update_files(files);

      })
      .catch((err) => {
        console.log(err.message, err.code);
      });
  }

  display_samples(){
    files = []
    for(let file of this.state.files){
      files.push({key:file});
    }
    console.log("ey",files)
    return <FlatList
              data={files}
              renderItem={({item}) => <Text>{item.key}</Text>}
            />
  }
  render() {
    let samples = this.display_samples();
    console.log(samples)
    return (
      <View style={styles.container}>
        <Button onPress={()=>this.read_files()} title="Load!"/>
        {samples}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d9d9',
    height: '90%'
  }
});
