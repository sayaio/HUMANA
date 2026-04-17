import React, { useState } from 'react';

// Import Komponen Halaman
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

const App = () => {
  // State untuk Navigasi Dasar
  const [currentPage, setCurrentPage] = useState('Splash');
  
  // State Data Pengguna (Disimpan di App.js agar bisa dioper antar halaman)
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');

  // Fungsi Logout
  const handleLogout = () => {
    setEmail('');
    setNamaLengkap('');
    setCurrentPage('Auth');
  };

  // 1. Tampilkan Splash Screen
  if (currentPage === 'Splash') {
    return (
      <SplashScreen 
        onFinish={() => setCurrentPage('Auth')} 
      />
    );
  }

  // 2. Tampilkan Home Page
  if (currentPage === 'Home') {
    return (
      <HomePage 
        namaLengkap={namaLengkap} 
        email={email} 
        onLogout={handleLogout} 
      />
    );
  }

  // 3. Tampilkan Login/Auth Page
  return (
    <LoginPage 
      onLoginSuccess={() => setCurrentPage('Home')} 
      // Opsional: Jika LoginPage kamu bisa kirim data user saat login berhasil, 
      // kamu bisa update ke state di sini. Contoh:
      // onLoginSuccess={(emailUser, namaUser) => { 
      //    setEmail(emailUser); setNamaLengkap(namaUser); setCurrentPage('Home'); 
      // }}
    />
  );
};

export default App;