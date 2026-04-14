import React, { useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Pastikan file-file ini ada di folder assets kamu
  const LOGO_SOURCE = require('./assets/logo_humana.png'); 
  const EYE_ICON = require('./assets/logo_humana.png'); // Ganti dengan icon mata (eye slash) nanti
  
  // Icon Google dari internet agar langsung muncul
  const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/google-logo.png' };

  return (
    <View style={styles.container}>
      {/* Membuat status bar transparan agar gradasi menabrak ujung atas layar */}
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 1. Background Gradasi Full Layar */}
      <LinearGradient 
        colors={['#A1CFF6', '#F8BFE6']} // Warna biru ke pink sesuai desain terakhir
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 1}} 
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* 2. ScrollView agar aman di layar kecil */}
        <ScrollView  
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          
          {/* 3. Bagian Header (Logo & Teks) */}
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
                {/* Logo diletakkan di sini. Nanti kamu bisa atur ukurannya. */}
                <Image source={LOGO_SOURCE} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.titleText}>No pressure,{"\n"}just progress</Text>
            <Text style={styles.subtitleText}>
              Make learning simple and enjoyable{"\n"}Sign in to get a tailored experience just for you
            </Text>
          </View>

          {/* 4. Bagian Kartu Putih (Form Login) */}
          <View style={styles.formCard}>
            
            {/* Tab Log in & Sign in */}
            <View style={styles.tabContainer}>
              <TouchableOpacity style={styles.activeTab}>
                <Text style={styles.activeTabText}>Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.inactiveTab}>
                <Text style={styles.inactiveTabText}>Sign in</Text>
              </TouchableOpacity>
            </View>

            {/* Input Email (Floating Label) */}
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

            {/* Input Password (Floating Label) */}
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

            {/* Tombol Log In */}
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            {/* Tombol Continue with Google */}
            <TouchableOpacity style={styles.googleButton}>
              <Image source={GOOGLE_ICON} style={styles.googleIcon} resizeMode="contain" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            {/* Footer Text */}
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, 
    justifyContent: 'space-between', // Memisahkan header ke atas dan form ke bawah
  },
  // --- Header ---
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 80, // Jarak dari atas layar
    paddingBottom: 40,
  },
  logoWrapper: {
    marginBottom: 20,
    // Jika ingin memberi background putih pada logo bulat (opsional):
    // backgroundColor: '#FFF', 
    // borderRadius: 50,
    // padding: 10,
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
  // --- Form Card ---
  formCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 40,
  },
  // --- Tabs ---
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 35,
  },
  activeTab: {
    backgroundColor: '#C2E0F9', // Biru pudar sesuai tombol
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
  // --- Inputs (Floating Label) ---
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
    zIndex: 1, // Memastikan label selalu di atas garis border
  },
  inputField: {
    fontSize: 15,
    color: '#333',
    height: '100%',
    paddingVertical: 0, // Mencegah text terpotong di Android
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
  // --- Buttons ---
  loginButton: {
    backgroundColor: '#C2E0F9',
    borderRadius: 12, // Dibuat sedikit rounded (bukan bulat penuh) sesuai gambar
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
  // --- Footer ---
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