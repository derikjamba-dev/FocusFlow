package com.focusflow.focusblock;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.provider.Settings;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.annotation.Nonnull;

public class FocusBlockModule extends ReactContextBaseJavaModule {

  public static final String NAME = "FocusBlock";

  private final ReactApplicationContext reactContext;
  private final Set<String> activeBlockedPackages = new HashSet<>();

  public FocusBlockModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  @Nonnull
  public String getName() {
    return NAME;
  }

  public void emitEvent(String name, WritableMap data) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(name, data);
  }

  private FocusBlockAccessibilityService getService() {
    return FocusBlockAccessibilityService.getInstance();
  }

  @ReactMethod
  public void startBlocking(ReadableArray packages, ReadableMap options) {
    activeBlockedPackages.clear();
    if (packages != null) {
      for (int i = 0; i < packages.size(); i++) {
        activeBlockedPackages.add(packages.getString(i));
      }
    }

    int graceSeconds = 30;
    int unlockLimit = 2;
    if (options != null) {
      if (options.hasKey("graceSeconds")) {
        graceSeconds = options.getInt("graceSeconds");
      }
      if (options.hasKey("unlockLimit")) {
        unlockLimit = options.getInt("unlockLimit");
      }
    }

    FocusBlockAccessibilityService service = getService();
    if (service != null) {
      service.startBlocking(new HashSet<>(activeBlockedPackages), graceSeconds * 1000L, unlockLimit);
    }
  }

  @ReactMethod
  public void stopBlocking() {
    activeBlockedPackages.clear();
    FocusBlockAccessibilityService service = getService();
    if (service != null) {
      service.stopBlocking();
    }
  }

  @ReactMethod
  public void hasBlockedPackages(Promise promise) {
    promise.resolve(activeBlockedPackages.size() > 0);
  }

  @ReactMethod
  public void isAccessibilityServiceEnabled(Promise promise) {
    promise.resolve(FocusBlockAccessibilityService.isServiceEnabled(reactContext));
  }

  @ReactMethod
  public void getBlockState(Promise promise) {
    WritableMap map = Arguments.createMap();
    FocusBlockAccessibilityService service = getService();
    if (service != null) {
      map.putBoolean("active", service.isFocusActive());
      map.putInt("unlocksUsed", service.getUnlockUses());
      map.putInt("unlockLimit", service.getUnlockLimit());
      map.putDouble("graceRemainingMs", (double) service.graceRemainingMillis());
    } else {
      map.putBoolean("active", false);
      map.putInt("unlocksUsed", 0);
      map.putInt("unlockLimit", 2);
      map.putDouble("graceRemainingMs", 0);
    }
    promise.resolve(map);
  }

  @ReactMethod
  public void openAccessibilitySettings() {
    Activity activity = getCurrentActivity();
    Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    if (activity != null) {
      activity.startActivity(intent);
    } else {
      reactContext.startActivity(intent);
    }
  }

  @ReactMethod
  public void getInstalledApps(Promise promise) {
    try {
      PackageManager pm = reactContext.getPackageManager();
      Intent launcherIntent = new Intent(Intent.ACTION_MAIN);
      launcherIntent.addCategory(Intent.CATEGORY_LAUNCHER);
      List<ResolveInfo> apps = pm.queryIntentActivities(launcherIntent, 0);

      WritableArray result = Arguments.createArray();
      String selfPackage = reactContext.getPackageName();
      for (ResolveInfo info : apps) {
        String packageName = info.activityInfo.packageName;
        if (packageName.equals(selfPackage)) {
          continue;
        }
        String label = String.valueOf(info.loadLabel(pm));
        WritableMap map = Arguments.createMap();
        map.putString("packageName", packageName);
        map.putString("label", label);
        result.pushMap(map);
      }
      promise.resolve(result);
    } catch (Exception e) {
      promise.reject("GET_APPS_ERROR", "Falha ao listar aplicações", e);
    }
  }
}