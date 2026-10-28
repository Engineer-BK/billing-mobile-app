const fs = require('fs');
const path = require('path');

const gradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-bluetooth-escpos-printer',
  'android',
  'build.gradle'
);

if (fs.existsSync(gradlePath)) {
  const modernGradle = `apply plugin: 'com.android.library'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 34)

    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 21)
        targetSdkVersion safeExtGet('targetSdkVersion', 34)
        versionCode 1
        versionName "1.0"
    }
    lintOptions {
        abortOnError false
    }
    sourceSets {
        main {
            aidl.srcDirs = ['src/main/java']
        }
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'com.facebook.react:react-native:+'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation "com.google.zxing:core:3.3.0"
}
`;
  fs.writeFileSync(gradlePath, modernGradle, 'utf8');
  console.log('✅ Successfully patched react-native-bluetooth-escpos-printer build.gradle for Gradle 8 & AndroidX');
} else {
  console.log('ℹ️ react-native-bluetooth-escpos-printer not found, skipping patch.');
}
