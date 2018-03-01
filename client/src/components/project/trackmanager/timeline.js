import React, { Component } from 'react';
import { Slider,StyleSheet, Text, View, Button } from 'react-native';


export default class TimeLine extends Component {
  constructor(){
    super();
    this.state = {
      width: 0,
      pWidth: 0,
      time: 0,
      stopped: false,
      paused: false,
      sliderBusy: false,
      maxValue: 0,
      pointsMeasured: false
    };
  }

  componentWillReceiveProps(nextProps){
    //Scope of trackmanager changed
    if(nextProps.bars != this.props.bars){
      this.setState({pointsMeasured: false})
    }
    //nextProps.bpm != this.props.bpm when functionality for changing bpm exists
    if(nextProps.bpm){
      this.setMaxValue(nextProps.bpm);
    }
    if(nextProps.playing && !this.props.playing){
      this.playTimeLine();
    }
    if(nextProps.stopped && !this.props.stopped){
      this.stopTimeLine();
    }
    if(nextProps.paused && !this.props.paused){
      this.pauseTimeLine();
    }
  }

  handleLayout = (e) =>{
    this.setState({width: e.nativeEvent.layout.width})
  }

  handlePLayout = (e) =>{
    if(!this.state.pointsMeasured){
      this.setState({pWidth: e.nativeEvent.layout.width, pointsMeasured: true})
    }
  }

  playTimeLine = () =>{
    this.setState({stopped: false, paused: false});

    let start = Date.now();
    let prevTime = this.state.time;

    let timer = setInterval(()=>{
      this.setState({time: prevTime+(Date.now()-start)},()=>{
        if(this.state.stopped || this.state.time>=this.state.maxValue){
          clearInterval(timer);
          this.setState({time: 0})
          this.props.onSlideComplete(0);
          this.props.playDone();
        }
        if(this.state.paused){
          clearInterval(timer);
        }
      });
    }, 1);
  }

  stopTimeLine = () =>{
    this.setState({stopped: true, time: 0})
  }

  pauseTimeLine = () =>{
    this.props.onSlideComplete(this.state.time/this.state.maxValue);
    this.setState({paused: true})
  }

  setMaxValue = (bpm) =>{
    this.setState({maxValue: (4*this.props.bars/bpm)*60*1000})
  }

  handleSlideComplete = (val)=>{
    this.setState({time: val})

    //Convert ms to percentage
    this.props.onSlideComplete(val/this.state.maxValue);
  }

  displayPoints = ()=>{

    let points = [];
    let nPoints = this.props.bars*3;
    let pointSeparation = (this.state.width-(this.state.pWidth*nPoints))/(nPoints+1);

    for(let i =0; i<nPoints; i++){
      points.push(<View key={i} onLayout={this.handlePLayout} style={[styles.point,{marginLeft: pointSeparation}]}></View>);
    }


    return points;
  }

  render(){
    let sliderWidth = this.props.bars*1000;

    return(
      <View onLayout={this.handleLayout} style={styles.line}>
        <Slider maximumValue={this.state.maxValue}  value={this.state.time} removeClippedSubviews={true}
          onSlidingComplete={this.handleSlideComplete} style={styles.slider}></Slider>
        {this.displayPoints()}
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
