import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, StatusBar } from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png'); 

const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); 
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.splashContent}>
        <Image source={LOGO_SOURCE} style={styles.splashLogo} resizeMode="contain" />
        <Text style={styles.splashText}>Humana.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center', flexDirection: 'row' },
  splashLogo: { width: 60, height: 60, marginRight: 10 },
  splashText: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
});

export default SplashScreen;