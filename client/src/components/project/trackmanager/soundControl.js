import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Picker } from 'react-native';


export default class soundControl extends Component {
  constructor(){
    super();
    this.state = {
      rTrack: 0
    }
  }
  play = () =>{

      //alert("play")

  }

  stop = () =>{
    this.props.onStop();

  }

  pause = () =>{
    this.props.onPause();
  }

  record = () =>{
    this.props.onRecord();
  }

  displayPickerItems = () =>{

    let items = [];

    for(let track of this.props.tracks){
      items.push(<Picker.Item key={track.trackId} label={track.trackId+''} value={track.trackId} />);
    }

    return items;
  }

  handleSelectRTrack = (val, index) =>{
    if(this.props.recording){
      return;
    }
    this.setState({rTrack: val});
    this.props.onSelectRTrack(index);
  }
  render(){
      return(
          <View style ={styles.container}>
            <View style={{flexDirection:'row'}}>
              <View style = {{padding: 15}}>
                <Button
                title= {"Play"}
                color = "black"
                onPress = {this.props.onPlay}
                >
                </Button>
              </View>
              <View style = {{padding: 15}}>
                <Button
                title= {"Pause"}
                color = "black"
                onPress = {this.pause}
                >
                </Button>
              </View>
              <View style = {{padding: 15}}>
                <Button
                title= {"Stop"}
                color = "black"
                onPress = {this.stop}
                >
                </Button>
              </View>
            </View>
            <View>
              <Button
              title= {"Record"}
              color = "black"
              onPress = {this.record}
              >
              </Button>
              <Picker
                selectedValue={this.state.rTrack}
                onValueChange={(itemValue, itemIndex) => this.handleSelectRTrack(itemValue,itemIndex)}
                mode={'dropdown'}>
                {this.displayPickerItems()}
              </Picker>
            </View>
          </View>
      );

    }

}

styles = StyleSheet.create({
container:{
    backgroundColor: '#d9d9d9',
    borderWidth:1,
    borderColor:'black',

}


});
