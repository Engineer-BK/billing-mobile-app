const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'node_modules', 'react-native-bluetooth-escpos-printer', 'android');
const gradlePath = path.join(baseDir, 'build.gradle');
const serviceJavaPath = path.join(baseDir, 'src', 'main', 'java', 'cn', 'jystudio', 'bluetooth', 'BluetoothService.java');
const managerModulePath = path.join(baseDir, 'src', 'main', 'java', 'cn', 'jystudio', 'bluetooth', 'RNBluetoothManagerModule.java');

// 1. Patch build.gradle for Gradle 8 & AndroidX
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
  console.log('ℹ️ react-native-bluetooth-escpos-printer build.gradle not found, skipping.');
}

// 2. Patch BluetoothService.java for Multi-Strategy Connection (80mm + 58mm Insecure SPP) and detailed error diagnostics
if (fs.existsSync(serviceJavaPath)) {
  let serviceContent = fs.readFileSync(serviceJavaPath, 'utf8');

  // Replace connectionFailed signature and implementation
  const oldConnectionFailed = `    private void connectionFailed() {
        setState(STATE_NONE, null);
        infoObervers(MESSAGE_UNABLE_CONNECT, null);
    }`;

  const newConnectionFailed = `    private void connectionFailed(String errorMsg) {
        setState(STATE_NONE, null);
        Map<String, Object> bundle = new HashMap<String, Object>();
        bundle.put("error", errorMsg != null ? errorMsg : "Connection attempt failed");
        infoObervers(MESSAGE_UNABLE_CONNECT, bundle);
    }
    private void connectionFailed() {
        connectionFailed("Connection attempt failed");
    }`;

  if (serviceContent.includes(oldConnectionFailed)) {
    serviceContent = serviceContent.replace(oldConnectionFailed, newConnectionFailed);
  }

  // Replace ConnectedThread.run() connection logic
  const oldRunPattern = /public void run\(\)\s*\{[\s\S]*?InputStream tmpIn = null;/;
  
  const newRunBlock = `public void run() {
            Log.i(TAG, "BEGIN mConnectThread");
            setName("ConnectThread");
            Map<String, Object> bundle = new HashMap<String, Object>();

            // Always cancel discovery because it will slow down a connection
            try {
                if (mAdapter != null && mAdapter.isDiscovering()) {
                    mAdapter.cancelDiscovery();
                }
            } catch (Exception e) {
                Log.w(TAG, "cancelDiscovery failed", e);
            }

            BluetoothSocket socket = null;
            StringBuilder errorLog = new StringBuilder();

            // Strategy 1 (Preferred for 80mm & standard POS): reflection createRfcommSocket(1..3)
            // Preserves existing 80mm behavior 100%!
            for (int channel = 1; channel <= 3; channel++) {
                try {
                    socket = (BluetoothSocket) mmDevice.getClass().getMethod("createRfcommSocket", int.class).invoke(mmDevice, channel);
                    if (socket != null) {
                        socket.connect();
                        mmSocket = socket;
                        Log.i(TAG, "Connected via Strategy 1 (RFCOMM ch " + channel + ")");
                        break;
                    }
                } catch (Exception e) {
                    String msg = e.getMessage() != null ? e.getMessage() : e.toString();
                    errorLog.append("[RFCOMM_ch").append(channel).append(": ").append(msg).append("] ");
                    if (socket != null) {
                        try { socket.close(); } catch (Exception ignored) {}
                        socket = null;
                    }
                }
            }

            // Strategy 2 (Crucial for 58mm BT2.0+BT4.0 dual-mode printers): Insecure SPP UUID
            if (mmSocket == null) {
                try {
                    socket = mmDevice.createInsecureRfcommSocketToServiceRecord(MY_UUID);
                    if (socket != null) {
                        socket.connect();
                        mmSocket = socket;
                        Log.i(TAG, "Connected via Strategy 2 (Insecure SPP UUID)");
                    }
                } catch (Exception e) {
                    String msg = e.getMessage() != null ? e.getMessage() : e.toString();
                    errorLog.append("[Insecure_SPP: ").append(msg).append("] ");
                    if (socket != null) {
                        try { socket.close(); } catch (Exception ignored) {}
                        socket = null;
                    }
                }
            }

            // Strategy 3: Standard Secure SPP UUID
            if (mmSocket == null) {
                try {
                    socket = mmDevice.createRfcommSocketToServiceRecord(MY_UUID);
                    if (socket != null) {
                        socket.connect();
                        mmSocket = socket;
                        Log.i(TAG, "Connected via Strategy 3 (Secure SPP UUID)");
                    }
                } catch (Exception e) {
                    String msg = e.getMessage() != null ? e.getMessage() : e.toString();
                    errorLog.append("[Secure_SPP: ").append(msg).append("] ");
                    if (socket != null) {
                        try { socket.close(); } catch (Exception ignored) {}
                        socket = null;
                    }
                }
            }

            // Strategy 4: Insecure reflection RFCOMM socket
            if (mmSocket == null) {
                for (int channel = 1; channel <= 3; channel++) {
                    try {
                        socket = (BluetoothSocket) mmDevice.getClass().getMethod("createInsecureRfcommSocket", int.class).invoke(mmDevice, channel);
                        if (socket != null) {
                            socket.connect();
                            mmSocket = socket;
                            Log.i(TAG, "Connected via Strategy 4 (Insecure RFCOMM ch " + channel + ")");
                            break;
                        }
                    } catch (Exception e) {
                        String msg = e.getMessage() != null ? e.getMessage() : e.toString();
                        errorLog.append("[Insecure_RFCOMM_ch").append(channel).append(": ").append(msg).append("] ");
                        if (socket != null) {
                            try { socket.close(); } catch (Exception ignored) {}
                            socket = null;
                        }
                    }
                }
            }

            if (mmSocket == null) {
                String devName = mmDevice.getName() != null ? mmDevice.getName() : mmDevice.getAddress();
                String fullError = "Could not connect to " + devName + " (" + mmDevice.getAddress() + "). Failures: " + errorLog.toString().trim();
                Log.e(TAG, fullError);
                connectionFailed(fullError);
                return;
            }

            Log.d(TAG, "create ConnectedThread");
            InputStream tmpIn = null;`;

  if (oldRunPattern.test(serviceContent)) {
    serviceContent = serviceContent.replace(oldRunPattern, newRunBlock);
    fs.writeFileSync(serviceJavaPath, serviceContent, 'utf8');
    console.log('✅ Successfully patched BluetoothService.java with 58mm/80mm dual-mode connection strategies & detailed error logging');
  } else {
    console.log('ℹ️ BluetoothService.java already patched or pattern not found.');
  }
}

// 3. Patch RNBluetoothManagerModule.java to forward detailed native error messages in Promise rejection
if (fs.existsSync(managerModulePath)) {
  let moduleContent = fs.readFileSync(managerModulePath, 'utf8');

  const oldRejectBlock = `            case MESSAGE_UNABLE_CONNECT: {     //无法连接设备
                Promise p = promiseMap.remove(PROMISE_CONNECT);
                if (p == null) {
                    emitRNEvent(EVENT_UNABLE_CONNECT, null);
                } else {
                    p.reject("Unable to connect device");
                }

                break;
            }`;

  const newRejectBlock = `            case MESSAGE_UNABLE_CONNECT: {     //无法连接设备
                Promise p = promiseMap.remove(PROMISE_CONNECT);
                String errorMsg = "Unable to connect device";
                if (bundle != null && bundle.containsKey("error")) {
                    errorMsg = String.valueOf(bundle.get("error"));
                }
                emitRNEvent(EVENT_UNABLE_CONNECT, null);
                if (p != null) {
                    p.reject("CONNECT_FAILED", errorMsg);
                }

                break;
            }`;

  if (moduleContent.includes(oldRejectBlock)) {
    moduleContent = moduleContent.replace(oldRejectBlock, newRejectBlock);
    fs.writeFileSync(managerModulePath, moduleContent, 'utf8');
    console.log('✅ Successfully patched RNBluetoothManagerModule.java for rich error reporting');
  } else {
    console.log('ℹ️ RNBluetoothManagerModule.java already patched or pattern not found.');
  }
}
