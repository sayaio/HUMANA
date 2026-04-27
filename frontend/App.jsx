import React, { useState } from 'react';

// Import Komponen Halaman
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MateriPage from './pages/MateriPage'; 
import DetailMateriPage from './pages/DetailMateriPage'; 

const App = () => {
  const [currentPage, setCurrentPage] = useState('Splash');
  
  // State Data Pengguna
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  
  // State Navigasi Materi
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  const handleLogout = () => {
    setEmail('');
    setNamaLengkap('');
    setCurrentPage('Auth');
  };

  // ==========================================
  // ROUTER (Pengatur Halaman)
  // ==========================================

  if (currentPage === 'Splash') {
    return <SplashScreen onFinish={() => setCurrentPage('Auth')} />;
  }

  if (currentPage === 'Home') {
    return (
      <HomePage 
        namaLengkap={namaLengkap} 
        email={email} 
        onLogout={handleLogout} 
        onSelectSubject={(subjectName) => {
          setSelectedSubject(subjectName);
          setCurrentPage('Materi'); 
        }} 
      />
    );
  }

  if (currentPage === 'Materi') {
    return (
      <MateriPage 
        subjectName={selectedSubject} 
        onBack={() => setCurrentPage('Home')} 
        onChapterSelect={(chapterName) => {
          setSelectedChapter(chapterName);
          setCurrentPage('Detail');
        }}
      />
    );
  }

  if (currentPage === 'Detail') {
    return (
      <DetailMateriPage 
        chapterName={selectedChapter} 
        onBack={() => setCurrentPage('Materi')} 
      />
    );
  }

  // Fallback ke Login
  return (
    <LoginPage 
      onLoginSuccess={() => setCurrentPage('Home')} 
    />
  );
};

export default App;