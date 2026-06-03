import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MateriPage from './pages/MateriPage';
import DetailMateriPage from './pages/DetailMateriPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ActivityPage from './pages/ActivityPage';
import SessionDetailPage from './pages/SessionDetailPage';
import DetailSesiAktifPage from './pages/DetailSesiAktifPage'; // Tambahan Baru
import ProfilePage from './pages/ProfilePage';
import EditBasicProfilePage from './pages/EditBasicProfilePage';
import EditAcademicProfilePage from './pages/EditAcademicProfilePage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import PageGuru from './pages/PageGuru';
import ProfileGuruPage from './pages/ProfileGuruPage';
import ActivityGuruPage from './pages/ActivityGuruPage';
import PesanSesiPage from './pages/PesanSesiPage';
import MencariPengajarPage from './pages/MencariPengajarPage';
import DetailPembayaranPage from './pages/DetailPembayaranPage';
import PembayaranPage from './pages/PembayaranPage';
import PendapatanPage from './pages/PendapatanPage';
import RiwayatPendapatanPage from './pages/RiwayatPendapatanPage';

const App = () => {
  const DEV_SKIP_TO_PAYMENT = false;
  const [isAppLoading, setIsAppLoading] = useState(
    DEV_SKIP_TO_PAYMENT ? false : true,
  );

  const [currentPage, setCurrentPage] = useState(
    DEV_SKIP_TO_PAYMENT ? 'DetailPembayaran' : 'Splash',
  );

  const [bookingSessionData, setBookingSessionData] = useState(
    DEV_SKIP_TO_PAYMENT
      ? {
          id_pemesanan: 13, // isi dengan id_pemesanan yang ada di DB kamu
          id_guru: 1,
          id_murid: 1,
          nama_guru: 'Dr. Ahmad Fauzi',
          nama_mapel: 'Kimia',
          nama_materi: 'Struktur Atom',
          waktu_sesi: '06:30 - 07:30',
          tanggal: '25 Mei 2026',
          lokasi: '37.42200, -122.08400',
        }
      : null,
  );

  const [namaLengkap, setNamaLengkap] = useState(
    DEV_SKIP_TO_PAYMENT ? 'Siswa Tester' : '',
  );
  const [email, setEmail] = useState(
    DEV_SKIP_TO_PAYMENT ? 'tester@humana.com' : '',
  );

  // 🛠️ PERBAIKAN DI SINI: Berikan data dummy jika sedang dalam mode dev bypass
  const [profileData, setProfileData] = useState(
    DEV_SKIP_TO_PAYMENT
      ? {
          id: 1, // Sesuaikan dengan id_murid yang valid di DB kamu jika diperlukan
          role: 'murid',
          name: 'Siswa Tester',
          email: 'tester@humana.com',
          username: 'siswatester',
          phone: '081234567890',
          gender: 'Laki-laki',
          domicile: 'Bandung',
          education: 'SMA',
          major: 'IPA',
          is_active: true,
        }
      : {
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
          is_active: false,
        },
  );

  // ... sisa kode ke bawah tetap sama ...
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [activityTab, setActivityTab] = useState('aktif');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [showLoginSuccessAlert, setShowLoginSuccessAlert] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // PERBAIKAN DI SINI: Mendaftarkan fungsi pengubah state agar navigasi bisa merubah data
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentSnapUrl, setPaymentSnapUrl] = useState(null);
  useEffect(() => {
    if (DEV_SKIP_TO_PAYMENT) return;
    const checkLoginSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('user_session');

        if (savedSession) {
          const { userData, email: loggedInEmail } = JSON.parse(savedSession);
          console.log('🔄 [App.jsx] Sesi ditemukan untuk:', loggedInEmail);

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
            phone: userData?.no_telepon || userData?.phone || '-',
            no_telepon: userData?.no_telepon || userData?.phone || '-',
            gender: userData?.jenis_kelamin || userData?.gender || '-',
            jenis_kelamin: userData?.jenis_kelamin || userData?.gender || '-',
            domicile:
              userData?.domisili ||
              userData?.domicile ||
              userData?.alamat ||
              '-',
            domisili:
              userData?.domisili ||
              userData?.domicile ||
              userData?.alamat ||
              '-',
            alamat:
              userData?.domisili ||
              userData?.domicile ||
              userData?.alamat ||
              '-',
            education:
              userData?.jenjang_pendidikan || userData?.education || '-',
            jenjang_pendidikan:
              userData?.jenjang_pendidikan || userData?.education || '-',
            major:
              userData?.kelas_jurusan ||
              userData?.jurusan ||
              userData?.major ||
              '-',
            kelas_jurusan:
              userData?.kelas_jurusan ||
              userData?.jurusan ||
              userData?.major ||
              '-',
            is_active: userData?.is_active ?? 0,
          });

          if (roleDariDB === 'guru') {
            setCurrentPage('PageGuru');
          } else {
            setCurrentPage('Home');
          }
        } else {
          console.log(
            'ℹ️ [App.jsx] Tidak ada sesi aktif. Tetap di Login Page.',
          );
          setCurrentPage('Login');
        }
      } catch (error) {
        console.error('❌ Error mendeteksi sesi login:', error);
        setCurrentPage('Login');
      } finally {
        setIsAppLoading(false);
      }
    };

    checkLoginSession();
  }, []);

  const handleLoginSuccess = async (userData, loggedInEmail) => {
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

    const newProfile = {
      id: userData?.id,
      role: userData?.role || '-',
      name: namaDariDB || '-',
      email: loggedInEmail || '-',
      username: usernameDariDB || '-',
      phone: userData?.no_telepon || userData?.phone || '-',
      no_telepon: userData?.no_telepon || userData?.phone || '-',
      gender: userData?.jenis_kelamin || userData?.gender || '-',
      jenis_kelamin: userData?.jenis_kelamin || userData?.gender || '-',
      domicile:
        userData?.domisili || userData?.domicile || userData?.alamat || '-',
      domisili:
        userData?.domisili || userData?.domicile || userData?.alamat || '-',
      alamat:
        userData?.domisili || userData?.domicile || userData?.alamat || '-',
      education: userData?.jenjang_pendidikan || userData?.education || '-',
      jenjang_pendidikan:
        userData?.jenjang_pendidikan || userData?.education || '-',
      major:
        userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
      kelas_jurusan:
        userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
      is_active: userData?.is_active ?? 0,
    };

    setNamaLengkap(namaDariDB);
    setEmail(loggedInEmail);
    setProfileData(newProfile);

    try {
      const sessionData = {
        userData: userData,
        email: loggedInEmail,
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(sessionData));
      console.log('💾 [App.jsx] Berhasil memastikan sesi tersimpan!');
    } catch (error) {
      console.error('❌ Gagal mengamankan sesi di App.jsx:', error);
    }

    if (roleDariDB === 'guru') {
      setCurrentPage('PageGuru');
    } else {
      setCurrentPage('Home');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user_session');
      setProfileData({
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
      setNamaLengkap('');
      setEmail('');
      console.log('🚪 [App.jsx] Sesi berhasil dihapus. Keluar...');

      setNamaLengkap('');
      setEmail('');
      setProfileData({
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

      setCurrentPage('Login');
    } catch (error) {
      // ✅ Ganti setTimeout → InteractionManager
      InteractionManager.runAfterInteractions(() => {
        Alert.alert('Error', 'Gagal keluar dari akun.');
      });
    }
  };

  const handleGlobalNavigate = (page, tab) => {
    console.log(`🧭 [App.jsx] Global Navigate to: ${page}, tab: ${tab}`);
    if (tab) setActivityTab(tab);

    const currentRole = (profileData.role || 'murid').toLowerCase();

    if (page === 'Home' && currentRole === 'guru') {
      setCurrentPage('PageGuru');
      return;
    } else if (page === 'EditBasicProfilePage' && currentRole === 'guru') {
      setCurrentPage('EditBasicProfile');
      return;
    }

    if (page === 'HomeGuru') {
      setCurrentPage('PageGuru');
    } else if (page === 'ActivityGuru') {
      setCurrentPage('RealActivityGuru');
    } else if (page === 'ChatGuru') {
      setCurrentPage('Chat');
    } else if (page === 'ProfileGuru') {
      setCurrentPage('RealProfileGuru');
    } else if (page === 'Pendapatan') {
      setCurrentPage('Pendapatan');
    } else if (page === 'RiwayatPendapatan') {
      setCurrentPage('RiwayatPendapatan');
    } else {
      setCurrentPage(page);
    }
  };

  if (isAppLoading) {
    return <SplashScreen />;
  }

  if (currentPage === 'Login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
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

  if (currentPage === 'ResetPassword') {
    return <ResetPasswordPage onBack={() => setCurrentPage('Login')} />;
  }

  if (currentPage === 'PageGuru') {
    return (
      <PageGuru
        guruData={profileData}
        onNavigate={handleGlobalNavigate}
        onSelectSubject={subjectData => {
          setSelectedSubject(subjectData);
          setCurrentPage('Materi');
        }}
      />
    );
  }

  if (currentPage === 'RealProfileGuru') {
    return (
      <ProfileGuruPage
        guruData={profileData}
        onNavigate={handleGlobalNavigate}
        onLogout={handleLogout}
        onRefreshData={async newData => {
          console.log(
            '🔄 [App.jsx] Memperbarui profileData & AsyncStorage dari child:',
            newData,
          );
          setProfileData(newData);
          try {
            const savedSession = await AsyncStorage.getItem('user_session');
            if (savedSession) {
              const parsedSession = JSON.parse(savedSession);
              const updatedSession = {
                ...parsedSession,
                userData: {
                  ...parsedSession.userData,
                  ...newData,
                  nama_guru: newData.name,
                  is_active: newData.is_active ? 1 : 0,
                },
              };
              await AsyncStorage.setItem(
                'user_session',
                JSON.stringify(updatedSession),
              );
              console.log(
                '💾 [App.jsx] AsyncStorage berhasil disinkronisasi dengan data baru.',
              );
            }
          } catch (err) {
            console.error(
              '❌ Gagal menyelaraskan data baru ke AsyncStorage:',
              err,
            );
          }
        }}
      />
    );
  }

  if (currentPage === 'RealActivityGuru') {
    return (
      <ActivityGuruPage
        guruData={profileData}
        onNavigate={handleGlobalNavigate}
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
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }

  if (currentPage === 'PesanSesi') {
    return (
      <PesanSesiPage
        onBack={() => setCurrentPage('Home')}
        userId={profileData.id}
        onConfirmOrder={data => {
          setBookingSessionData(data);
          setCurrentPage('MencariPengajar');
        }}
      />
    );
  }

  if (currentPage === 'MencariPengajar') {
    return (
      <MencariPengajarPage
        sessionData={bookingSessionData}
        onCancel={() => setCurrentPage('PesanSesi')}
        onMatchSuccess={() => {
          setCurrentPage('DetailPembayaran');
        }}
        onMatchFailed={() => {
          setCurrentPage('PesanSesi');
        }}
      />
    );
  }

  if (currentPage === 'DetailPembayaran') {
    return (
      <DetailPembayaranPage
        sessionData={bookingSessionData}
        // 🛠️ MODIFIKASI DI SINI:
        onBack={() => {
          if (DEV_SKIP_TO_PAYMENT) {
            // Jika sedang mode dev bypass, balikkan ke halaman Login atau Splash biar kelihatan pindah halaman
            setCurrentPage('Login');
          } else {
            // Jika mode normal, balik ke Home
            setCurrentPage('Home');
          }
        }}
        onPaymentSuccess={snapUrl => {
          setPaymentSnapUrl(snapUrl);
          setCurrentPage('Pembayaran');
        }}
      />
    );
  }
  if (currentPage === 'Pembayaran') {
    return (
      <PembayaranPage
        snapUrl={paymentSnapUrl}
        onFinish={status => {
          setCurrentPage('Home');
          InteractionManager.runAfterInteractions(() => {
            if (status === 'success')
              Alert.alert('Sukses', 'Pembayaran berhasil!');
            else if (status === 'pending')
              Alert.alert('Info', 'Pembayaran pending.');
            else if (status === 'failed')
              Alert.alert('Gagal', 'Pembayaran gagal.');
          });
        }}
      />
    );
  }

  if (currentPage === 'Activity') {
    return (
      <ActivityPage
        initialTab={activityTab}
        onNavigate={page => setCurrentPage(page)}
        onDetailClick={item => {
          setSelectedSession(item);
          // Mengarahkan ke DetailSesiAktifPage jika tab yang aktif adalah Jadwal Aktif
          if (activityTab === 'aktif') {
            setCurrentPage('DetailSesiAktif');
          } else {
            setCurrentPage('SessionDetail');
          }
        }}
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }

  if (currentPage === 'DetailSesiAktif') {
    return (
      <DetailSesiAktifPage
        onBack={() => setCurrentPage('Activity')}
        sessionData={selectedSession}
      />
    );
  }

  if (currentPage === 'SessionDetail') {
    return (
      <SessionDetailPage
        onBack={() => setCurrentPage('Activity')}
        sessionData={selectedSession}
        userId={profileData.id}
      />
    );
  }

  if (currentPage === 'Profile') {
    return (
      <ProfilePage
        profileData={profileData}
        onNavigate={page => setCurrentPage(page)}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === 'EditBasicProfile') {
    return (
      <EditBasicProfilePage
        profileData={profileData}
        onCancel={() => {
          const currentRole = (profileData.role || 'murid').toLowerCase();
          setCurrentPage(
            currentRole === 'guru' ? 'RealProfileGuru' : 'Profile',
          );
        }}
        onSave={updatedData => {
          setProfileData(updatedData);
          setNamaLengkap(updatedData.name || updatedData.username);

          const currentRole = (profileData.role || 'murid').toLowerCase();
          setCurrentPage(
            currentRole === 'guru' ? 'RealProfileGuru' : 'Profile',
          );
        }}
      />
    );
  }

  if (currentPage === 'EditAcademicProfile') {
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
  }

  if (currentPage === 'Materi') {
    return (
      <MateriPage
        id_mapel={selectedSubject?.id_mapel}
        subjectName={selectedSubject?.subjectName}
        onBack={() => handleGlobalNavigate('Home')}
        onChapterSelect={materiData => {
          setSelectedChapter(materiData);
          setCurrentPage('Detail');
        }}
      />
    );
  }

  if (currentPage === 'Detail') {
    return (
      <DetailMateriPage
        chapterData={selectedChapter}
        onBack={() => setCurrentPage('Materi')}
      />
    );
  }

  if (currentPage === 'Chat') {
    return (
      <ChatPage
        onNavigate={handleGlobalNavigate}
        onChatPress={chatData => {
          setSelectedChatUser(chatData);
          setCurrentPage('ChatRoom');
        }}
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }

  if (currentPage === 'ChatRoom') {
    return (
      <ChatRoomPage
        chatData={selectedChatUser}
        onBack={() => setCurrentPage('Chat')}
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }
  if (currentPage === 'Pendapatan') {
    return (
      <PendapatanPage
        guruData={profileData}
        onNavigate={handleGlobalNavigate}
      />
    );
  }
  if (currentPage === 'RiwayatPendapatan') {
    return (
      <RiwayatPendapatanPage
        guruData={profileData}
        onNavigate={handleGlobalNavigate}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onNavigateToRegister={() => setCurrentPage('Register')}
      onForgotPassword={() => setCurrentPage('ResetPassword')}
    />
  );
};

export default App;