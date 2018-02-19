package com.weco.wecoaudio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class WecoAudioModule extends ReactContextBaseJavaModule {
    public WecoAudioModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void test(Callback callback) {
      callback.invoke("This was sent from WecoAudioModule!");
    }

    @Override
    public String getName() {
        return "WecoAudio";
    }

}
