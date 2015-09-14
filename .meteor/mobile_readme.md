# run on device:
meteor run android-device

---
after run on device one can find the builds at:
.meteor/local/cordova-build/platforms/android/ant-build

---
to add permissions to the android project look at:
.meteor/local/cordova-build/platforms/android/AndroidManifest.xml.
add:
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

