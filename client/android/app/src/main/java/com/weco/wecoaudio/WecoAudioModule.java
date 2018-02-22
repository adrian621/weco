package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import java.util.ArrayList;

import android.media.AudioTrack;
import android.media.AudioManager;
import android.media.AudioFormat;

import java.io.InputStream;
import java.io.IOException;
import java.io.ByteArrayOutputStream;



public class WecoAudioModule extends ReactContextBaseJavaModule {
    public WecoAudioModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void test(Callback callback) {
      callback.invoke("This was sent from WecoAudioModule!");
    }

    private static byte[] convertStreamToByteArray(InputStream is) throws IOException {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      byte[] buff = new byte[10240];
      int i;
      while ((i = is.read(buff, 0, buff.length)) > 0) {
        baos.write(buff, 0, i);
      }

      return baos.toByteArray();
    }

    @ReactMethod
    public void mixSound(ReadableArray tracks, Callback callback) throws IOException {
      AudioTrack audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC, 44100, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_16BIT, 44100, AudioTrack.MODE_STREAM);
      if(tracks.size() == 0){
          return;
      }
      
      ArrayList<byte[]> r = new ArrayList<byte[]>();
      int len = 0;

      for(int i = 0; i < tracks.size(); i++){
        InputStream in1 =  getReactApplicationContext().getResources().openRawResource(
        getReactApplicationContext().getResources().getIdentifier(tracks.getString(i),
        "raw", getReactApplicationContext().getPackageName()));
            
        byte[] music1 = null;
        music1= new byte[in1.available()];
        music1=convertStreamToByteArray(in1);
        if(music1.length > len){
            len = music1.length;
        } 
        r.add(music1);
        in1.close();
      }

      byte[] output = new byte[len];

      audioTrack.play();

      for(int i=0; i < output.length; i++){           
         
          float mixed = 0;
         
          for(int j= 0; j < r.size(); j++){
              
              float sample;
              
              if(r.get(j).length-1 >= i){
                sample = r.get(j)[i] / 128.0f;
              }
              else{
                sample = 0;
              } 
              mixed = mixed+sample;
          }
          // reduce the volume a bit:
          mixed *= 1/tracks.size();

          // hard clipping
          if (mixed > 1.0f) mixed = 1.0f;
          if (mixed < -1.0f) mixed = -1.0f;
        
          byte outputSample = (byte)(mixed * 128.0f);
          output[i] = outputSample;
      }
      
      audioTrack.write(output, 0, output.length);
    }

    @Override
    public String getName() {
        return "WecoAudio";
    }

}
