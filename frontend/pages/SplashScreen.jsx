import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, StatusBar, Animated, useWindowDimensions } from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png'); 

const SplashScreen = ({ onFinish }) => {
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400, 
        useNativeDriver: true, 
      }).start(() => {
        onFinish();
      });
    }, 1500); 

    return () => clearTimeout(timer);
  }, [onFinish, fadeAnim]);

  // --- KALKULASI UKURAN DINAMIS (BISA DIATUR DI SINI) ---
  const logoSize = width * 0.18;  // Ukuran simbol logo (~18% dari lebar layar)
  const textSize = width * 0.18;  // Ukuran font teks "Humana." (~12% dari lebar layar)

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Pembungkus konten dibuat berjejer ke samping (row) */}
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
    flex: 1, 
    backgroundColor: '#284B7A', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  splashContent: { 
    flexDirection: 'row',       // Membuat logo dan teks berjejer horizontal
    alignItems: 'center',       // Membuat logo dan teks rata tengah secara vertikal
    justifyContent: 'center',
    paddingHorizontal: 20 
  },
  splashText: { 
    fontFamily: 'DarkerGrotesque-Bold', 
    color: '#FFF',
    marginLeft: 6,             // Jarak aman antara logo dengan tulisan di sampingnya
    letterSpacing: -0.5         // Sedikit merapatkan antar huruf agar mirip mockup
  },
});

export default SplashScreen;