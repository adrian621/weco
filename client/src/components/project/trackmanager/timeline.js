import React, { Component } from 'react';
import { Slider,StyleSheet, Text, View, Button } from 'react-native';


export default class TimeLine extends Component {
  constructor(){
    super();
    this.state = {
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
    let nPoints = this.props.bars*3;
    let sliderWidth = this.props.bars*1000;

    let pointSeparation = (this.state.width-(this.state.pWidth*nPoints))/(nPoints+1);
    for(let i =0; i<nPoints; i++){
      points.push(<View key={i} onLayout={this.handlePLayout} style={[styles.point,{marginLeft: pointSeparation}]}></View>);
    }

    return(
      <View onLayout={this.handleLayout} style={styles.line}>
        <Slider removeClippedSubviews={true} style={styles.slider}></Slider>
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
  slider:{
    position:'absolute',
    marginLeft:-16,
    marginRight:-16,
    left: 0,
    right: 0,
  },
  point:{
    backgroundColor:'black',
    width:3,
    height:7
  }

});
