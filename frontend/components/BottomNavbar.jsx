import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Home from './homeSVG';
import Actv from './activitySVG';
import LogoH from './pesanSVG'; // 1. UBAH DI SINI: Ganti jadi LogoH (L Kapital)
import Profil from './profilSVG';
import Chat from './chatSVG';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChatList } from '../services/chatService';

const { width } = Dimensions.get('window');

const BottomNavbar = ({ currentScreen, onNavigate, userRole, totalUnread = 0 }) => {
  const role = userRole ? userRole.toLowerCase() : 'murid';
  const [unreadCount, setUnreadCount] = useState(totalUnread);

  useEffect(() => {
    if (totalUnread > 0) {
      setUnreadCount(totalUnread);
    }
  }, [totalUnread]);

  useEffect(() => {
    if (currentScreen === 'Chat') return; 
    let isMounted = true;

    const fetchUnread = async () => {
      try {
        const sessionString = await AsyncStorage.getItem('user_session');
        if (!sessionString) return;
        const session = JSON.parse(sessionString);
        const userObj = session.userData || session.user || session;
        const userId = userObj.id || userObj.id_murid || userObj.id_guru;
        if (!userId) return;

        const chats = await getChatList(userId, role, 50, 0); 
        if (isMounted && chats && Array.isArray(chats)) {
          const unread = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
          setUnreadCount(unread);
        }
      } catch (e) {
        console.log('Error fetch unread navbar:', e);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Poll every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentScreen, role]);

  const isProfileActive =
    currentScreen === 'Profile' || currentScreen === 'ProfileGuru';
  const isActivityActive =
    currentScreen === 'Activity' || currentScreen === 'ActivityGuru';

  return (
    <View style={styles.container}>
      {/* BERANDA / HOME */}
      <TouchableOpacity
        style={styles.navBarItem}
        onPress={() => onNavigate && onNavigate('Home')}
      >
        <Home
          size={25}
          color={currentScreen === 'Home' ? '#284B7A' : '#A9A9A9'}
        />
        <Text
          style={[
            styles.navBarLabel,
            currentScreen === 'Home' && styles.activeLabel,
          ]}
        >
          Beranda
        </Text>
      </TouchableOpacity>

      {/* AKTIVITAS / ACTIVITY */}
      <TouchableOpacity
        style={styles.navBarItem}
        onPress={() =>
          onNavigate &&
          onNavigate(role === 'guru' ? 'ActivityGuru' : 'Activity', 'aktif')
        }
      >
        <Actv
          size={25}
          color={
            currentScreen === 'Activity' || currentScreen === 'ActivityGuru'
              ? '#284B7A'
              : '#A9A9A9'
          }
        />
        <Text
          style={[styles.navBarLabel, isActivityActive && styles.activeLabel]}
        >
          Aktivitas
        </Text>
      </TouchableOpacity>

      {/* TEKS TENGAH (PERMINTAAN / PESAN SESI) */}
      <TouchableOpacity
        style={styles.navBarItem}
        onPress={() =>
          onNavigate &&
          onNavigate(role === 'guru' ? 'ActivityGuru' : 'PesanSesi')
        }
      >
        <View style={{ height: 22 }} />
        <Text
          style={[
            styles.navBarLabel,
            { color: '#284B7A', fontWeight: '600', fontSize: 9 },
          ]}
        >
          {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
        </Text>
      </TouchableOpacity>

      {/* CHAT */}
      <TouchableOpacity
        style={styles.navBarItem}
        onPress={() => onNavigate && onNavigate('Chat')}
      >
        <View style={{ transform: [{ translateY: -3 }] }}>
          <Chat
            size={30}
            color={currentScreen === 'Chat' ? '#284B7A' : '#A9A9A9'}
          />
          {unreadCount > 0 && (
            <View style={styles.navBadge}>
              <Text style={styles.navBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.navBarLabel,
            currentScreen === 'Chat' && styles.activeLabel,
            { marginTop: -2 },
          ]}
        >
          Chat
        </Text>
      </TouchableOpacity>

      {/* PROFILE */}
      <TouchableOpacity
        style={styles.navBarItem}
        onPress={() =>
          onNavigate && onNavigate(role === 'guru' ? 'ProfileGuru' : 'Profile')
        }
      >
        <Profil size={25} color={isProfileActive ? '#284B7A' : '#A9A9A9'} />
        <Text
          style={[styles.navBarLabel, isProfileActive && styles.activeLabel]}
        >
          Profil
        </Text>
      </TouchableOpacity>

      {/* FAB BUTTON (TOMBOL BULAT TENGAH DENGAN LOGO H) */}
      <View style={styles.centerFabWrapper}>
        <TouchableOpacity
          style={styles.centerFabAbsolute}
          onPress={() =>
            onNavigate &&
            onNavigate(role === 'guru' ? 'ActivityGuru' : 'PesanSesi')
          }
          activeOpacity={0.8}
        >
          {/* 2. UBAH DI SINI: Panggil dengan <LogoH /> menggunakan huruf kapital */}
          <LogoH size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 85,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#EEF0F2',
    zIndex: 1000,
    paddingBottom: 12,
  },
  navBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navIcon: {
    width: 25,
    height: 25,
  },
  navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
  activeLabel: { color: '#284B7A', fontWeight: 'bold' },

  centerFabWrapper: {
    position: 'absolute',
    left: width / 2 - 35,
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  centerFabAbsolute: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#284B7A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#F43F5E',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
},
navBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
},
});

export default BottomNavbar;
