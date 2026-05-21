import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import PageGuru from './pages/PageGuru';

const App = () => {
  const [currentPage, setCurrentPage] = useState('Splash');

  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');

  const [profileData, setProfileData] = useState({
    id: null,
    role: '-',
    name: '-',
    email: '-',
    username: '-',
    phone: '-',
    gender: '-',
    domicile: '-',
    education: '-',
    major: '-',
  });

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activityTab, setActivityTab] = useState('aktif');
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const [showLoginSuccessAlert, setShowLoginSuccessAlert] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);

  const handleLoginSuccess = (userData, loggedInEmail) => {
    const namaDariDB =
      userData?.nama_murid ||
      userData?.namaLengkap ||
      userData?.name ||
      loggedInEmail.split('@')[0];
    const usernameDariDB =
      userData?.username || namaDariDB.toLowerCase().replace(/\s/g, '');
    const roleDariDB = (
      userData?.role ||
      userData?.id_role ||
      'murid'
    ).toLowerCase();
    setNamaLengkap(namaDariDB);
    setEmail(loggedInEmail);
    setProfileData({
      id: userData?.id,
      role: userData?.role || '-',
      name: namaDariDB || '-',
      email: loggedInEmail || '-',
      username: usernameDariDB || '-',

      // 🛠️ FIX DOUBLE KEY: Supaya dibaca di EditProfile DAN ProfilePage
      phone: userData?.no_telepon || userData?.phone || '-',
      no_telepon: userData?.no_telepon || userData?.phone || '-', // Dipakai ProfilePage

      gender: userData?.jenis_kelamin || userData?.gender || '-',
      jenis_kelamin: userData?.jenis_kelamin || userData?.gender || '-', // Dipakai ProfilePage

      domicile:
        userData?.domisili || userData?.domicile || userData?.alamat || '-',
      domisili:
        userData?.domisili || userData?.domicile || userData?.alamat || '-',
      alamat:
        userData?.domisili || userData?.domicile || userData?.alamat || '-', // Dipakai ProfilePage

      education: userData?.jenjang_pendidikan || userData?.education || '-',
      jenjang_pendidikan:
        userData?.jenjang_pendidikan || userData?.education || '-',

      major:
        userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
      kelas_jurusan:
        userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
    });

    if (roleDariDB === 'guru') {
      setCurrentPage('PageGuru'); // Jika Guru, lempar ke Dashboard Guru
    } else {
      setCurrentPage('Home'); // Jika Murid/Lainnya, ke Home biasa
    }
  };

  const handleLogout = () => {
    setShowLoginSuccessAlert(false);
    setCurrentPage('Login');
  };

  if (currentPage === 'Splash')
    return <SplashScreen onFinish={() => setCurrentPage('Login')} />;
  if (currentPage === 'Login')
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentPage('Register')}
        onForgotPassword={() => setCurrentPage('ResetPassword')}
      />
    );
  if (currentPage === 'Register')
    return (
      <RegisterPage
        onRegisterSuccess={() => setCurrentPage('Login')}
        onNavigateToLogin={() => setCurrentPage('Login')}
      />
    );
  if (currentPage === 'ResetPassword')
    return <ResetPasswordPage onBack={() => setCurrentPage('Login')} />;
  if (currentPage === 'PageGuru') {
        return (
            <PageGuru 
                namaLengkap={namaLengkap}
                email={email}
                onLogout={handleLogout}
                onNavigate={(page, tab) => { if (tab) setActivityTab(tab); setCurrentPage(page); }}
            />
        );
    }

  if (currentPage === 'Home') {
    return (
      <HomePage
        namaLengkap={namaLengkap}
        email={email}
        onLogout={handleLogout}
        onSelectSubject={subjectData => {
          setSelectedSubject(subjectData);
          setCurrentPage('Materi');
        }}
        onNavigate={(page, tab) => {
          if (tab) setActivityTab(tab);
          setCurrentPage(page);
        }}
        showSuccessAlert={showLoginSuccessAlert}
        onAlertClose={() => setShowLoginSuccessAlert(false)}
        // ---> INI TAMBAHAN BARUNYA AGAR HOME BISA FETCH JADWAL AKTIF <---
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }

  if (currentPage === 'Activity') {
    return (
      <ActivityPage
        initialTab={activityTab}
        onNavigate={page => setCurrentPage(page)}
        onDetailClick={item => {
          // TAMBAHKAN 'item'
          setSelectedSession(item); // SIMPAN data yang diklik
          setCurrentPage('SessionDetail');
        }}
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }

  // Pastikan juga bagian ini mengirim selectedSession
  if (currentPage === 'SessionDetail') {
    return (
      <SessionDetailPage
        onBack={() => setCurrentPage('Activity')}
        sessionData={selectedSession} // KIRIM data ke halaman detail
        userId={profileData.id}
      />
    );
  }

  if (currentPage === 'Profile')
    return (
      <ProfilePage
        profileData={profileData}
        onNavigate={page => setCurrentPage(page)}
      />
    );

  if (currentPage === 'EditBasicProfile')
    return (
      <EditBasicProfilePage
        profileData={profileData}
        onCancel={() => setCurrentPage('Profile')}
        onSave={updatedData => {
          setProfileData(updatedData);
          setNamaLengkap(updatedData.name);
          setCurrentPage('Profile');
        }}
      />
    );
  if (currentPage === 'EditAcademicProfile')
    return (
      <EditAcademicProfilePage
        profileData={profileData}
        onCancel={() => setCurrentPage('Profile')}
        onSave={updatedData => {
          setProfileData(updatedData);
          setCurrentPage('Profile');
        }}
      />
    );

  if (currentPage === 'Materi') {
    return (
      <MateriPage
        id_mapel={selectedSubject?.id_mapel}
        subjectName={selectedSubject?.subjectName}
        onBack={() => setCurrentPage('Home')}
        onChapterSelect={materiData => {
          setSelectedChapter(materiData);
          setCurrentPage('Detail');
        }}
      />
    );
  }

  if (currentPage === 'Detail')
    return (
      <DetailMateriPage
        chapterData={selectedChapter}
        onBack={() => setCurrentPage('Materi')}
      />
    );

  if (currentPage === 'Chat')
    return (
      <ChatPage
        onNavigate={page => setCurrentPage(page)}
        onChatPress={chatData => {
          setSelectedChatUser(chatData);
          setCurrentPage('ChatRoom');
        }}
      />
    );
  if (currentPage === 'ChatRoom')
    return (
      <ChatRoomPage
        chatData={selectedChatUser}
        onBack={() => setCurrentPage('Chat')}
      />
    );

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onNavigateToRegister={() => setCurrentPage('Register')}
      onForgotPassword={() => setCurrentPage('ResetPassword')}
    />
  );
};

export default App;
