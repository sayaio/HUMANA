import React, { useState } from 'react';

import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // BARU DI-IMPORT
import HomePage from './pages/HomePage';
import MateriPage from './pages/MateriPage'; 
import DetailMateriPage from './pages/DetailMateriPage'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import ActivityPage from './pages/ActivityPage';           
import SessionDetailPage from './pages/SessionDetailPage'; 

const App = () => {
  const [currentPage, setCurrentPage] = useState('Splash');
  
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [activityTab, setActivityTab] = useState('aktif');

  const handleLogout = () => {
    setEmail('');
    setNamaLengkap('');
    setCurrentPage('Login'); // Arahkan ke Login saat logout
  };

  // ==========================================
  // ROUTER
  // ==========================================
  if (currentPage === 'Splash') return <SplashScreen onFinish={() => setCurrentPage('Login')} />;
  
  // Rute Auth (Login & Register & Reset Pass)
  if (currentPage === 'Login') {
    return (
      <LoginPage 
        onLoginSuccess={() => setCurrentPage('Home')} 
        onNavigateToRegister={() => setCurrentPage('Register')} 
        onForgotPassword={() => setCurrentPage('ResetPassword')} 
      />
    );
  }

  if (currentPage === 'Register') {
    return (
      <RegisterPage 
        onRegisterSuccess={() => setCurrentPage('Login')} 
        onNavigateToLogin={() => setCurrentPage('Login')} 
      />
    );
  }

  if (currentPage === 'ResetPassword') return <ResetPasswordPage onBack={() => setCurrentPage('Login')} />;

  // Rute Main App
  if (currentPage === 'Home') {
    return (
      <HomePage 
        namaLengkap={namaLengkap} email={email} onLogout={handleLogout} 
        onSelectSubject={(subjectName) => { setSelectedSubject(subjectName); setCurrentPage('Materi'); }} 
        onNavigate={(page, tab) => { setActivityTab(tab); setCurrentPage(page); }} 
      />
    );
  }

  if (currentPage === 'Activity') {
    return (
      <ActivityPage 
        initialTab={activityTab}
        onNavigate={(page) => setCurrentPage(page)} 
        onDetailClick={() => setCurrentPage('SessionDetail')} 
      />
    );
  }

  if (currentPage === 'SessionDetail') {
    return <SessionDetailPage onBack={() => setCurrentPage('Activity')} />;
  }

  if (currentPage === 'Materi') {
    return (
      <MateriPage 
        subjectName={selectedSubject} 
        onBack={() => setCurrentPage('Home')} 
        onChapterSelect={(chapterName) => { setSelectedChapter(chapterName); setCurrentPage('Detail'); }}
      />
    );
  }

  if (currentPage === 'Detail') {
    return <DetailMateriPage chapterName={selectedChapter} onBack={() => setCurrentPage('Materi')} />;
  }

  // Fallback
  return <LoginPage onLoginSuccess={() => setCurrentPage('Home')} onNavigateToRegister={() => setCurrentPage('Register')} onForgotPassword={() => setCurrentPage('ResetPassword')} />;
};

export default App;