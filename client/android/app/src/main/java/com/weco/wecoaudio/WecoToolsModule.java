package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableArray;

import android.os.AsyncTask;
import android.widget.Toast;

import java.io.File;
import java.io.IOException;
import java.io.FileOutputStream;
import java.io.BufferedOutputStream;

public class WecoToolsModule extends ReactContextBaseJavaModule {
    private String storagePath;

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
