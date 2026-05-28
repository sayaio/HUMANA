import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, Image } from 'react-native';
import CustomAlert from '../components/CustomAlert'; 

const { width, height } = Dimensions.get('window');

const MencariPengajarPage = ({ sessionData, onCancel, onMatchSuccess, onMatchFailed }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('success'); 
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const spinValue = useRef(new Animated.Value(0)).current;
  const radarValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animasi Ikon Berputar
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animasi Radar Peta
    Animated.loop(
      Animated.timing(radarValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      const isSuccess = Math.random() > 0.4; 
      if (isSuccess) {
        setAlertType('success');
        setAlertTitle('Sesi berhasil dipesan!');
        setAlertMessage('Selamat belajar');
      } else {
        setAlertType('error');
        setAlertTitle('Belum ada guru tersedia saat ini');
        setAlertMessage('Coba ubah waktu atau aktifkan notifikasi saat ada guru baru');
      }
      setAlertVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const radarScale = radarValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });

  const radarOpacity = radarValue.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0.4, 0.1, 0],
  });

  return (
    <View style={styles.container}>
      {/* ================= AREA PETA (DIPERBESAR) ================= */}
      <View style={styles.mapSection}>
        <Image 
          source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-86.8025,33.5207,14,0/800x800?access_token=pk.eyJ1IjoibWFyaW8iLCJhIjoiY200In0' }} 
          style={StyleSheet.absoluteFill}
        />
        
        {/* Radar Tetap Ada */}
        <View style={styles.markerContainer}>
           <Animated.View style={[styles.radar, { transform: [{ scale: radarScale }], opacity: radarOpacity }]} />
           <View style={styles.userDot} />
        </View>

        {/* Header Tetap Di Atas */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Text style={styles.backText}>❮ Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pesan Sesi</Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      {/* ================= AREA DETAIL (DIBUAT PAS DI BAWAH) ================= */}
      <View style={styles.detailSection}>
        
        {/* Kartu Floating Diturunkan sesuai image_9f5328.png */}
        <View style={styles.floatingCard}>
          <Animated.Image 
            source={require('../assets/mencari_icon.png')} 
            style={[styles.searchIcon, { transform: [{ rotate: spin }] }]} 
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Mencari Pengajar Terbaik untukmu...</Text>
            <Text style={styles.statusSubtitle}>Biasanya kurang dari 30 detik</Text>
          </View>
        </View>

        {/* Pembungkus Konten Bawah */}
        <View style={styles.contentWrapper}>
          <Text style={styles.sectionTitle}>DETAIL PERMINTAAN</Text>

          <View style={styles.subjectBox}>
            <View style={styles.subjectRow}>
              <View>
                <Text style={styles.label}>Mata Pelajaran</Text>
                <Text style={styles.valueText}>{sessionData?.mata_pelajaran || 'Matematika'}</Text>
              </View>
              <Text style={styles.mathSymbol}>∑</Text>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.smallBox, { marginRight: 15 }]}>
              <Text style={styles.label}>Tingkatan</Text>
              <Text style={styles.smallValueText}>{sessionData?.tingkatan || 'SMA Kelas 12'}</Text>
            </View>
            <View style={styles.smallBox}>
              <Text style={styles.label}>Waktu Sesi</Text>
              <Text style={styles.smallValueText}>{sessionData?.waktu_sesi || '14:00 - 15:30'}</Text>
            </View>
          </View>

          {/* Tombol diposisikan paling bawah */}
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>✕ Batalkan Pesanan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlert 
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          alertType === 'success' ? onMatchSuccess() : onMatchFailed();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  // Menambah porsi peta agar elemen di bawahnya terdorong ke bottom
  mapSection: { height: height * 0.58, justifyContent: 'center', alignItems: 'center' },
  markerContainer: { justifyContent: 'center', alignItems: 'center' },
  userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF', borderWidth: 2, borderColor: '#FFF' },
  radar: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF' },
  
  header: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backText: { fontSize: 16, color: '#333', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  detailSection: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FFF' },

  floatingCard: {
    position: 'absolute',
    top: -35, // Mengatur kartu agar overlap pas di garis peta & putih
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: { width: 42, height: 42, resizeMode: 'contain' },
  statusTextContainer: { marginLeft: 15, flex: 1 },
  statusTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  statusSubtitle: { fontSize: 11, color: '#888' },

  // Wrapper untuk mendorong elemen ke arah bawah layar
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end', // Memastikan elemen berkumpul di bawah
    paddingBottom: 60, // Jarak aman dari navigasi bar HP
    marginTop: 60,
  },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#7A7A7A', marginBottom: 12 },
  
  subjectBox: { 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    padding: 16, 
    borderLeftWidth: 5, 
    borderLeftColor: '#0A4DA2', 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 10, color: '#999', marginBottom: 2 },
  valueText: { fontSize: 16, fontWeight: 'bold', color: '#0A4DA2' },
  mathSymbol: { fontSize: 18, color: '#DDD' },

  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  smallBox: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  smallValueText: { fontSize: 14, fontWeight: 'bold', color: '#333' },

  cancelButton: { 
    backgroundColor: '#F43F5E', 
    borderRadius: 25, 
    paddingVertical: 16, 
    alignItems: 'center',
    marginTop: 10
  },
  cancelButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default MencariPengajarPage;