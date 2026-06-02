// export const API_URL = "http://10.0.2.2:3000/api"; // <-- IP Android Studio
//export const API_URL = "http://192.168.1.76:3000/api"; // <-- IP pc fatangans

// export const API_URL = 'http://172.20.10.2:3000/api'; //


import { Platform } from 'react-native';

// Ganti IP ini dengan IP komputer Anda saat ini
const LOCAL_IP = '172.20.10.2';
const PORT = '3000';

const getBaseURL = () => {
  // Emulator Android → pakai 10.0.2.2
  // Device fisik Android/iOS → pakai IP komputer
  if (__DEV__) {
    return Platform.OS === 'android'
      ? `http://10.0.2.2:${PORT}/api`        // emulator
      : `http://${LOCAL_IP}:${PORT}/api`;     // device fisik / iOS
  }
  // Production
  return 'https://api.humana.com/api';
};

export const API_URL = getBaseURL();