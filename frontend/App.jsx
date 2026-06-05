import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import { useAppAlert } from './components/AppAlertProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MateriPage from './pages/MateriPage';
import DetailMateriPage from './pages/DetailMateriPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ActivityPage from './pages/ActivityPage';
import SessionDetailPage from './pages/SessionDetailPage';
import DetailSesiAktifPage from './pages/DetailSesiAktifPage';
import ProfilePage from './pages/ProfilePage';
import EditBasicProfilePage from './pages/EditBasicProfilePage';
import EditAcademicProfilePage from './pages/EditAcademicProfilePage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import PageGuru from './pages/PageGuru';
import ProfileGuruPage from './pages/ProfileGuruPage';
import ActivityGuruPage from './pages/ActivityGuruPage';
import DetailPermintaanGuruPage from './pages/DetailPermintaanGuruPage';
import TambahMateriGuruPage from './pages/TambahMateriGuruPage';
import PesanSesiPage from './pages/PesanSesiPage';
import MencariPengajarPage from './pages/MencariPengajarPage';
import DetailPembayaranPage from './pages/DetailPembayaranPage';
import PembayaranPage from './pages/PembayaranPage';
import PendapatanPage from './pages/PendapatanPage';
import RiwayatPendapatanPage from './pages/RiwayatPendapatanPage';
import PortfolioPage from './pages/PortfolioPage';
import NotifikasiPage from './pages/NotifikasiPage';

const App = () => {
  const { showInfo } = useAppAlert();
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
          id_pemesanan: 13,
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
  const [profileData, setProfileData] = useState(
    DEV_SKIP_TO_PAYMENT
      ? {
          id: 1,
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

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [detailBackPage, setDetailBackPage] = useState('Materi');
  const [detailPermintaanBackPage, setDetailPermintaanBackPage] =
    useState('RealActivityGuru');
  const [detailSesiAktifBackPage, setDetailSesiAktifBackPage] =
    useState('Activity');
  const [activityTab, setActivityTab] = useState('aktif');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [showLoginSuccessAlert, setShowLoginSuccessAlert] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [paymentBackPage, setPaymentBackPage] = useState('PesanSesi');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentSnapUrl, setPaymentSnapUrl] = useState(null);
  const [selectedPermintaanGuru, setSelectedPermintaanGuru] = useState(null);
  const [selectedTipePermintaan, setSelectedTipePermintaan] =
    useState('Permintaan');
  const [selectedRiwayatData, setSelectedRiwayatData] = useState(null);
  const [pesanSesiPrefill, setPesanSesiPrefill] = useState(null);
  const [activityGuruRefreshKey, setActivityGuruRefreshKey] = useState(0);
  const handleRefreshProfileData = useCallback(async newData => {
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
      console.error('❌ Gagal menyelaraskan data baru ke AsyncStorage:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribeFirebase = auth().onAuthStateChanged(user => {
      console.log('====================================');
      if (user) {
        console.log('🔥 [Firebase Auth] User terdeteksi login di Firebase!');
        console.log('📧 Email:', user.email);
        console.log('🆔 UID:', user.uid);
      } else {
        console.log(
          '🔥 [Firebase Auth] Tidak ada user login di Firebase (Guest/Logout).',
        );
      }
      console.log('====================================');
    });

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
            kelas: userData?.kelas ?? null,
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
    return () => unsubscribeFirebase();
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
      kelas: userData?.kelas ?? null,
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
        is_active: false,
      });
      setNamaLengkap('');
      setEmail('');
      console.log('🚪 [App.jsx] Sesi berhasil dihapus. Keluar...');
      setCurrentPage('Login');
    } catch (error) {
      InteractionManager.runAfterInteractions(() => {
        showInfo('Error', 'Gagal keluar dari akun.');
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
    } else if (page === 'Portfolio') {
      setCurrentPage('Portfolio');
    } else {
      if (page === 'PesanSesi') {
        setPesanSesiPrefill(null);
      }
      setCurrentPage(page);
    }
  };

  if (isAppLoading) {
    return <SplashScreen />;
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
                onDetailPermintaan={(item, tipe) => {
                    setSelectedPermintaanGuru(item);
                    setSelectedTipePermintaan(tipe);
                    setDetailPermintaanBackPage('PageGuru');
                    setCurrentPage('DetailPermintaanGuru');
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
                onRefreshData={handleRefreshProfileData}
            />
        );
    }

    if (currentPage === 'RealActivityGuru') {
        return (
            <ActivityGuruPage
                guruData={profileData}
                onNavigate={handleGlobalNavigate}
                onDetailPermintaan={(item, tipe) => {
                    setSelectedPermintaanGuru(item);
                    setSelectedTipePermintaan(tipe);
                    setDetailPermintaanBackPage('RealActivityGuru');
                    setCurrentPage('DetailPermintaanGuru');
                }}
                onDetailRiwayat={(rawData) => {
                    setSelectedRiwayatData(rawData);
                    setCurrentPage('SessionDetail');
                }}
            />
        );
    }

    // ✅ TAMBAH: routing halaman detail permintaan guru
    if (currentPage === 'DetailPermintaanGuru') {
        return (
            <DetailPermintaanGuruPage
                permintaanData={selectedPermintaanGuru}
                guruData={profileData}
                tipePermintaan={selectedTipePermintaan}
                onBack={() => setCurrentPage(detailPermintaanBackPage)}
                onTolak={async (idPemesanan) => {
                    // Panggil API tolak permintaan
                    // Contoh: await tolakPermintaanAPI(idPemesanan);
                    showInfo('Info', 'Permintaan ditolak');
                    setCurrentPage(detailPermintaanBackPage);
                }}
                onChat={(chatData) => {
                    // chatData sudah berisi id_guru, id_murid, id_chat, nama_murid, mapel
                    setSelectedChatUser(chatData);
                    setCurrentPage('ChatRoom');
                }}
                onSelesaikan={async (idPemesanan) => {
                    // Panggil API selesaikan sesi
                    // await selesaikanSesiAPI(idPemesanan);
                    showInfo('Sukses', 'Sesi telah selesai');
                    setCurrentPage(detailPermintaanBackPage);
                }}
                onAjukanBatal={async (idPemesanan) => {
                    // Panggil API ajukan pembatalan
                    // await ajukanBatalAPI(idPemesanan);
                    showInfo('Info', 'Pembatalan diajukan');
                    setCurrentPage(detailPermintaanBackPage);
                }}
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
                onPesanSesiPrefill={prefill => {
                    setPesanSesiPrefill(prefill);
                    setCurrentPage('PesanSesi');
                }}
                onLihatDetailMateri={chapterData => {
                    setSelectedChapter(chapterData);
                    setDetailBackPage('Home');
                    setCurrentPage('Detail');
                }}
                onDetailPermintaan={(item, tipe) => {
                    setSelectedPermintaanGuru(item);
                    setSelectedTipePermintaan(tipe);
                    setDetailPermintaanBackPage('Home');
                    setCurrentPage('DetailPermintaanGuru');
                }}
                onDetailSesiAktif={item => {
                    const currentRole = (profileData.role || 'murid').toLowerCase();
                    if (currentRole === 'murid' && item.status_pembayaran === 'menunggu') {
                        // Map the session item to bookingSessionData structure
                        const displayLokasi = item.lokasi_sesi && item.lokasi_sesi.includes('|') ? item.lokasi_sesi.split('|')[1] : item.lokasi_sesi;
                        let displayKoordinat = null;
                        if (item.lokasi_sesi && item.lokasi_sesi.includes('|')) {
                            const coords = item.lokasi_sesi.split('|')[0].split(',');
                            if (coords.length === 2) {
                                displayKoordinat = {
                                    latitude: Number(coords[0]),
                                    longitude: Number(coords[1])
                                };
                            }
                        }

                        const formatDateIndonesian = (dateStr) => {
                            if (!dateStr) return '';
                            const date = new Date(dateStr.toString().replace(' ', 'T'));
                            if (isNaN(date.getTime())) return '';
                            const months = [
                              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                            ];
                            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
                        };

                        const formatTimeSesi = (mulaiStr, selesaiStr) => {
                            if (!mulaiStr || !selesaiStr) return '';
                            const mulai = new Date(mulaiStr.toString().replace(' ', 'T'));
                            const selesai = new Date(selesaiStr.toString().replace(' ', 'T'));
                            if (isNaN(mulai.getTime()) || isNaN(selesai.getTime())) return '';
                            const pad = (num) => String(num).padStart(2, '0');
                            return `${pad(mulai.getHours())}:${pad(mulai.getMinutes())} - ${pad(selesai.getHours())}:${pad(selesai.getMinutes())}`;
                        };

                        const mappedSession = {
                            id_pemesanan: item.id_pemesanan,
                            id_sesi: item.id_pemesanan,
                            nama_mapel: item.nama_mapel,
                            nama_materi: item.nama_materi,
                            jenjang: item.jenjang_pendidikan,
                            kelas: item.kelas_murid,
                            lokasi: displayLokasi,
                            koordinat: displayKoordinat,
                            tanggal: formatDateIndonesian(item.waktu_mulai),
                            waktu_sesi: formatTimeSesi(item.waktu_mulai, item.waktu_selesai),
                            biaya_sesi: item.biaya_sesi,
                            biaya_jarak: item.biaya_jarak,
                            nominal: item.nominal,
                            total_harga: item.nominal,
                        };

                        setBookingSessionData(mappedSession);
                        setPaymentBackPage('Home');
                        setCurrentPage('DetailPembayaran');
                    } else {
                        setSelectedSession(item);
                        setDetailSesiAktifBackPage('Home');
                        setCurrentPage('DetailSesiAktif');
                    }
                }}
                jenjangMurid={
                    profileData.jenjang_pendidikan || profileData.education
                }
                showSuccessAlert={showLoginSuccessAlert}
                onAlertClose={() => setShowLoginSuccessAlert(false)}
                userId={profileData.id}
                userRole={(profileData.role || 'murid').toLowerCase()}
                kelasMurid={profileData.kelas}
            />
        );
    }

    if (currentPage === 'PesanSesi') {
        return (
            <PesanSesiPage
                onBack={() => {
                    setPesanSesiPrefill(null);
                    setCurrentPage('Home');
                }}
                userId={profileData.id}
                prefillBooking={pesanSesiPrefill}
                onConfirmOrder={data => {
                    setBookingSessionData(data);
                    setPesanSesiPrefill(null);
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
                    setPaymentBackPage('PesanSesi');
                    setCurrentPage('DetailPembayaran');
                }}
                onMatchFailed={() => setCurrentPage('PesanSesi')}
            />
        );
    }

    if (currentPage === 'DetailPembayaran') {
        return (
            <DetailPembayaranPage
                sessionData={bookingSessionData}
                onBack={() => {
                    if (DEV_SKIP_TO_PAYMENT) {
                        setCurrentPage('Login');
                    } else {
                        setCurrentPage(paymentBackPage);
                    }
                }}
                onPaymentSuccess={snapUrl => {
                    setPaymentSnapUrl(snapUrl);
                    setCurrentPage('Pembayaran');
                }}
                onSesiDilepas={() => setCurrentPage('MencariPengajar')}
            />
        );
    }

    if (currentPage === 'Pembayaran') {
      return (
        <PembayaranPage
          snapUrl={paymentSnapUrl}
          idPemesanan={bookingSessionData?.id_pemesanan}
          onFinish={status => {
            // ========== INI PENTING ==========
            if (status === 'success_close') {
              setCurrentPage('Home');
              InteractionManager.runAfterInteractions(() => {
                showInfo('Sukses', 'Pembayaran berhasil!');
              });
              return;
            }
            // ================================

            if (status === 'closed') {
              setCurrentPage('DetailPembayaran');
            } else if (status === 'success') {
              setCurrentPage('Home');
              showInfo('Sukses', 'Pembayaran berhasil!');
            } else if (status === 'pending') {
              setCurrentPage('Home');
              showInfo('Info', 'Pembayaran pending.');
            } else if (status === 'failed') {
              setCurrentPage('DetailPembayaran');
              showInfo('Gagal', 'Pembayaran gagal.');
            } else {
              setCurrentPage('Home');
            }
          }}
        />
      );
    }

    if (currentPage === 'Activity') {
        return (
            <ActivityPage
                initialTab={activityTab}
                onNavigate={page => setCurrentPage(page)}
                onDetailClick={(item, isHistory = false) => {
                    const currentRole = (profileData.role || 'murid').toLowerCase();
                    if (currentRole === 'murid' && !isHistory && item.status_pembayaran === 'menunggu') {
                        // Map the session item to bookingSessionData structure
                        const displayLokasi = item.lokasi_sesi && item.lokasi_sesi.includes('|') ? item.lokasi_sesi.split('|')[1] : item.lokasi_sesi;
                        let displayKoordinat = null;
                        if (item.lokasi_sesi && item.lokasi_sesi.includes('|')) {
                            const coords = item.lokasi_sesi.split('|')[0].split(',');
                            if (coords.length === 2) {
                                displayKoordinat = {
                                    latitude: Number(coords[0]),
                                    longitude: Number(coords[1])
                                };
                            }
                        }

                        const formatDateIndonesian = (dateStr) => {
                            if (!dateStr) return '';
                            const date = new Date(dateStr.toString().replace(' ', 'T'));
                            if (isNaN(date.getTime())) return '';
                            const months = [
                              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                            ];
                            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
                        };

                        const formatTimeSesi = (mulaiStr, selesaiStr) => {
                            if (!mulaiStr || !selesaiStr) return '';
                            const mulai = new Date(mulaiStr.toString().replace(' ', 'T'));
                            const selesai = new Date(selesaiStr.toString().replace(' ', 'T'));
                            if (isNaN(mulai.getTime()) || isNaN(selesai.getTime())) return '';
                            const pad = (num) => String(num).padStart(2, '0');
                            return `${pad(mulai.getHours())}:${pad(mulai.getMinutes())} - ${pad(selesai.getHours())}:${pad(selesai.getMinutes())}`;
                        };

                        const mappedSession = {
                            id_pemesanan: item.id_pemesanan,
                            id_sesi: item.id_pemesanan,
                            nama_mapel: item.nama_mapel,
                            nama_materi: item.nama_materi,
                            jenjang: item.jenjang_pendidikan,
                            kelas: item.kelas_murid,
                            lokasi: displayLokasi,
                            koordinat: displayKoordinat,
                            tanggal: formatDateIndonesian(item.waktu_mulai),
                            waktu_sesi: formatTimeSesi(item.waktu_mulai, item.waktu_selesai),
                            biaya_sesi: item.biaya_sesi,
                            biaya_jarak: item.biaya_jarak,
                            nominal: item.nominal,
                            total_harga: item.nominal,
                        };

                        setBookingSessionData(mappedSession);
                        setPaymentBackPage('Activity');
                        setCurrentPage('DetailPembayaran');
                    } else {
                        setSelectedSession(item);
                        if (!isHistory) {
                            setDetailSesiAktifBackPage('Activity');
                            setCurrentPage('DetailSesiAktif');
                        } else {
                            setCurrentPage('SessionDetail');
                        }
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
                onBack={() => setCurrentPage(detailSesiAktifBackPage)}
                sessionData={selectedSession}
            />
        );
    }

    if (currentPage === 'SessionDetail') {
        const isGuru = profileData.role?.toLowerCase() === 'guru';
        return (
            <SessionDetailPage
                onBack={() => setCurrentPage(isGuru ? 'RealActivityGuru' : 'Activity')}
                sessionData={isGuru ? selectedRiwayatData : selectedSession}
                userId={profileData.id}
                userRole={(profileData.role || 'murid').toLowerCase()}
            />
        );
    }

    if (currentPage === 'Profile') {
        return (
            <ProfilePage
                profileData={profileData}
                onNavigate={page => setCurrentPage(page)}
                onLogout={handleLogout}
                onRefreshData={handleRefreshProfileData}
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
                    setDetailBackPage('Materi');
                    setCurrentPage('Detail');
                }}
            />
        );
    }

    if (currentPage === 'Detail') {
        return (
            <DetailMateriPage
                chapterData={selectedChapter}
                onBack={() => setCurrentPage(detailBackPage)}
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

    if (currentPage === 'TambahMateri') {
        return (
            <TambahMateriGuruPage
            onBack={() => setCurrentPage('RealProfileGuru')}
                idGuru={profileData.id}
            />
        );
    }

    if (currentPage === 'Notifikasi') {
        const currentRole = (profileData.role || 'murid').toLowerCase();
        return (
            <NotifikasiPage
                userId={profileData.id}
                userRole={currentRole}
                onBack={() => setCurrentPage(currentRole === 'guru' ? 'PageGuru' : 'Home')}
            />
        );
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
        onDetailPermintaan={(item, tipe) => {
          setSelectedPermintaanGuru(item);
          setSelectedTipePermintaan(tipe);
          setDetailPermintaanBackPage('PageGuru');
          setCurrentPage('DetailPermintaanGuru');
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
        onRefreshData={handleRefreshProfileData}
      />
    );
  }

  if (currentPage === 'RealActivityGuru') {
    return (
      <ActivityGuruPage
        key={activityGuruRefreshKey} // ← tambah ini
        guruData={profileData}
        onNavigate={handleGlobalNavigate}
        onDetailPermintaan={(item, tipe) => {
          setSelectedPermintaanGuru(item);
          setSelectedTipePermintaan(tipe);
          setDetailPermintaanBackPage('RealActivityGuru');
          setCurrentPage('DetailPermintaanGuru');
        }}
        onDetailRiwayat={rawData => {
          setSelectedRiwayatData(rawData);
          setCurrentPage('SessionDetail');
        }}
      />
    );
  }

  // ✅ TAMBAH: routing halaman detail permintaan guru
  if (currentPage === 'DetailPermintaanGuru') {
    return (
      <DetailPermintaanGuruPage
        permintaanData={selectedPermintaanGuru}
        guruData={profileData}
        tipePermintaan={selectedTipePermintaan}
        onBack={() => setCurrentPage(detailPermintaanBackPage)}
        onTolak={async idPemesanan => {
          showInfo('Info', 'Permintaan ditolak');
          setCurrentPage(detailPermintaanBackPage);
        }}
        onChat={chatData => {
          setSelectedChatUser(chatData);
          setCurrentPage('ChatRoom');
        }}
        onSelesaikan={idPemesanan => {
          setActivityGuruRefreshKey(prev => prev + 1); // trigger refresh
          setCurrentPage(detailPermintaanBackPage);
        }}
        onAjukanBatal={idPemesanan => {
          showInfo('Info', 'Pembatalan diajukan');
          setCurrentPage(detailPermintaanBackPage);
        }}
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
        onPesanSesiPrefill={prefill => {
          setPesanSesiPrefill(prefill);
          setCurrentPage('PesanSesi');
        }}
        onLihatDetailMateri={chapterData => {
          setSelectedChapter(chapterData);
          setDetailBackPage('Home');
          setCurrentPage('Detail');
        }}
        onDetailPermintaan={(item, tipe) => {
          setSelectedPermintaanGuru(item);
          setSelectedTipePermintaan(tipe);
          setDetailPermintaanBackPage('Home');
          setCurrentPage('DetailPermintaanGuru');
        }}
        onDetailSesiAktif={item => {
          setSelectedSession(item);
          setDetailSesiAktifBackPage('Home');
          setCurrentPage('DetailSesiAktif');
        }}
        jenjangMurid={
          profileData.jenjang_pendidikan || profileData.education
        }
        showSuccessAlert={showLoginSuccessAlert}
        onAlertClose={() => setShowLoginSuccessAlert(false)}
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
        kelasMurid={profileData.kelas}
      />
    );
  }

  if (currentPage === 'PesanSesi') {
    return (
      <PesanSesiPage
        onBack={() => {
          setPesanSesiPrefill(null);
          setCurrentPage('Home');
        }}
        userId={profileData.id}
        prefillBooking={pesanSesiPrefill}
        onConfirmOrder={data => {
          setBookingSessionData(data);
          setPesanSesiPrefill(null);
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
        onMatchSuccess={() => setCurrentPage('DetailPembayaran')}
        onMatchFailed={() => setCurrentPage('PesanSesi')}
      />
    );
  }

  if (currentPage === 'DetailPembayaran') {
    return (
      <DetailPembayaranPage
        sessionData={bookingSessionData}
        onBack={() => {
          if (DEV_SKIP_TO_PAYMENT) {
            setCurrentPage('Login');
          } else {
            setCurrentPage('PesanSesi');
          }
        }}
        onPaymentSuccess={snapUrl => {
          setPaymentSnapUrl(snapUrl);
          setCurrentPage('Pembayaran');
        }}
        onSesiDilepas={() => setCurrentPage('MencariPengajar')}
      />
    );
  }

  if (currentPage === 'Pembayaran') {
    return (
      <PembayaranPage
        snapUrl={paymentSnapUrl}
        idPemesanan={bookingSessionData?.id_pemesanan}
        onFinish={status => {
          if (status === 'success_close') {
            setCurrentPage('Home');
            InteractionManager.runAfterInteractions(() => {
              showInfo('Sukses', 'Pembayaran berhasil!');
            });
            return;
          }
          if (status === 'closed') {
            setCurrentPage('DetailPembayaran');
            return;
          }
          if (status === 'success') {
            setCurrentPage('Home');
          } else if (status === 'pending') {
            setCurrentPage('Home');
          } else if (status === 'failed') {
            setCurrentPage('DetailPembayaran');
          } else {
            setCurrentPage('Home');
          }
          InteractionManager.runAfterInteractions(() => {
            if (status === 'success')
              showInfo('Sukses', 'Pembayaran berhasil!');
            else if (status === 'pending')
              showInfo('Info', 'Pembayaran pending.');
            else if (status === 'failed')
              showInfo('Gagal', 'Pembayaran gagal.');
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
        onDetailClick={(item, isHistory = false) => {
          setSelectedSession(item);
          if (!isHistory) {
            setDetailSesiAktifBackPage('Activity');
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
        onBack={() => setCurrentPage(detailSesiAktifBackPage)}
        sessionData={selectedSession}
      />
    );
  }

  if (currentPage === 'SessionDetail') {
    const isGuru = profileData.role?.toLowerCase() === 'guru';
    return (
      <SessionDetailPage
        onBack={() => setCurrentPage(isGuru ? 'RealActivityGuru' : 'Activity')}
        sessionData={isGuru ? selectedRiwayatData : selectedSession}
        userId={profileData.id}
        userRole={(profileData.role || 'murid').toLowerCase()}
      />
    );
  }

  if (currentPage === 'Profile') {
    return (
      <ProfilePage
        profileData={profileData}
        onNavigate={page => setCurrentPage(page)}
        onLogout={handleLogout}
        onRefreshData={handleRefreshProfileData}
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
          setDetailBackPage('Materi');
          setCurrentPage('Detail');
        }}
      />
    );
  }

  if (currentPage === 'Detail') {
    return (
      <DetailMateriPage
        chapterData={selectedChapter}
        onBack={() => setCurrentPage(detailBackPage)}
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

  if (currentPage === 'TambahMateri') {
    return (
      <TambahMateriGuruPage
        onBack={() => setCurrentPage('RealProfileGuru')}
        idGuru={profileData.id}
      />
    );
  }
  if (currentPage === 'Portfolio') {
    return (
      <PortfolioPage
        onBack={() => setCurrentPage('RealProfileGuru')}
        idGuru={profileData.id}
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
