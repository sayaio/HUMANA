// export const API_URL = "http://10.0.2.2:3000/api"; // <-- IP Android Studio
//export const API_URL = "http://192.168.1.76:3000/api"; // <-- IP pc fatangans

// export const API_URL = 'http://172.20.10.2:3000/api'; //

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Masukkan IP Wi-Fi laptop kamu saat ini sebagai cadangan (fallback) untuk HP fisik
const LOCAL_IP = '172.20.10.2'; 
const PORT = '3000';
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT} dan terbuka untuk jaringan lokal!`);
});

const getBaseURL = () => {
  if (__DEV__) {
    // 1. CEK OTOMATIS: Apakah aplikasi berjalan di Emulator?
    const isEmulator = DeviceInfo.isEmulatorSync();

    // 2. Jika terdeteksi Emulator Android Studio, langsung arahkan ke IP sakti 10.0.2.2
    if (isEmulator && Platform.OS === 'android') {
      console.log('--- Connected to: Android Studio Emulator (10.0.2.2) ---');
      return `http://10.0.2.2:${PORT}/api`;
    }

    // 3. Jika pakai HP Fisik (Wireless / Wi-Fi), gunakan IP Laptop kamu
    console.log(`--- Connected to: Physical Device via Laptop IP (${LOCAL_IP}) ---`);
    return `http://${LOCAL_IP}:${PORT}/api`;
  }
  
  // URL saat aplikasi sudah rilis (Production)
  return 'https://api.humana.com/api';
};

export const API_URL = getBaseURL();