const fs = require('fs');

// 1. Update android/build.gradle
let rootGradle = fs.readFileSync('android/build.gradle', 'utf8');
rootGradle = rootGradle.replace(
    'classpath \'com.android.tools.build:gradle:8.13.0\'',
    'classpath \'com.android.tools.build:gradle:8.13.0\'\n        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.10"'
);
fs.writeFileSync('android/build.gradle', rootGradle);

// 2. Update android/app/build.gradle
let appGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
appGradle = appGradle.replace(
    "apply plugin: 'com.android.application'",
    "apply plugin: 'com.android.application'\napply plugin: 'kotlin-android'"
);
appGradle = appGradle.replace(
    "implementation project(':capacitor-android')",
    "implementation project(':capacitor-android')\n    implementation \"org.jetbrains.kotlin:kotlin-stdlib:1.9.10\""
);
fs.writeFileSync('android/app/build.gradle', appGradle);
