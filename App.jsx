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
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const App = () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [currentPage, setCurrentPage] = useState('Splash');
  const [isLogin, setIsLogin] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Aset Gambar
  const LOGO_SOURCE = require('./assets/logo_humana.png'); 
  const EYE_ICON = require('./assets/logo_humana.png'); 
  const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/google-logo.png' };

  // ==========================================
  // FUNGSI LOGIKA
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
      if (firstName !== '' && email !== '' && password !== '' && confirmPassword !== '') {
        if (password === confirmPassword) {
          setCurrentPage('Home');
        } else {
          Alert.alert('Gagal Mendaftar', 'Password dan Confirm Password tidak cocok!');
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
  };

  // LOGIKA PENGAMBILAN NAMA DARI EMAIL
  // Mengambil teks sebelum lambang "@"
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
          
          <LinearGradient 
            colors={['#A1CFF6', '#F8BFE6']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
            style={styles.homeHeaderBg}
          />

          {/* Teks Sambutan yang memanggil displayName dari Email */}
          <View style={styles.homeGreetingContainer}>
            <Text style={styles.homeGreetingText}>
              Selamat datang,{"\n"}{displayName} !
            </Text>
          </View>

          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleTitle}>
              <Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi
            </Text>
            
            <View style={styles.scheduleDetails}>
              <View>
                <Text style={styles.scheduleLabel}>Waktu</Text>
                <Text style={styles.scheduleValue}>06.30 - 09.30</Text>
              </View>
              <View>
                <Text style={styles.scheduleLabel}>Guru</Text>
                <Text style={styles.scheduleValue}>Ahmad Pambudi, S.Pd.</Text>
              </View>
            </View>
            
            <Image source={LOGO_SOURCE} style={styles.watermarkLogo} resizeMode="contain" />
          </View>

          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconBox}>
                <Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" />
              </View>
              <Text style={styles.actionText}>Pesan Sesi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconBox}>
                <Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" />
              </View>
              <Text style={styles.actionText}>Materi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconBox}>
                <Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" />
              </View>
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
          <TouchableOpacity style={styles.navItem}>
            <Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#F8BFE6' }]} resizeMode="contain" />
            <Text style={[styles.navText, { color: '#F8BFE6' }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>Activity</Text>
          </TouchableOpacity>
          <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fabButton}>
              <Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" />
            </TouchableOpacity>
            <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
          </View>
          <TouchableOpacity style={styles.navItem}>
            <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // HALAMAN 3: AUTH PAGE
  // ==========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient 
        colors={['#A1CFF6', '#F8BFE6']} 
        start={{x: 0, y: 0}} end={{x: 1, y: 1}} 
        style={StyleSheet.absoluteFillObject}
      />

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
            
            <View style={styles.tabContainer}>
              <TouchableOpacity style={isLogin ? styles.activeTab : styles.inactiveTab} onPress={() => setIsLogin(true)}>
                <Text style={isLogin ? styles.activeTabText : styles.inactiveTabText}>Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={!isLogin ? styles.activeTab : styles.inactiveTab} onPress={() => setIsLogin(false)}>
                <Text style={!isLogin ? styles.activeTabText : styles.inactiveTabText}>Sign in</Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.rowInputs}>
                <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.floatingLabel}>First Name</Text>
                  <TextInput style={styles.inputField} placeholder="someone" value={firstName} onChangeText={setFirstName} placeholderTextColor="#A9A9A9" />
                </View>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.floatingLabel}>Last Name</Text>
                  <TextInput style={styles.inputField} placeholder="someone" value={lastName} onChangeText={setLastName} placeholderTextColor="#A9A9A9" />
                </View>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput style={styles.inputField} placeholder="someone@domain.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#A9A9A9" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordField} placeholder="Enter password" value={password} onChangeText={setPassword} secureTextEntry={true} placeholderTextColor="#A9A9A9" />
                <TouchableOpacity><Image source={EYE_ICON} style={styles.eyeIcon} resizeMode="contain" /></TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Text style={styles.floatingLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput style={styles.passwordField} placeholder="Enter password again" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} placeholderTextColor="#A9A9A9" />
                  <TouchableOpacity><Image source={EYE_ICON} style={styles.eyeIcon} resizeMode="contain" /></TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={!isLogin ? styles.signinButton : styles.loginButton} onPress={handleAuthAction}>
              <Text style={styles.loginButtonText}>{isLogin ? 'Log in' : 'Sign in'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
              <Image source={GOOGLE_ICON} style={styles.googleIcon} resizeMode="contain" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
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
  homeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  homeHeaderBg: { position: 'absolute', width: '100%', height: 260, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  homeGreetingContainer: { marginTop: 80, paddingHorizontal: 30 },
  
  // Font diperbesar sedikit dan di-capitalize agar namanya terlihat jelas
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
  actionIcon: { width: 35, height: 35, tintColor: '#A1CFF6' },
  actionText: { fontSize: 12, color: '#333' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 30, marginTop: 30 },
  chartSection: { marginTop: 40, alignItems: 'center', height: 250, position: 'relative' },
  donutChartPlaceholder: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#D7A1F9', borderWidth: 20, borderColor: '#A259FF', justifyContent: 'center', alignItems: 'center' },
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
  fabIcon: { width: 35, height: 35, tintColor: '#F8BFE6' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center' },
  splashContainer: { flex: 1, backgroundColor: '#A1CFF6', justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center', flexDirection: 'row' },
  splashLogo: { width: 60, height: 60, marginRight: 10 },
  splashText: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between' },
  headerSection: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 },
  logoWrapper: { marginBottom: 20 },
  logoImage: { width: 70, height: 70 },
  titleText: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', lineHeight: 34, marginBottom: 15 },
  subtitleText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  formCard: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 35, paddingBottom: 40 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 35 },
  activeTab: { backgroundColor: '#C2E0F9', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginRight: 10 },
  inactiveTab: { backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  activeTabText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  inactiveTabText: { color: '#555', fontWeight: '600', fontSize: 15 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  inputWrapper: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, height: 55, marginBottom: 25, justifyContent: 'center', paddingHorizontal: 15, backgroundColor: '#FFF' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFF', paddingHorizontal: 5, fontSize: 12, color: '#D3D3D3', zIndex: 1 },
  inputField: { fontSize: 15, color: '#333', height: '100%', paddingVertical: 0 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', height: '100%' },
  passwordField: { flex: 1, fontSize: 15, color: '#333', height: '100%', paddingVertical: 0 },
  eyeIcon: { width: 22, height: 22, tintColor: '#D3D3D3' },
  loginButton: { backgroundColor: '#C2E0F9', borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  signinButton: { backgroundColor: '#F8BFE6', borderRadius: 12, height: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, height: 55, marginBottom: 25 },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleButtonText: { color: '#333', fontSize: 15, fontWeight: '600' },
  footerText: { textAlign: 'center', fontSize: 11, color: '#A9A9A9', lineHeight: 16 },
  linkText: { textDecorationLine: 'underline' },
});

export default App;