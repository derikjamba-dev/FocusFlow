package com.focusflow.focusblock;

import android.accessibilityservice.AccessibilityService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;

import java.util.HashSet;
import java.util.Set;

public class FocusBlockAccessibilityService extends AccessibilityService {

  private static FocusBlockAccessibilityService instance;

  private final Set<String> blockedPackages = new HashSet<>();
  private volatile boolean focusActive = false;
  private long graceUntilMs = 0;
  private int unlockUses = 0;
  private int unlockLimit = 2;
  private long graceDurationMs = 30_000L;

  private BlockOverlayView overlayView;

  public static FocusBlockAccessibilityService getInstance() {
    return instance;
  }

  public static boolean isServiceEnabled(Context context) {
    String enabled = Settings.Secure.getString(
        context.getContentResolver(),
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
    if (enabled == null) {
      return false;
    }
    ComponentName component = new ComponentName(context, FocusBlockAccessibilityService.class);
    String flatten = component.flattenToString();
    for (String name : enabled.split(":")) {
      if (name.equalsIgnoreCase(flatten)) {
        return true;
      }
    }
    return false;
  }

  @Override
  protected void onServiceConnected() {
    super.onServiceConnected();
    instance = this;
  }

  @Override
  public boolean onUnbind(Intent intent) {
    hideOverlay();
    if (instance == this) {
      instance = null;
    }
    return super.onUnbind(intent);
  }

  @Override
  public void onDestroy() {
    hideOverlay();
    if (instance == this) {
      instance = null;
    }
    super.onDestroy();
  }

  public void startBlocking(Set<String> packages, long graceDurationMs, int unlockLimit) {
    this.blockedPackages.clear();
    this.blockedPackages.addAll(packages);
    this.graceDurationMs = graceDurationMs;
    this.unlockLimit = unlockLimit;
    this.unlockUses = 0;
    this.graceUntilMs = 0;
    this.focusActive = true;
    hideOverlay();
  }

  public void stopBlocking() {
    this.focusActive = false;
    this.blockedPackages.clear();
    this.unlockUses = 0;
    this.graceUntilMs = 0;
    hideOverlay();
  }

  public void grantGrace() {
    if (!focusActive) {
      return;
    }
    if (unlockUses >= unlockLimit) {
      return;
    }
    unlockUses++;
    graceUntilMs = System.currentTimeMillis() + graceDurationMs;
    hideOverlay();
  }

  public boolean isFocusActive() {
    return focusActive;
  }

  public int getUnlockUses() {
    return unlockUses;
  }

  public int getUnlockLimit() {
    return unlockLimit;
  }

  public long graceRemainingMillis() {
    if (!focusActive) {
      return 0;
    }
    long diff = graceUntilMs - System.currentTimeMillis();
    return diff > 0 ? diff : 0;
  }

  @Override
  public void onAccessibilityEvent(AccessibilityEvent event) {
    if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
      return;
    }

    if (!focusActive || blockedPackages.isEmpty()) {
      hideOverlay();
      return;
    }

    CharSequence pkg = event.getPackageName();
    if (pkg == null) {
      hideOverlay();
      return;
    }

    String packageName = pkg.toString();
    if (!blockedPackages.contains(packageName)) {
      hideOverlay();
      return;
    }

    if (System.currentTimeMillis() < graceUntilMs) {
      hideOverlay();
      return;
    }

    showOverlay();
  }

  @Override
  public void onInterrupt() {
    // no-op
  }

  private void showOverlay() {
    if (overlayView != null) {
      return;
    }
    try {
      WindowManager wm = (WindowManager) getSystemService(WINDOW_SERVICE);
      BlockOverlayView.OverlayListener listener = new BlockOverlayView.OverlayListener() {
        @Override
        public boolean canUnlock() {
          return unlockUses < unlockLimit;
        }

        @Override
        public int unlocksRemaining() {
          return unlockLimit - unlockUses;
        }

        @Override
        public int unlocksLimit() {
          return unlockLimit;
        }

        @Override
        public long graceSeconds() {
          return graceDurationMs / 1000L;
        }

        @Override
        public void onUnlock() {
          grantGrace();
        }
      };
      overlayView = new BlockOverlayView(this, listener);
      overlayView.bind();
      wm.addView(overlayView, overlayView.getOverlayParams());
    } catch (Exception e) {
      overlayView = null;
    }
  }

  private void hideOverlay() {
    if (overlayView == null) {
      return;
    }
    try {
      WindowManager wm = (WindowManager) getSystemService(WINDOW_SERVICE);
      wm.removeView(overlayView);
    } catch (Exception ignored) {
      // no-op
    }
    overlayView = null;
  }
}