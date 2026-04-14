import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  ScrollView
} from 'react-native';

const App = () => {
  // 1. Tambahkan state untuk mengontrol kemunculan Splash Screen
  const [isShowSplash, setIsShowSplash] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const LOGO_SOURCE = require('./assets/logo_humana.png'); 
  const EYE_ICON = require('./assets/logo_humana.png'); 
  const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/google-logo.png' };

  // 2. Tambahkan useEffect untuk membuat timer Splash Screen
  useEffect(() => {
    // Splash screen akan tampil selama 3000 milidetik (3 detik)
    const timer = setTimeout(() => {
      setIsShowSplash(false); // Setelah 3 detik, ubah state untuk menghilangkan splash
    }, 3000);

    // Membersihkan timer agar tidak bocor di memori
    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // TAMPILAN SPLASH SCREEN
  // ==========================================
  if (isShowSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.splashContent}>
          <Image source={LOGO_SOURCE} style={styles.splashLogo} resizeMode="contain" />
          <Text style={styles.splashText}>Humana.</Text>
        </View>
      </View>
    );
  }

  // ==========================================
  // TAMPILAN HALAMAN LOGIN
  // ==========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
                <Image source={LOGO_SOURCE} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.titleText}>No pressure just Progress</Text>
            <Text style={styles.subtitleText}>
              Make learning simple and enjoyable{"\n"}Sign in to get a tailored experience just for you
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity style={styles.activeTab}>
                <Text style={styles.activeTabText}>Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inactiveTab}>
                <Text style={styles.inactiveTabText}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput
                style={styles.inputField}
                placeholder="someone@domain.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A9A9A9"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordField}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  placeholderTextColor="#A9A9A9"
                />
                <TouchableOpacity>
                  <Image source={EYE_ICON} style={styles.eyeIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
              <Image source={GOOGLE_ICON} style={styles.googleIcon} resizeMode="contain" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              By continuing I agree with the <Text style={styles.linkText}>Terms & Conditions</Text>,{"\n"}
              <Text style={styles.linkText}>Privacy Policy.</Text>
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Gaya Khusus Splash Screen ---
  splashContainer: {
    flex: 1,
    backgroundColor: '#A1CFF6', // Warna biru sama dengan halaman login
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    flexDirection: 'row', // Agar logo dan teks menyamping (seperti di desain Figma)
  },
  splashLogo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  splashText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  
  // --- Gaya Halaman Login (Tetap Sama) ---
  container: {
    flex: 1,
    backgroundColor: '#A1CFF6', 
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, 
    justifyContent: 'space-between', 
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 80, 
    paddingBottom: 40,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 15,
  },
  subtitleText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 35,
  },
  activeTab: {
    backgroundColor: '#C2E0F9', 
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inactiveTabText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 55,
    marginBottom: 25,
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: '#FFF',
    paddingHorizontal: 5,
    fontSize: 12,
    color: '#D3D3D3',
    zIndex: 1, 
  },
  inputField: {
    fontSize: 15,
    color: '#333',
    height: '100%',
    paddingVertical: 0, 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  passwordField: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
    paddingVertical: 0,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#D3D3D3',
  },
  loginButton: {
    backgroundColor: '#C2E0F9',
    borderRadius: 12, 
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 55,
    marginBottom: 25,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#A9A9A9',
    lineHeight: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});

export default App;