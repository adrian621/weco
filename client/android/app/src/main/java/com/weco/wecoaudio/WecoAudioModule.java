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
import android.os.AsyncTask;

import java.io.InputStream;
import java.io.IOException;
import java.io.ByteArrayOutputStream;



public class WecoAudioModule extends ReactContextBaseJavaModule {
    private SoundMixer sMixer;

    public WecoAudioModule(ReactApplicationContext reactContext) {
      super(reactContext);
      sMixer = new SoundMixer();
    }

    @ReactMethod
    public void test(Callback callback) {
      callback.invoke();
    }


    @ReactMethod
    public void mixSound(ReadableArray tracks, Callback callback){
      sMixer = new SoundMixer(tracks);

      AsyncTask.execute(sMixer);
    }

    @ReactMethod
    public void stopSound(){
      sMixer.stop();
    }

    @ReactMethod
    public void pauseSound(){
      sMixer.pause();
    }

    //Inner class for mixing and playing sounds
    //Can be used with AsyncTask.execute()
    private class SoundMixer implements Runnable{
      private ArrayList<byte[]> r;
      AudioTrack audioTrack;
      private int longestSmpLen;

      public SoundMixer(){
        audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC, 44100, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_16BIT, 44100, AudioTrack.MODE_STREAM);
        r =  new ArrayList<byte[]>();
        longestSmpLen = 0;
      }

      public SoundMixer(ReadableArray tracks){
        audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC, 44100, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_16BIT, 44100, AudioTrack.MODE_STREAM);

        try{
          loadBytes(tracks);
        } catch(IOException e){
          System.err.println("Caught IOException: " + e.getMessage());
        }
      }

      public void loadBytes(ReadableArray tracks) throws IOException{
        r =  new ArrayList<byte[]>();

        longestSmpLen = 0;

        for(int i = 0; i < tracks.size(); i++){
          InputStream in =  getReactApplicationContext().getResources().openRawResource(
          getReactApplicationContext().getResources().getIdentifier(tracks.getString(i),
          "raw", getReactApplicationContext().getPackageName()));

          byte[] music = null;
          music = new byte[in.available()];
          music = convertStreamToByteArray(in);
          if(music.length > longestSmpLen){
              longestSmpLen = music.length;
          }
          r.add(music);
          in.close();
        }
      }

      public void stop(){
        audioTrack.stop();
      }

      public void pause(){
        //This results in the same behavior as stop at the moment.
        //To be fixed!
        audioTrack.pause();
      }

      @Override
      public void run(){
        if(r.size() == 0){
            return;
        }

        byte[] output = new byte[longestSmpLen];

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
          mixed *= 1/0.7;

          // hard clipping
          if (mixed > 1.0f) mixed = 0.9f;
          if (mixed < -1.0f) mixed = -0.9f;

          output[i] = (byte)(mixed * 128.0f);
        }

        audioTrack.write(output, 0, output.length);
      }

      private byte[] convertStreamToByteArray(InputStream is) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buff = new byte[10240];
        int i;
        while ((i = is.read(buff, 0, buff.length)) > 0) {
          baos.write(buff, 0, i);
        }

        return baos.toByteArray();
      }

    }

    @Override
    public String getName() {
        return "WecoAudio";
    }

}