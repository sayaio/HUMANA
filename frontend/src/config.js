// export const API_URL = "http://10.0.2.2:3000/api"; // <-- IP Android Studio
//export const API_URL = "http://192.168.1.76:3000/api"; // <-- IP pc fatangans

// export const API_URL = 'http://172.20.10.2:3000/api'; //

import { Platform } from 'react-native';

const LOCAL_IP = '172.20.10.2'; // IP Laptop/PC kamu saat ini
const PORT = '3000';

// UBAH INI: set true jika pakai Emulator Android Studio, set false jika pakai HP Fisik/iOS
const IS_EMULATOR = false; 

const getBaseURL = () => {
  if (__DEV__) {
    // Jika diatur sebagai emulator dan sistemnya Android, pakai 10.0.2.2
    if (IS_EMULATOR && Platform.OS === 'android') {
      return `http://10.0.2.2:${PORT}/api`;
    }
    // Jika pakai HP Fisik (Android/iOS) atau simulator iOS, pakai IP Laptop
    return `http://${LOCAL_IP}:${PORT}/api`;
  }
  
  // Production
  return 'https://api.humana.com/api';
};

export const API_URL = getBaseURL();