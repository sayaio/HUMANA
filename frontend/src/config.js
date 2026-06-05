// === KONFIGURASI ALAMAT BACKEND HUMANA ===
//
// Setelah backend online di Render, cukup ganti RENDER_URL di bawah ini.
// Tidak ada lagi logika rebutan IP — semua HP memakai alamat yang sama.

// 1. URL backend yang sudah online (production). GANTI dengan URL Render kamu.
const RENDER_URL = 'https://NAMA-APP-KAMU.onrender.com/api';

// 2. (Opsional) Untuk development lokal di laptop:
//    set USE_LOCAL = true dan isi LOCAL_URL dengan IP laptop kamu.
//    Untuk build APK rilis, biarkan USE_LOCAL = false.
const USE_LOCAL = false;
const LOCAL_URL = 'http://10.0.2.2:3000/api'; // 10.0.2.2 = localhost emulator Android Studio

export const API_URL = USE_LOCAL ? LOCAL_URL : RENDER_URL;
