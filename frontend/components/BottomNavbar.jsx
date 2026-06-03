import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// Import Aset Gambar Lokal
const ICON_BERANDA = require('../assets/beranda.png');
const ICON_AKTIVITAS = require('../assets/aktivitas.png');
const ICON_CHAT = require('../assets/chat.png');
const ICON_PROFIL = require('../assets/profil.png');
const LOGO_H = require('../assets/LOGOH.png'); // Aset baru untuk tombol tengah

const BottomNavbar = ({ currentScreen, onNavigate, userRole }) => {
  const role = userRole ? userRole.toLowerCase() : 'murid';

  const isProfileActive = currentScreen === 'Profile' || currentScreen === 'ProfileGuru';
  const isActivityActive = currentScreen === 'Activity' || currentScreen === 'ActivityGuru';

  return (
    <View style={styles.container}>
      {/* BERANDA / HOME */}
      <TouchableOpacity
        style={styles.navBarItem}
        onPress={() => onNavigate && onNavigate('Home')}
      >
        <Image 
          source={ICON_BERANDA} 
          style={[
            styles.navIcon, 
            { tintColor: currentScreen === 'Home' ? '#284B7A' : '#A9A9A9' }
          ]} 
          resizeMode="contain"
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
        <Image 
          source={ICON_AKTIVITAS} 
          style={[
            styles.navIcon, 
            { tintColor: isActivityActive ? '#284B7A' : '#A9A9A9' }
          ]} 
          resizeMode="contain"
        />
        <Text
          style={[
            styles.navBarLabel,
            isActivityActive && styles.activeLabel,
          ]}
        >
          Aktivitas
        </Text>
      </TouchableOpacity>

      {/* TEKS TENGAH (PERMINTAAN / PESAN SESI) */}
      <TouchableOpacity 
        style={styles.navBarItem} 
        onPress={() =>
          onNavigate && onNavigate(role === 'guru' ? 'ActivityGuru' : 'PesanSesi')
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
        <Image 
          source={ICON_CHAT} 
          style={[
            styles.navIcon, 
            { tintColor: currentScreen === 'Chat' ? '#284B7A' : '#A9A9A9' }
          ]} 
          resizeMode="contain"
        />
        <Text
          style={[
            styles.navBarLabel,
            currentScreen === 'Chat' && styles.activeLabel,
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
        <Image 
          source={ICON_PROFIL} 
          style={[
            styles.navIcon, 
            { tintColor: isProfileActive ? '#284B7A' : '#A9A9A9' }
          ]} 
          resizeMode="contain"
        />
        <Text
          style={[
            styles.navBarLabel,
            isProfileActive && styles.activeLabel,
          ]}
        >
          Profil
        </Text>
      </TouchableOpacity>

      {/* FAB BUTTON (TOMBOL BULAT TENGAH DENGAN LOGO H) */}
      <View style={styles.centerFabWrapper}>
        <TouchableOpacity
          style={styles.centerFabAbsolute}
          onPress={() =>
            onNavigate && onNavigate(role === 'guru' ? 'ActivityGuru' : 'PesanSesi')
          }
          activeOpacity={0.8}
        >
          <Image
            source={LOGO_H}
            style={styles.centerFabLogoIcon}
            resizeMode="contain"
          />
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
  
  // Wrapper untuk memberikan efek lingkaran putih di belakang tombol biru (sesuai gambar)
  centerFabWrapper: {
    position: 'absolute',
    left: width / 2 - 35,
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF', // Efek putih melengkung di belakang
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
  centerFabLogoIcon: { 
  width: 80, 
  height: 150, 
  tintColor: '#FFF',
  marginLeft: 2.5,
  marginTop: 3,
},
});

export default BottomNavbar;