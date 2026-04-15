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
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const App = () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [currentPage, setCurrentPage] = useState('Splash');
  const [isLogin, setIsLogin] = useState(true); // true = Masuk, false = Daftar

  // Form State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState('Murid');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Aset Gambar
  const LOGO_SOURCE = require('./assets/logo_humana.png'); 
  const EYE_ICON = require('./assets/logo_humana.png'); 
  const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/google-logo.png' };

  // ==========================================
  // FUNGSI LOGIKA (NAVIGASI)
  // ==========================================
  useEffect(() => {
    if (currentPage === 'Splash') {
      const timer = setTimeout(() => {
        setCurrentPage('Auth'); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  const handleAuthAction = () => {
    if (isLogin) {
      if (email !== '' && password !== '') {
        setCurrentPage('Home');
      } else {
        Alert.alert('Gagal Masuk', 'Mohon isi Email dan Password kamu.');
      }
    } else {
      if (namaLengkap !== '' && email !== '' && password !== '' && confirmPassword !== '') {
        if (password === confirmPassword) {
          Alert.alert(
            'Pendaftaran Berhasil', 
            'Akun kamu telah dibuat. Silakan masuk menggunakan akun tersebut.',
            [{ text: 'OK', onPress: () => setIsLogin(true) }] 
          );
        } else {
          Alert.alert('Gagal Mendaftar', 'Password dan Konfirmasi Password tidak cocok!');
        }
      } else {
        Alert.alert('Gagal Mendaftar', 'Mohon isi semua kolom yang tersedia.');
      }
    }
  };

  const handleLogout = () => {
    setEmail('');
    setPassword('');
    setCurrentPage('Auth');
    setIsLogin(true);
  };

  const displayName = email ? email.split('@')[0] : 'Pengguna';

  // ==========================================
  // HALAMAN 1: SPLASH SCREEN
  // ==========================================
  if (currentPage === 'Splash') {
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
  // HALAMAN 2: HOME PAGE
  // ==========================================
  if (currentPage === 'Home') {
    return (
      <View style={styles.homeContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.homeHeaderBg} />
          <View style={styles.homeGreetingContainer}>
            <Text style={styles.homeGreetingText}>
              Selamat datang,{"\n"}{namaLengkap || displayName} !
            </Text>
          </View>

          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleTitle}>
              <Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi
            </Text>
            <View style={styles.scheduleDetails}>
              <View><Text style={styles.scheduleLabel}>Waktu</Text><Text style={styles.scheduleValue}>06.30 - 09.30</Text></View>
              <View><Text style={styles.scheduleLabel}>Guru</Text><Text style={styles.scheduleValue}>Ahmad Pambudi, S.Pd.</Text></View>
            </View>
            <Image source={LOGO_SOURCE} style={styles.watermarkLogo} resizeMode="contain" />
          </View>

          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconBox}><Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" /></View>
              <Text style={styles.actionText}>Pesan Sesi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconBox}><Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" /></View>
              <Text style={styles.actionText}>Materi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconBox}><Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" /></View>
              <Text style={styles.actionText}>Jadwal Saya</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          <View style={styles.chartSection}>
            <View style={styles.donutChartPlaceholder}>
              <View style={styles.donutHole}>
                <Text style={styles.donutHoleText}>Total{"\n"}sesi{"\n"}<Text style={{fontWeight: 'bold', fontSize: 16}}>14</Text></Text>
              </View>
            </View>
            <Text style={[styles.chartLabel, { top: 0, right: '20%' }]}>Matematika{"\n"}21.4%</Text>
            <Text style={[styles.chartLabel, { bottom: 0, right: '15%' }]}>Bahasa Indonesia{"\n"}35.7%</Text>
            <Text style={[styles.chartLabel, { bottom: '20%', left: '20%' }]}>IPS{"\n"}14.3%</Text>
            <Text style={[styles.chartLabel, { top: '20%', left: '20%' }]}>IPA{"\n"}28.6%</Text>
          </View>

          <TouchableOpacity style={styles.tempLogout} onPress={handleLogout}>
            <Text style={{color: '#FFF'}}>Logout (Sementara)</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#2A3563' }]} resizeMode="contain" /><Text style={[styles.navText, { color: '#2A3563' }]}>Home</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Activity</Text></TouchableOpacity>
          <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fabButton}><Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" /></TouchableOpacity>
            <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
          </View>
          <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Chat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // HALAMAN 3: AUTH PAGE (HASIL TERJEMAHAN XML)
  // ==========================================
  return (
    // styles.container sekarang menggunakan pengaturan dari file XML kamu
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.navyBackgroundTop} />
      <View style={styles.navyBackgroundTriangle} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
          
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
                <Image source={LOGO_SOURCE} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.titleText}>No pressure,{"\n"}just progress</Text>
            <Text style={styles.subtitleText}>
              Make learning simple and enjoyable{"\n"}Sign in to get a tailored experience just for you
            </Text>
          </View>

          <View style={styles.formCard}>
            
            <Text style={styles.formCardTitle}>{isLogin ? 'Masuk' : 'Daftar'}</Text>
            
            {isLogin ? (
              <View style={styles.switchModeContainer}>
                <Text style={styles.switchModeText}>Belum memiliki akun? </Text>
                <TouchableOpacity onPress={() => setIsLogin(false)}>
                  <Text style={styles.switchModeLink}>Daftar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.switchModeContainer}>
                <Text style={styles.switchModeText}>Sudah memiliki akun? </Text>
                <TouchableOpacity onPress={() => setIsLogin(true)}>
                  <Text style={styles.switchModeLink}>Masuk</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isLogin && (
              <>
                <View style={styles.inputWrapper}>
                  <Text style={styles.floatingLabel}>Nama Lengkap</Text>
                  <TextInput style={styles.inputField} placeholder="someone" value={namaLengkap} onChangeText={setNamaLengkap} placeholderTextColor="#A9A9A9" />
                </View>

                <View style={[styles.inputWrapper, { height: 65, flexDirection: 'row', alignItems: 'center' }]}>
                  <Text style={styles.floatingLabel}>Daftar Sebagai</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setRole('Guru')}>
                      <View style={styles.radioCircle}>{role === 'Guru' && <View style={styles.radioInnerCircle} />}</View>
                      <Text style={styles.radioText}>Guru</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setRole('Murid')}>
                      <View style={styles.radioCircle}>{role === 'Murid' && <View style={styles.radioInnerCircle} />}</View>
                      <Text style={styles.radioText}>Murid</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput style={styles.inputField} placeholder="someone@domain.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#A9A9A9" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordField} placeholder="Masukan password" value={password} onChangeText={setPassword} secureTextEntry={true} placeholderTextColor="#A9A9A9" />
                <TouchableOpacity><Image source={EYE_ICON} style={styles.eyeIcon} resizeMode="contain" /></TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.floatingLabel}>Konfirmasi Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput style={styles.passwordField} placeholder="Masukan password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} placeholderTextColor="#A9A9A9" />
                  <TouchableOpacity><Image source={EYE_ICON} style={styles.eyeIcon} resizeMode="contain" /></TouchableOpacity>
                </View>
              </View>
            )}

            {isLogin && (
              <View style={styles.rememberForgotRow}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Lupa password ?</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleAuthAction}>
              <Text style={styles.submitButtonText}>{isLogin ? 'Masuk' : 'Daftar'}</Text>
            </TouchableOpacity>

            <View style={styles.orDividerContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Atau</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>{isLogin ? 'Masuk dengan Google' : 'Daftar dengan Google'}</Text>
              <Image source={GOOGLE_ICON} style={styles.googleIconRight} resizeMode="contain" />
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              By continuing I agree with the <Text style={styles.linkText}>Terms & Conditions</Text>,{"\n"}<Text style={styles.linkText}>Privacy Policy.</Text>
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  navyBackgroundTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%', backgroundColor: '#2A3563' },
  navyBackgroundTriangle: { 
    position: 'absolute', top: '65%', left: 0, width: 0, height: 0,
    backgroundColor: 'transparent', borderStyle: 'solid',
    borderLeftWidth: width / 2, borderRightWidth: width / 2, borderTopWidth: 60,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#2A3563',
  },

  // --- Translasi Kode XML dari Figma ---
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', // Translasi dari: android:fillColor="#FFFFFF"
    borderRadius: 20,           // Translasi dari hitungan: M20 0H420C431.046... (radius 20)
    overflow: 'hidden'          // Translasi dari: android:clipToOutline="true"
  },
  
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between' },
  headerSection: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 60, paddingBottom: 20 },
  logoWrapper: { marginBottom: 15 },
  logoImage: { width: 70, height: 70 },
  titleText: { fontSize: 26, fontWeight: 'bold', color: '#FFF', textAlign: 'center', lineHeight: 32, marginBottom: 10 },
  subtitleText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  
  formCard: { 
    backgroundColor: '#FFF', borderRadius: 30, paddingHorizontal: 25, paddingTop: 35, paddingBottom: 40,
    marginHorizontal: 20, marginBottom: 30, elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10 
  },
  
  formCardTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5 },
  switchModeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  switchModeText: { fontSize: 12, color: '#888' },
  switchModeLink: { fontSize: 12, color: '#4285F4', fontWeight: 'bold' },

  inputWrapper: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, height: 55, marginBottom: 25, justifyContent: 'center', paddingHorizontal: 15, backgroundColor: '#FFF' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFF', paddingHorizontal: 5, fontSize: 12, color: '#D3D3D3', zIndex: 1 },
  inputField: { fontSize: 15, color: '#333', height: '100%', paddingVertical: 0 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  passwordField: { flex: 1, fontSize: 15, color: '#333', height: '100%', paddingVertical: 0 },
  eyeIcon: { width: 22, height: 22, tintColor: '#D3D3D3' },
  
  radioGroup: { flexDirection: 'row', marginLeft: 10 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2A3563', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  radioInnerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2A3563' },
  radioText: { fontSize: 14, color: '#333' },

  rememberForgotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: -10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: '#A9A9A9', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  checkboxActive: { backgroundColor: '#2A3563', borderColor: '#2A3563' },
  checkboxText: { fontSize: 12, color: '#666' },
  forgotPasswordText: { fontSize: 12, color: '#4285F4', fontWeight: '600' },

  submitButton: { backgroundColor: '#B5CB68', borderRadius: 25, height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  orDividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  orText: { marginHorizontal: 15, fontSize: 12, color: '#A9A9A9' },

  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, height: 55, marginBottom: 20 },
  googleButtonText: { color: '#333', fontSize: 15, fontWeight: 'bold', marginRight: 10 },
  googleIconRight: { width: 20, height: 20 },
  
  footerText: { textAlign: 'center', fontSize: 10, color: '#A9A9A9', lineHeight: 16 },
  linkText: { textDecorationLine: 'underline' },

  splashContainer: { flex: 1, backgroundColor: '#2A3563', justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center', flexDirection: 'row' },
  splashLogo: { width: 60, height: 60, marginRight: 10 },
  splashText: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  
  homeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  homeHeaderBg: { position: 'absolute', width: '100%', height: 260, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#2A3563' },
  homeGreetingContainer: { marginTop: 80, paddingHorizontal: 30 },
  homeGreetingText: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', lineHeight: 36, textTransform: 'capitalize' },
  
  scheduleCard: { backgroundColor: '#FFF', marginHorizontal: 25, marginTop: 40, borderRadius: 20, padding: 25, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 5, overflow: 'hidden' },
  scheduleTitle: { fontSize: 18, color: '#333', marginBottom: 20 },
  scheduleDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  scheduleLabel: { fontSize: 12, color: '#A9A9A9', marginBottom: 5 },
  scheduleValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  watermarkLogo: { position: 'absolute', right: -20, top: 20, width: 120, height: 120, tintColor: '#F0F0F0', opacity: 0.5, zIndex: -1 },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30, paddingHorizontal: 10 },
  actionItem: { alignItems: 'center' },
  actionIconBox: { width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3, marginBottom: 10 },
  actionIcon: { width: 35, height: 35, tintColor: '#2A3563' },
  actionText: { fontSize: 12, color: '#333' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 30, marginTop: 30 },
  chartSection: { marginTop: 40, alignItems: 'center', height: 250, position: 'relative' },
  donutChartPlaceholder: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#34315A', borderWidth: 20, borderColor: '#2A3563', justifyContent: 'center', alignItems: 'center' },
  donutHole: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  donutHoleText: { textAlign: 'center', fontSize: 12, color: '#333' },
  chartLabel: { position: 'absolute', fontSize: 10, color: '#333', textAlign: 'center' },
  tempLogout: { alignSelf: 'center', marginTop: 20, padding: 10, backgroundColor: '#FF6B6B', borderRadius: 10 },
  
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEE', paddingHorizontal: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navIcon: { width: 24, height: 24, tintColor: '#A9A9A9', marginBottom: 5 },
  navText: { fontSize: 10, color: '#A9A9A9' },
  fabContainer: { alignItems: 'center', justifyContent: 'center', top: -20 },
  fabButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 5, marginBottom: 5 },
  fabIcon: { width: 35, height: 35, tintColor: '#2A3563' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center' },
});

export default App;