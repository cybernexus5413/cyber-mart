# MINI MART 24 — Android 6.0.1 Vending Kiosk Wrapper

Native Android `WebView` kiosk wrapper targeting **Android 6.0.1 (API 23, `armeabi-v7a`)** with portrait lock, sticky immersive fullscreen, back-button lock, and the **`HCZN`** binary serial motor bridge (`window.AndroidVending.dispense(row, col)`).

## 3-Step Android Studio Build Guide

### Step 1: Create Project & Copy Native Library (`libmachineLib.so`)
1. Open **Android Studio** and create a new **Empty Activity** (Kotlin) project with package name `com.minimart24.kiosk`.
2. In `app/build.gradle`, configure the target SDK, minimum SDK, and 32-bit ARM ABI filter:
   ```gradle
   android {
       compileSdk 23
       defaultConfig {
           applicationId "com.minimart24.kiosk"
           minSdk 21
           targetSdk 23
           versionCode 1
           versionName "1.0"
           ndk {
               abiFilters "armeabi-v7a"
           }
       }
   }
   ```
3. Copy your vending machine vendor's **`libmachineLib.so`** file into:
   ```text
   app/src/main/jniLibs/armeabi-v7a/libmachineLib.so
   ```

### Step 2: Drop In the Wrapper Files & Set Your PWA URL
1. Replace `app/src/main/AndroidManifest.xml` with `/android-kiosk-wrapper/AndroidManifest.xml`.
2. Copy `/android-kiosk-wrapper/java/android_serialport_api/SerialPort.kt` into `app/src/main/java/android_serialport_api/SerialPort.kt`.
3. Copy `/android-kiosk-wrapper/java/com/minimart24/kiosk/MainActivity.kt` into `app/src/main/java/com/minimart24/kiosk/MainActivity.kt`.
4. In `MainActivity.kt`, update `KIOSK_URL` to your hosted **MINI MART 24** PWA URL (and adjust `DEFAULT_SERIAL_PORT` between `/dev/ttyS1`–`/dev/ttyS4` or baud `9600`/`115200` if your control board uses a different UART port).

### Step 3: Build the APK
1. Connect your Android 6.0.1 vending board (or export a signed/debug APK).
2. In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Install the generated APK onto the vending machine (`adb install -r app-debug.apk`).
