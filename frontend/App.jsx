import React, { useState } from 'react';

import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MateriPage from './pages/MateriPage'; 
import DetailMateriPage from './pages/DetailMateriPage'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import ActivityPage from './pages/ActivityPage';           
import SessionDetailPage from './pages/SessionDetailPage'; 
import ProfilePage from './pages/ProfilePage'; 
import EditBasicProfilePage from './pages/EditBasicProfilePage'; 
import EditAcademicProfilePage from './pages/EditAcademicProfilePage'; 
import ChatPage from './pages/ChatPage';       
import ChatRoomPage from './pages/ChatRoomPage'; 

const App = () => {
  const [currentPage, setCurrentPage] = useState('Splash');
  
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: '-', email: '-', username: '-', phone: '-', gender: '-', domicile: '-', education: '-', major: '-'
  });
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [activityTab, setActivityTab] = useState('aktif');
  const [selectedChatUser, setSelectedChatUser] = useState(null); 

  // STATE BARU UNTUK MEMBERI SINYAL KE HOME PAGE BAHWA INI LOGIN BARU
  const [showLoginSuccessAlert, setShowLoginSuccessAlert] = useState(false);

  const handleLoginSuccess = (userData, loggedInEmail) => {
    const namaDariDB = userData?.nama_murid || userData?.namaLengkap || userData?.name || loggedInEmail.split('@')[0];
    const usernameDariDB = userData?.username || namaDariDB.toLowerCase().replace(/\s/g, '');

    setNamaLengkap(namaDariDB);
    setEmail(loggedInEmail);

    setProfileData({
      name: namaDariDB || '-', email: loggedInEmail || '-', username: usernameDariDB || '-',
      phone: userData?.no_telepon || userData?.phone || '-', gender: userData?.jenis_kelamin || userData?.gender || '-',
      domicile: userData?.domisili || userData?.domicile || '-', education: userData?.jenjang_pendidikan || userData?.education || '-',
      major: userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-' 
    });

    // NYALAKAN SINYAL ALERT SUKSES DAN PINDAH KE HOME
    setShowLoginSuccessAlert(true);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setShowLoginSuccessAlert(false); // Reset Sinyal
    setCurrentPage('Login');
  }

  // ==========================================
  // ROUTER
  // ==========================================
  if (currentPage === 'Splash') return <SplashScreen onFinish={() => setCurrentPage('Login')} />;
  if (currentPage === 'Login') return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setCurrentPage('Register')} onForgotPassword={() => setCurrentPage('ResetPassword')} />;
  if (currentPage === 'Register') return <RegisterPage onRegisterSuccess={() => setCurrentPage('Login')} onNavigateToLogin={() => setCurrentPage('Login')} />;
  if (currentPage === 'ResetPassword') return <ResetPasswordPage onBack={() => setCurrentPage('Login')} />;

  if (currentPage === 'Home') {
    return (
      <HomePage 
        namaLengkap={namaLengkap} 
        email={email} 
        onLogout={handleLogout} 
        onSelectSubject={(subjectName) => { setSelectedSubject(subjectName); setCurrentPage('Materi'); }} 
        onNavigate={(page, tab) => { if(tab) setActivityTab(tab); setCurrentPage(page); }} 
        // Mengirimkan Sinyal Alert ke Home
        showSuccessAlert={showLoginSuccessAlert}
        onAlertClose={() => setShowLoginSuccessAlert(false)}
      />
    );
  }

  if (currentPage === 'Activity') return <ActivityPage initialTab={activityTab} onNavigate={(page) => setCurrentPage(page)} onDetailClick={() => setCurrentPage('SessionDetail')} />;
  if (currentPage === 'SessionDetail') return <SessionDetailPage onBack={() => setCurrentPage('Activity')} />;
  if (currentPage === 'Profile') return <ProfilePage profileData={profileData} onNavigate={(page) => setCurrentPage(page)} />;
  
  if (currentPage === 'EditBasicProfile') return <EditBasicProfilePage profileData={profileData} onCancel={() => setCurrentPage('Profile')} onSave={(updatedData) => { setProfileData(updatedData); setNamaLengkap(updatedData.name); setCurrentPage('Profile'); }} />;
  if (currentPage === 'EditAcademicProfile') return <EditAcademicProfilePage profileData={profileData} onCancel={() => setCurrentPage('Profile')} onSave={(updatedData) => { setProfileData(updatedData); setCurrentPage('Profile'); }} />;
  
  if (currentPage === 'Materi') return <MateriPage subjectName={selectedSubject} onBack={() => setCurrentPage('Home')} onChapterSelect={(chapterName) => { setSelectedChapter(chapterName); setCurrentPage('Detail'); }} />;
  if (currentPage === 'Detail') return <DetailMateriPage chapterName={selectedChapter} onBack={() => setCurrentPage('Materi')} />;

  if (currentPage === 'Chat') return <ChatPage onNavigate={(page) => setCurrentPage(page)} onChatPress={(chatData) => { setSelectedChatUser(chatData); setCurrentPage('ChatRoom'); }} />;
  if (currentPage === 'ChatRoom') return <ChatRoomPage chatData={selectedChatUser} onBack={() => setCurrentPage('Chat')} />;

  return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setCurrentPage('Register')} onForgotPassword={() => setCurrentPage('ResetPassword')} />;
};

export default App;