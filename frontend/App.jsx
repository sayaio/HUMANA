import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
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
import ProfilePage from './pages/ProfilePage';
import EditBasicProfilePage from './pages/EditBasicProfilePage';
import EditAcademicProfilePage from './pages/EditAcademicProfilePage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import PageGuru from './pages/PageGuru';
import ProfileGuruPage from './pages/ProfileGuruPage'; 
import ActivityGuruPage from './pages/ActivityGuruPage'; // Memastikan berkas Aktivitas Guru terdaftar
import PesanSesiPage from './pages/PesanSesiPage';

const App = () => {
    const [currentPage, setCurrentPage] = useState('Splash');
    const [isAppLoading, setIsAppLoading] = useState(true);

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
    const [bookingSessionData, setBookingSessionData] = useState(null);

    // ==========================================
    // PENGECEKAN SESI AKTIF SAAT APLIKASI DIBUKA
    // ==========================================
    useEffect(() => {
        const checkLoginSession = async () => {
            try {
                const savedSession = await AsyncStorage.getItem('user_session');

                if (savedSession) {
                    const { userData, email: loggedInEmail } = JSON.parse(savedSession);
                    console.log('🔄 [App.jsx] Sesi ditemukan untuk:', loggedInEmail);

                    const namaDariDB = userData?.nama_murid || userData?.namaLengkap || userData?.name || loggedInEmail.split('@')[0];
                    const usernameDariDB = userData?.username || namaDariDB.toLowerCase().replace(/\s/g, '');
                    const roleDariDB = (userData?.role || userData?.id_role || 'murid').toLowerCase();

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
                        domicile: userData?.domisili || userData?.domicile || userData?.alamat || '-',
                        domisili: userData?.domisili || userData?.domicile || userData?.alamat || '-',
                        alamat: userData?.domisili || userData?.domicile || userData?.alamat || '-',
                        education: userData?.jenjang_pendidikan || userData?.education || '-',
                        jenjang_pendidikan: userData?.jenjang_pendidikan || userData?.education || '-',
                        major: userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
                        kelas_jurusan: userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
                    });

                    if (roleDariDB === 'guru') {
                        setCurrentPage('PageGuru');
                    } else {
                        setCurrentPage('Home');
                    }
                } else {
                    console.log('ℹ️ [App.jsx] Tidak ada sesi aktif. Tetap di Login Page.');
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
        const namaDariDB = userData?.nama_murid || userData?.namaLengkap || userData?.name || loggedInEmail.split('@')[0];
        const usernameDariDB = userData?.username || namaDariDB.toLowerCase().replace(/\s/g, '');
        const roleDariDB = (userData?.role || userData?.id_role || 'murid').toLowerCase();

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
            domicile: userData?.domisili || userData?.domicile || userData?.alamat || '-',
            domisili: userData?.domisili || userData?.domicile || userData?.alamat || '-',
            alamat: userData?.domisili || userData?.domicile || userData?.alamat || '-',
            education: userData?.jenjang_pendidikan || userData?.education || '-',
            jenjang_pendidikan: userData?.jenjang_pendidikan || userData?.education || '-',
            major: userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
            kelas_jurusan: userData?.kelas_jurusan || userData?.jurusan || userData?.major || '-',
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

    // ==========================================
    // FUNGSI LOGOUT (BARU DITAMBAHKAN)
    // ==========================================
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
            
            // Reset State Global ke kondisi awal
            setNamaLengkap('');
            setEmail('');
            setProfileData({
                id: null, role: '-', name: '-', email: '-', username: '-',
                phone: '-', gender: '-', domicile: '-', education: '-', major: '-',
            });
            
            // Lempar kembali ke halaman Login
            setCurrentPage('Login');
        } catch (error) {
            console.error('❌ Gagal melakukan logout:', error);
            Alert.alert('Error', 'Gagal keluar dari akun. Silakan coba lagi.');
        }
    };

    // ==========================================
    // GLOBAL NAVIGATION HANDLER (DIPERBAIKI)
    // ==========================================
    const handleGlobalNavigate = (page, tab) => {
        console.log(`🧭 [App.jsx] Global Navigate to: ${page}, tab: ${tab}`);
        if (tab) setActivityTab(tab);

        const currentRole = (profileData.role || 'murid').toLowerCase();

        if (page === 'Home' && currentRole === 'guru') {
            setCurrentPage('PageGuru');
            return;
        }

        if (page === 'HomeGuru') {
            setCurrentPage('PageGuru');
        } else if (page === 'ActivityGuru') {
            setCurrentPage('RealActivityGuru'); // Dialihkan ke route komponen ActivityGuruPage baru
        } else if (page === 'ChatGuru') {
            setCurrentPage('Chat');
        } else if (page === 'ProfileGuru') {
            setCurrentPage('RealProfileGuru');
        } else {
            setCurrentPage(page);
        }
    };
    // ==========================================
    // ROUTER SYSTEM (DENGAN LOCK STRATEGY)
    // ==========================================

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

    // ==========================================
    // ROUTE KHUSUS GURU
    // ==========================================
    if (currentPage === 'PageGuru') {
        return (
            <PageGuru
                guruData={profileData}
                onNavigate={handleGlobalNavigate}
            />
        );
    }

    if (currentPage === 'RealProfileGuru') {
        return (
            <ProfileGuruPage
                guruData={profileData}
                onNavigate={handleGlobalNavigate}
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

    // ==========================================
    // ROUTE KHUSUS MURID / UMUM
    // ==========================================
    if (currentPage === 'Home') {
        return (
            <HomePage
                namaLengkap={namaLengkap}
                email={email}
                onLogout={handleLogout} // <-- Sekarang aman digunakan
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
                userId={profileData.id}  // ← TAMBAH INI
                onConfirmOrder={(data) => {
                    setBookingSessionData(data);
                    setCurrentPage('MencariPengajar');
                }}
            />
        );
    }

    if (currentPage === 'MencariPengajar') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>🔍 Mencari Pengajar...</Text>
                <Text style={{ color: '#888', marginBottom: 30 }}>Halaman ini sedang dalam pengembangan</Text>
                <TouchableOpacity
                    style={{ backgroundColor: '#1DB954', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 }}
                    onPress={() => setCurrentPage('DetailPembayaran')}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Simulasi: Pengajar Ditemukan →</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setCurrentPage('PesanSesi')}>
                    <Text style={{ color: '#666' }}>← Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (currentPage === 'DetailPembayaran') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>💳 Detail Pembayaran</Text>
                <Text style={{ color: '#888', marginBottom: 30 }}>Halaman ini sedang dalam pengembangan</Text>
                <TouchableOpacity
                    style={{ backgroundColor: '#1DB954', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20 }}
                    onPress={() => {
                        alert('Pembayaran Berhasil! Sesi belajar berhasil dijadwalkan.');
                        setCurrentPage('Home');
                    }}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Simulasi: Bayar Sekarang</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setCurrentPage('PesanSesi')}>
                    <Text style={{ color: '#666' }}>← Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (currentPage === 'Activity') {
        return (
            <ActivityPage
                initialTab={activityTab}
                onNavigate={page => setCurrentPage(page)}
                onDetailClick={item => {
                    setSelectedSession(item);
                    setCurrentPage('SessionDetail');
                }}
                userId={profileData.id}
                userRole={(profileData.role || 'murid').toLowerCase()}
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
                onNavigate={(page) => setCurrentPage(page)}
                onLogout={handleLogout} // <-- Sekarang aman digunakan
            />
        );
    }

    if (currentPage === 'EditBasicProfile') {
        return (
            <EditBasicProfilePage
                profileData={profileData}
                onCancel={() => setCurrentPage('Profile')}
                onSave={async (updatedData) => {
                    setProfileData(updatedData);
                    setNamaLengkap(updatedData.name);

                    try {
                        const savedSession = await AsyncStorage.getItem('user_session');
                        if (savedSession) {
                            const parsed = JSON.parse(savedSession);
                            parsed.userData = { ...parsed.userData, ...updatedData };
                            await AsyncStorage.setItem('user_session', JSON.stringify(parsed));
                        }
                    } catch (e) {
                        console.log('Gagal memperbarui simpanan profil:', e);
                    }

                    setCurrentPage('Profile');
                }}
            />
        );
    }

    if (currentPage === 'EditAcademicProfile') {
        return (
            <EditAcademicProfilePage
                profileData={profileData}
                onCancel={() => setCurrentPage('Profile')}
                onSave={async (updatedData) => {
                    setProfileData(updatedData);

                    try {
                        const savedSession = await AsyncStorage.getItem('user_session');
                        if (savedSession) {
                            const parsed = JSON.parse(savedSession);
                            parsed.userData = { ...parsed.userData, ...updatedData };
                            await AsyncStorage.setItem('user_session', JSON.stringify(parsed));
                        }
                    } catch (e) {
                        console.log('Gagal memperbarui simpanan profil akademik:', e);
                    }

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
                onBack={() => setCurrentPage('Home')}
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

    return (
        <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentPage('Register')}
            onForgotPassword={() => setCurrentPage('ResetPassword')}
        />
    );
};

export default App;