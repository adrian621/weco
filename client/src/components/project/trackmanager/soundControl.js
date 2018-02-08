import React, { Component } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';


export default class soundControl extends Component {



play = () =>{

    //alert("play")

}

stop = () =>{
    alert("stop")

}

pause = () =>{
    alert("pause")

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
