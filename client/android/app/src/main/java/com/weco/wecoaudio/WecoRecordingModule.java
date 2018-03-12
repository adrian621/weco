package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.Manifest;
import android.content.pm.PackageManager;
import android.media.AudioRecord;
import android.media.AudioFormat;
import android.media.MediaRecorder;
import android.media.MediaRecorder.AudioSource;
import android.os.AsyncTask;

import java.io.File;
import java.io.IOException;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.io.BufferedOutputStream;

public class WecoRecordingModule extends ReactContextBaseJavaModule {
    private AudioRecorder audioRecorder;

    public WecoRecordingModule(ReactApplicationContext reactContext){
      super(reactContext);
      this.audioRecorder = new AudioRecorder();
    }

    @ReactMethod
    public void startRecording(int trackId, Callback cb) {
      audioRecorder.setCB(cb);
      audioRecorder.setFileName(Integer.toString(trackId));
      //AsyncTask.execute(audioRecorder);
      // AsyncTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, audioRecorder);
      //audioRecorder.execute();
      audioRecorder.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void stopRecording(Callback cb) {
      audioRecorder.stop();
      audioRecorder = new AudioRecorder();
      cb.invoke();
    }
    //Inner class for recording sounds
    //Can be used with AsyncTask.execute()
    private class AudioRecorder extends AsyncTask {
      private final int SAMPLING_RATE = 44100;
      private final int AUDIO_SOURCE = MediaRecorder.AudioSource.VOICE_RECOGNITION;
      private final int CHANNEL_IN_CONFIG = AudioFormat.CHANNEL_IN_STEREO;
      private final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;
      private final int BUFFER_SIZE = AudioRecord.getMinBufferSize(SAMPLING_RATE, CHANNEL_IN_CONFIG, AUDIO_FORMAT);

      private String storagePath;
      private String fileName;
      private boolean mStop;
      private int fileIndex;
      private Callback cb;

      public AudioRecorder(){
        //Get storage path
        File tmp = getReactApplicationContext().getFilesDir();
        this.storagePath = tmp.getAbsolutePath();
        this.mStop = false;
        this.fileIndex = 0;
      }

      public void setCB(Callback cb){
        this.cb = cb;
      }
      public void setFileName(String fileName){
        this.fileName = fileName;
      }

      public void stop(){
        mStop=true;
      }

      @Override
      protected Object doInBackground(Object... params){
        // android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_URGENT_AUDIO);

        mStop = false;
        int iterator = 0;

        String fullFileName = fileName+"_"+Integer.toString(fileIndex)+".wav";
        String filePath = storagePath+"/"+fullFileName;

        //Does file exist? change name iteratively until no.
        while(new File(filePath).isFile()){
          fileIndex+=1;
          fullFileName = fileName+"_"+Integer.toString(fileIndex)+".wav";
          filePath = storagePath+"/"+fullFileName;;
        }

        byte audioData[] = new byte[BUFFER_SIZE];
        AudioRecord recorder = new AudioRecord(AUDIO_SOURCE,
                    SAMPLING_RATE, CHANNEL_IN_CONFIG,
                    AUDIO_FORMAT, BUFFER_SIZE);

        recorder.startRecording();

        BufferedOutputStream os = null;
        try {
            os = new BufferedOutputStream(new FileOutputStream(filePath));
        } catch (FileNotFoundException e) {
        }

        while (!mStop) {
            if(iterator > 100000){
              mStop = true;
            }
            iterator+=1;
            int status = recorder.read(audioData, 0, audioData.length);

            if (status == AudioRecord.ERROR_INVALID_OPERATION ||
                status == AudioRecord.ERROR_BAD_VALUE) {
                return null;
            }

            try {
                os.write(audioData, 0, audioData.length);
            } catch (IOException e) {
                return null;
            }
        }

        try {
            os.close();
            recorder.stop();
            recorder.release();
            mStop = false;
            cb.invoke(fullFileName);

        } catch (IOException e) {
        }
        return null;
      }
    }

    @Override
    public String getName() {
        return "WecoRecord";
    }

}
