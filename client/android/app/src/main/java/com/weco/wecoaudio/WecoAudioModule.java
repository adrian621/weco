package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;


import android.media.AudioTrack;
import android.media.AudioManager;
import android.media.AudioFormat;
import android.os.AsyncTask;
import android.media.MediaPlayer;

import java.io.InputStream;
import java.io.IOException;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.lang.Math;
import java.io.File;
import java.io.FileInputStream;


public class WecoAudioModule extends ReactContextBaseJavaModule {
    private SoundMixer sMixer;
    private float timeMarker;

    public WecoAudioModule(ReactApplicationContext reactContext) {
      super(reactContext);
      sMixer = new SoundMixer();
    }

    @ReactMethod
    public void init(float bpm, int visibleBars){
      sMixer.setProperties(bpm, visibleBars);
    }

    //Will be used when BPM is adjustable
    @ReactMethod
    public void setBPM(float bpm){
      sMixer.setBPM(bpm);
    }

    //Will be used when bars visible is adjustable
    @ReactMethod
    public void setBars(int visibleBars){
      sMixer.setBars(visibleBars);
    }

    @ReactMethod
    public void playSound(){
      // AsyncTask.execute(sMixer);
      sMixer.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void mix(ReadableArray tracks){
      sMixer.mix(tracks);
      sMixer.setTimeMarker(this.timeMarker);
    }

    @ReactMethod
    public void stopSound(){
      sMixer.stop();
      sMixer = new SoundMixer(sMixer);
    }

    @ReactMethod
    public void pauseSound(){
      sMixer.pause();
      sMixer = new SoundMixer(sMixer);
    }

    @ReactMethod
    public void setTimeMarker(float timeMarker){
      this.timeMarker = timeMarker;
      sMixer.setTimeMarker(this.timeMarker);
    }

    //Inner class for mixing and playing sounds
    //Can be used with AsyncTask.execute()
    private class SoundMixer extends AsyncTask {
      private AudioTrack audioTrack;
      private int longestSmpLen;
      private int progress;
      private int roundedProgress;
      private Callback callback;
      private byte[] output;
      private float timeMarker;
      private float bpm;
      private int visibleBars;
      private int maxValue;
      private String storagePath;
      private ArrayList<byte[]> allByteArrays;

      public SoundMixer(){
        if(audioTrack!=null) audioTrack.release();
        audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC, 44100, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_16BIT, 44100, AudioTrack.MODE_STREAM);
        allByteArrays =  new ArrayList<byte[]>();
        longestSmpLen = 0;
        progress = 0;
        bpm = 0;
        visibleBars = 0;
        maxValue = 0;

        //Get storage path
        File tmp = getReactApplicationContext().getFilesDir();
        this.storagePath = tmp.getAbsolutePath();
      }

      //Clone Constructor
      public SoundMixer(SoundMixer sMixer){
        audioTrack = sMixer.audioTrack;
        longestSmpLen = sMixer.longestSmpLen;
        progress = sMixer.progress;
        roundedProgress = sMixer.roundedProgress;
        callback = sMixer.callback;
        output = sMixer.output;
        timeMarker = sMixer.timeMarker;
        bpm = sMixer.bpm;
        visibleBars = sMixer.visibleBars;
        maxValue = sMixer.maxValue;
        storagePath = sMixer.storagePath;
        allByteArrays = sMixer.allByteArrays;
      }

      public void setBPM(float bpm){
        this.bpm = bpm;
        maxValue = (int)((4*this.visibleBars/this.bpm)*60);
        //Not sure why necessary to multiply by 4 here, but it works! need to investigate further
        maxValue = maxValue*44100*4*2;
      }

      public void setBars(int visibleBars){
        this.visibleBars = visibleBars;
        maxValue = (int)((4*this.visibleBars/this.bpm)*60);
        //Not sure why necessary to multiply by 4 here, but it works! need to investigate further
        maxValue = maxValue*44100*4*2;
      }


      public void setProperties(float bpm, int visibleBars){
        this.setBPM(bpm);
        this.setBars(visibleBars);
      }

      public void setTimeMarker(float timeMarker){
        progress = (int)Math.round(maxValue*timeMarker);
        roundedProgress = progress%16;
        progress = progress-(roundedProgress%16);
      }


      public byte[] concatTrack(ReadableArray track) throws IOException{
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream( );

        byte [] c = new byte[44100*4*15];
        int sampleEndInd = 0;

        byte [] emptySample = new byte[44100*5];
        File puta;
        InputStream in;
        for(int i = 0; i < track.size(); i++){
            if (track.getString(i).equals("")){
              if(i >= sampleEndInd) {
                  System.arraycopy(emptySample, 0, c, i*5*44100, emptySample.length);
              }
            }
            else
            {
              //Quick solution. if sample contains 'sample' it is a preset sample in res.raw
              //else open from /data/
              if(track.getString(i).contains("sample")){
                in =  getReactApplicationContext().getResources().openRawResource(
                getReactApplicationContext().getResources().getIdentifier(track.getString(i),
                "raw", getReactApplicationContext().getPackageName()));
              }
              else{
                puta = new File(this.storagePath+"/"+track.getString(i)+".wav");
                in = new FileInputStream(puta);
              }

              byte[] music = null;
              music = new byte[in.available()];
              music = convertStreamToByteArray(in);
              System.arraycopy(music, 0, c, i*5*44100/2, music.length);
              sampleEndInd = i*5*44100+music.length;
              in.close();
            }
          }
        //output = c;
        output = new byte[c.length];
        return(c);
      }

      public void loadBytes(ReadableArray tracks) throws IOException{
       allByteArrays =  new ArrayList<byte[]>();

        for(int i=0; i<tracks.size(); i++) {
          byte [] track = concatTrack(tracks.getArray(i));
          allByteArrays.add(track);
        }

        for(int i=0; i < output.length; i++){
          float mixed = 0.0f;

          for(byte[] byArr : allByteArrays){
              float sample;

              if(byArr.length-1 >= i){
                sample = byArr[i] / 128.0f;
              }
              else{
                sample = 0.0f;
              }

              mixed = mixed + sample  - (mixed*sample);
          }

          if (mixed > 1.0f) mixed = 1.0f;
          if (mixed < -1.0f) mixed = -1.0f;

          output[i] = (byte)((mixed) * 128.0f);
        }
      }

      public void stop(){
        if(allByteArrays.size() == 0){
            return;
        }
        audioTrack.stop();
        audioTrack.flush();
        progress=0;
      }

      public void reset(){
        if(allByteArrays.size() == 0){
            return;
        }
        progress=0;
      }

      public void pause(){
        if(allByteArrays.size() == 0){
            return;
        }
        //This results in the same behavior as stop at the moment.
        //To be fixed!
        audioTrack.pause();
        audioTrack.flush();
      }

      public void mix(ReadableArray tracks){

        try {
          sMixer.loadBytes(tracks);
        } catch(IOException e){
          System.err.println("Caught IOException: " + e.getMessage());
        }
      }

      @Override
      protected Object doInBackground(Object... params){
        if(allByteArrays.size() == 0){
            return null;
        }

        audioTrack.play();
        int prevProgress = progress;
        progress = (audioTrack.write(output, prevProgress, output.length-prevProgress))+prevProgress;
        // audioTrack.flush();
        if(progress+roundedProgress == output.length){
          progress=0;
        }

        return null;
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
