import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';


export default class TimeLine extends Component {
  constructor(){
    super();
    this.state = {
      points:4,
      width: 0,
      pWidth: 0
    };
  }

  handleLayout = (e) =>{
    this.setState({width: e.nativeEvent.layout.width})
  }
  handlePLayout = (e) =>{
    this.setState({pWidth: e.nativeEvent.layout.width})
  }
  displayPoints(){

  }
  render(){
    let points = [];
    let pointSeparation = (this.state.width-(this.state.pWidth*this.state.points))/(this.state.points+1);
    for(let i =0; i<this.state.points; i++){
      points.push(<View key={i} onLayout={this.handlePLayout} style={[styles.point,{marginLeft: pointSeparation}]}></View>);
    }

    return(
      <View onLayout={this.handleLayout} style={styles.line}>
        {points}
      </View>
    );

  }

}

styles = StyleSheet.create({
  line:{
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    marginBottom:10,
    flexDirection: 'row',
  },
  point:{
    backgroundColor:'black',

    width:3,
    height:7
  }

});
