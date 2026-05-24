import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, StatusBar, Animated, useWindowDimensions } from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const SplashScreen = ({ onFinish }) => {
  const { width } = useWindowDimensions();
  
  // 1. UBAH KE 0: Agar aplikasi mulai dari kondisi transparan (Fade In terasa)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 2. GUNAKAN ANIMATED SEQUENCE: Rangkaian komando animasi berurutan yang aman di Hermes
    Animated.sequence([
      
      // TAHAP 1: Muncul perlahan (Fade In) dari opacity 0 ke 1
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800, // Berjalan selama 0.8 detik
        useNativeDriver: true,
      }),

      // TAHAP 2: Menahan logo tetap tampil penuh di layar
      Animated.delay(1200), // Diam selama 1.2 detik agar user sempat membaca

      // TAHAP 3: Menghilang perlahan (Fade Out) dari opacity 1 ke 0
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // Transisi menghilang selama 0.5 detik
        useNativeDriver: true,
      }),

    ]).start(() => {
      // Ketika seluruh urutan (Fade In -> Delay -> Fade Out) selesai, oper perintah ke App.jsx
      if (onFinish) onFinish();
    });
  }, [fadeAnim]);

  // --- KALKULASI UKURAN DINAMIS (Tetap menggunakan milikmu) ---
  const logoSize = width * 0.18;  
  const textSize = width * 0.18;  

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.splashContent}>
        <Image
          source={LOGO_SOURCE}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />
        <Text style={[styles.splashText, { fontSize: textSize }]}>Humana.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject, // Mengunci splash screen agar menutupi halaman utama di bawahnya
    zIndex: 999,
    flex: 1,
    backgroundColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashContent: {
    flexDirection: 'row',       
    alignItems: 'center',       
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  splashText: {
    fontFamily: 'DarkerGrotesque-Bold',
    color: '#FFF',
    marginLeft: 6,             
    letterSpacing: -0.5         
  },
});

export default SplashScreen;