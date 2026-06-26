# MoodSignal APK Build Guide

This repo supports a debug Android APK build for device testing.

## Build from GitHub Actions

Workflow:

```text
.github/workflows/android-apk.yml
```

The workflow:

1. installs dependencies
2. runs `npm run check`
3. generates the native Android project with Expo prebuild
4. builds `assembleDebug`
5. uploads `MoodSignal-debug-apk`

When the workflow completes, download the APK from the run artifacts.

Expected artifact path inside the workflow:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Build locally

Requirements:

- Node 20
- Java 17
- Android SDK
- Android emulator or physical Android device for install testing

Commands:

```bash
npm ci
npm run check
npm run build:android:debug
```

Output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Install on Android

With a device connected and USB debugging enabled:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Debug APK status

A debug APK is for internal testing only.

It is not a Play Store release artifact and should not be used for public distribution.

## Release build later

For a production release, use a signed Android App Bundle or signed APK through EAS Build or Gradle signing config.

Recommended later path:

```bash
eas build -p android --profile production
```

Release requirements before production signing:

- privacy policy URL
- app signing decision
- final package ID
- real release versioning
- tested notification behavior
- tested microphone behavior
- tested local data reset/export
- content and safety review
