const { withAndroidManifest } = require('@expo/config-plugins');

const ANDROID_PACKAGE = 'com.focusflow.app';

module.exports = function withFocusBlock(config) {
  config = ensureAndroidPackage(config);

  config = withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults.manifest;

    manifest['uses-permission'] = manifest['uses-permission'] || [];
    const hasPermission = (name) =>
      manifest['uses-permission'].some((p) => p.$ && p.$['android:name'] === name);
    if (!hasPermission('android.permission.SYSTEM_ALERT_WINDOW')) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.SYSTEM_ALERT_WINDOW' },
      });
    }
    if (!hasPermission('android.permission.VIBRATE')) {
      manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.VIBRATE' },
      });
    }

    manifestConfig.modResults = { manifest };
    return manifestConfig;
  });

  return config;
};

function ensureAndroidPackage(config) {
  if (!config.android) {
    config.android = {};
  }
  if (!config.android.package) {
    config.android.package = ANDROID_PACKAGE;
  }
  return config;
}