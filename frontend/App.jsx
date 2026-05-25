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
import ActivityGuruPage from './pages/ActivityGuruPage'; // Impor berkas baru Aktivitas Guru
import PesanSesiPage from './pages/PesanSesiPage';

const App = () => {
    const [currentPage, setCurrentPage] = useState('Splash');
    const [isAppLoading, setIsAppLoading] = useState(true);

    const [namaLengkap, setNamaLengkap] = useState('');
    const [email, setEmail] = useState('');
    const [profileData, setProfileData] = useState({
        id: null,
        role: 'murid',
        username: '',
        phone: '',
        gender: 'Laki-laki',
        domicile: ''
    });

    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const savedRole = await AsyncStorage.getItem('userRole');
                const savedName = await AsyncStorage.getItem('namaLengkap');
                const savedEmail = await AsyncStorage.getItem('userEmail');
                const savedId = await AsyncStorage.getItem('userId');
                const savedUsername = await AsyncStorage.getItem('username');
                const savedPhone = await AsyncStorage.getItem('phone');
                const savedGender = await AsyncStorage.getItem('gender');
                const savedDomicile = await AsyncStorage.getItem('domicile');

                if (token && savedRole) {
                    setNamaLengkap(savedName || '');
                    setEmail(savedEmail || '');
                    setProfileData({
                        id: savedId,
                        role: savedRole,
                        username: savedUsername || '',
                        phone: savedPhone || '',
                        gender: savedGender || 'Laki-laki',
                        domicile: savedDomicile || ''
                    });

                    if (savedRole.toLowerCase() === 'guru') {
                        setCurrentPage('HomeGuru');
                    } else {
                        setCurrentPage('Home');
                    }
                } else {
                    setCurrentPage('Login');
                }
            } catch (e) {
                setCurrentPage('Login');
            } finally {
                setIsAppLoading(false);
            }
        };

        setTimeout(() => {
            checkLoginStatus();
        }, 2000);
    }, []);

    const handleLoginSuccess = (userData) => {
        setNamaLengkap(userData.nama_lengkap);
        setEmail(userData.email);
        setProfileData({
            id: userData.id,
            role: userData.role,
            username: userData.username || '',
            phone: userData.phone || '',
            gender: userData.gender || 'Laki-laki',
            domicile: userData.domicile || ''
        });

        if (userData.role.toLowerCase() === 'guru') {
            setCurrentPage('HomeGuru');
        } else {
            setCurrentPage('Home');
        }
    };

    const handleGlobalNavigate = (pageName) => {
        if (pageName === 'ProfileGuru') {
            setCurrentPage('ProfileGuru');
        } else if (pageName === 'HomeGuru') {
            setCurrentPage('HomeGuru');
        } else if (pageName === 'ActivityGuru') {
            setCurrentPage('ActivityGuru');
        } else if (pageName === 'ChatGuru') {
            setCurrentPage('Chat');
        } else {
            setCurrentPage(pageName);
        }
    };

    if (isAppLoading || currentPage === 'Splash') {
        return <SplashScreen />;;
    }

    // ALUR ROUTING VIEW INTERFACE GURU
    if (currentPage === 'HomeGuru') {
        return (
            <PageGuru
                guruData={{ id: profileData.id, nama: namaLengkap }}
                onNavigate={handleGlobalNavigate}
            />
        );
    }

    if (currentPage === 'ActivityGuru') {
        return (
            <ActivityGuruPage
                guruData={{ id: profileData.id, nama: namaLengkap }}
                onNavigate={handleGlobalNavigate}
            />
        );
    }

    if (currentPage === 'ProfileGuru') {
        return (
            <ProfileGuruPage
                guruData={{
                    name: namaLengkap,
                    email: email,
                    username: profileData.username,
                    phone: profileData.phone,
                    gender: profileData.gender,
                    domicile: profileData.domicile
                }}
                onNavigate={handleGlobalNavigate}
            />
        );
    }

    // ALUR ROUTING VIEW INTERFACE MURID
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
        return <RegisterPage onNavigateToLogin={() => setCurrentPage('Login')} />;
    }

    if (currentPage === 'ResetPassword') {
        return <ResetPasswordPage onBackToLogin={() => setCurrentPage('Login')} />;
    }

    if (currentPage === 'Home') {
        return (
            <HomePage
                namaLengkap={namaLengkap}
                onNavigate={page => setCurrentPage(page)}
                onSubjectSelect={subject => {
                    setSelectedSubject(subject);
                    setCurrentPage('Materi');
                }}
                onSessionSelect={sessionId => {
                    setSelectedSessionId(sessionId);
                    setCurrentPage('SessionDetail');
                }}
            />
        );
    }

    if (currentPage === 'PesanSesi') {
        return (
            <PesanSesiPage
                onBack={() => setCurrentPage('Home')}
                onSuccess={() => setCurrentPage('Activity')}
            />
        );
    }

    if (currentPage === 'Activity') {
        return (
            <ActivityPage
                onNavigate={page => setCurrentPage(page)}
                onSessionSelect={sessionId => {
                    setSelectedSessionId(sessionId);
                    setCurrentPage('SessionDetail');
                }}
            />
        );
    }

    if (currentPage === 'SessionDetail') {
        return (
            <SessionDetailPage
                sessionId={selectedSessionId}
                onBack={() => setCurrentPage('Activity')}
            />
        );
    }

    if (currentPage === 'Profile') {
        return (
            <ProfilePage
                namaLengkap={namaLengkap}
                email={email}
                onNavigate={page => setCurrentPage(page)}
            />
        );
    }

    if (currentPage === 'EditBasicProfile') {
        return <EditBasicProfilePage onBack={() => setCurrentPage('Profile')} />;
    }

    if (currentPage === 'EditAcademicProfile') {
        return <EditAcademicProfilePage onBack={() => setCurrentPage('Profile')} />;
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