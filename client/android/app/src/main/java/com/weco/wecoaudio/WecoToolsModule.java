package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

import android.os.AsyncTask;
import android.widget.Toast;
import android.media.AudioRecord;
import android.media.AudioFormat;

import java.io.File;
import java.io.IOException;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class WecoToolsModule extends ReactContextBaseJavaModule {
    private String storagePath;
    private final int SAMPLING_RATE = 44100;
    private final int CHANNEL_IN_CONFIG = AudioFormat.CHANNEL_IN_STEREO;
    private final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
    private final int BUFFER_SIZE = AudioRecord.getMinBufferSize(SAMPLING_RATE, CHANNEL_IN_CONFIG, AUDIO_FORMAT);

    public WecoToolsModule(ReactApplicationContext reactContext){
      super(reactContext);

      File tmp = getReactApplicationContext().getFilesDir();
      this.storagePath = tmp.getAbsolutePath();
    }

    @ReactMethod
    public void decodeSample(ReadableArray audioData_, int buffer_size_, String fileName_){
      // Decoder d = new Decoder(audioData, buffer_size, fileName);
      // d.execute();
      final ReadableArray audioData = audioData_;
      final int buffer_size = buffer_size_;
      final String fileName = fileName_;

      new Thread(new Runnable() {
        public void run() {
          String filePath = storagePath+"/received-"+fileName;

          BufferedOutputStream os = null;
          try {
              os = new BufferedOutputStream(new FileOutputStream(filePath));
          } catch (Exception e) {
          }

          byte[] byteData = new byte[buffer_size];

          // Toast.makeText(getReactApplicationContext(), "        "+Integer.toString(buffer_size), Toast.LENGTH_LONG).show();

          for(int i = 0; i < audioData.size(); i++){
            ReadableArray dataPiece = audioData.getArray(i);
            // Toast.makeText(getReactApplicationContext(), +Integer.toString(dataPiece.size()), Toast.LENGTH_LONG).show();
            for(int j = 0; j < dataPiece.size(); j++){
              byteData[j] = (byte)(dataPiece.getInt(j));
            }

            try {
                os.write(byteData, 0, byteData.length);
            } catch (IOException e) {

              // Toast.makeText(getReactApplicationContext(), "FAILED TO WRITE TO OS IN WECOTOOLS", Toast.LENGTH_SHORT).show();
              return;
            }
          }
          //
          try {
              os.close();
              // Toast.makeText(getReactApplicationContext(), "Received new sample", Toast.LENGTH_SHORT).show();
          } catch (IOException e) {
            // Toast.makeText(getReactApplicationContext(), "FAILED TO CLOSE OS IN WECOTOOLS", Toast.LENGTH_SHORT).show();
          }

        }


    }).start();

    }
    @ReactMethod
    public void encodeSample(String fp, String fn, Callback cb){
      final String filePath = fp;
      final String fileName = fn;
      final Callback callback = cb;

      new Thread(new Runnable() {
        public void run() {
          File puta = new File(filePath);
          InputStream in;
          byte[] data;

          try{
            in = new FileInputStream(puta);
          } catch(FileNotFoundException e){
            return;
          }

          try{
            data = convertStreamToByteArray(in);
          } catch(IOException e){
            return;
          }


          WritableArray bridgeData = new WritableNativeArray();
          //Convert to react-native array
          for(byte b : data){
            bridgeData.pushInt(b);
          }
          callback.invoke(bridgeData, fileName);

        }

      }).start();


    }

    @ReactMethod
    public void decodez(ReadableArray bridgeData, String fileName){
      String filePath = storagePath+"/received-"+fileName;
      BufferedOutputStream os = null;

      try{
        os = new BufferedOutputStream(new FileOutputStream(filePath));
      } catch(Exception e){

      }
      byte[] data = new byte[bridgeData.size()];
      byte[] buffData = new byte[BUFFER_SIZE];

      //Convert RA to byte array
      for(int i = 0; i < bridgeData.size();i++){
        data[i]=(byte)bridgeData.getInt(i);
      }

      int offset = 0;
      int max_i = data.length / BUFFER_SIZE;

      for(int i = 0; i <= max_i; i++){
        if(i*BUFFER_SIZE>data.length)
          offset = i*BUFFER_SIZE - data.length;

        try {
            os.write(data, i*BUFFER_SIZE, BUFFER_SIZE-offset);
        } catch (IOException e) {
            return;
        }
      }
      // try {
      //     os.write(audioData, 0, audioData.length);
      //     // os.write(data);
      // } catch(Exception e){
      // } finally {
      //     try{
      //       os.close();
      //     } catch(Exception e){
      //     }
      // }
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

    private class Decoder extends AsyncTask {
      private ReadableArray audioData;
      private int buffer_size;
      private String fileName;
      private String storagePath;


      public Decoder(ReadableArray audioData, int buffer_size, String fileName){
        File tmp = getReactApplicationContext().getFilesDir();
        this.storagePath = tmp.getAbsolutePath();
        this.audioData = audioData;
        this.buffer_size = buffer_size;
        this.fileName = fileName;
      }

      @Override
      protected Object doInBackground(Object... params){
        String filePath = storagePath+"/received-"+fileName;

        BufferedOutputStream os = null;
        try {
            os = new BufferedOutputStream(new FileOutputStream(filePath));
        } catch (Exception e) {
        }

        byte[] byteData = new byte[buffer_size];

        // Toast.makeText(getReactApplicationContext(), "        "+Integer.toString(buffer_size), Toast.LENGTH_LONG).show();

        for(int i = 0; i < audioData.size(); i++){
          ReadableArray dataPiece = audioData.getArray(i);
          // Toast.makeText(getReactApplicationContext(), +Integer.toString(dataPiece.size()), Toast.LENGTH_LONG).show();
          for(int j = 0; j < dataPiece.size(); j++){
            byteData[j] = (byte)(dataPiece.getInt(j));
          }

          try {
              os.write(byteData, 0, byteData.length);
          } catch (IOException e) {

            // Toast.makeText(getReactApplicationContext(), "FAILED TO WRITE TO OS IN WECOTOOLS", Toast.LENGTH_SHORT).show();
            return null;
          }
        }
        //
        try {
            os.close();
            // Toast.makeText(getReactApplicationContext(), "Received new sample", Toast.LENGTH_SHORT).show();
        } catch (IOException e) {
          // Toast.makeText(getReactApplicationContext(), "FAILED TO CLOSE OS IN WECOTOOLS", Toast.LENGTH_SHORT).show();
        }

        return null;
      }
    }

    @Override
    public String getName() {
        return "WecoTools";
    }



}
