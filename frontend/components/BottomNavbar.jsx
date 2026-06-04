import React from 'react';
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

const { width } = Dimensions.get('window');

const BottomNavbar = ({ currentScreen, onNavigate, userRole }) => {
  const role = userRole ? userRole.toLowerCase() : 'murid';

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
});

export default BottomNavbar;
