package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

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
    public void mixSound(Callback callback) throws IOException {
      AudioTrack audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC, 44100, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_16BIT, 44100, AudioTrack.MODE_STREAM);

      InputStream in1 =  getReactApplicationContext().getResources().openRawResource(
            getReactApplicationContext().getResources().getIdentifier("sample1_raw",
            "raw", getReactApplicationContext().getPackageName()));
      InputStream in2 =  getReactApplicationContext().getResources().openRawResource(
            getReactApplicationContext().getResources().getIdentifier("sample2_raw",
            "raw", getReactApplicationContext().getPackageName()));
      /*
      InputStream in1=getReactApplicationContext().getResources().openRawResource(R.raw.track1);
      InputStream in2=getReactApplicationContext().getResources().openRawResource(R.raw.track2);
      */

      byte[] music1 = null;
      music1= new byte[in1.available()];
      music1=convertStreamToByteArray(in1);
      in1.close();


      byte[] music2 = null;
      music2= new byte[in2.available()];
      music2=convertStreamToByteArray(in2);
      in2.close();

      int len = music1.length;
      if(music1.length < music2.length) {
        len = music2.length;
      }

      byte[] output = new byte[len];

      audioTrack.play();

      for(int i=0; i < output.length; i++){

          float samplef1;
          float samplef2;
          if(music1.length-1 <= i) {
            samplef1 = 0;
          }
          else {
            samplef1 = music1[i] / 128.0f;
          }
          if(music2.length-1 <= i) {
            samplef2 = 0;
          }
          else {
            samplef2 = music2[i] / 128.0f;
          }


          float mixed = samplef1 + samplef2;
          // reduce the volume a bit:
          mixed *= 0.8;
          // hard clipping
          if (mixed > 1.0f) mixed = 1.0f;

          if (mixed < -1.0f) mixed = -1.0f;

          byte outputSample = (byte)(mixed * 128.0f);
          output[i] = outputSample;

      }   //for loop
      audioTrack.write(output, 0, output.length);
    }

    @Override
    public String getName() {
        return "WecoAudio";
    }

}
