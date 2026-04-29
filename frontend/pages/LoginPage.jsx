import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Image, SafeAreaView, StatusBar, ScrollView, Dimensions
} from 'react-native';

import { loginUser } from '../services/authService'; 
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const LoginPage = ({ onLoginSuccess, onNavigateToRegister, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    
    // 1. STATE BARU UNTUK MENGONTROL VISIBILITAS PASSWORD
    const [showPassword, setShowPassword] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
      visible: false, type: 'error', title: '', message: '', onCloseAction: null
    });

    const LOGO_SOURCE = require('../assets/logo_humana.png'); 
    const EYE_ICON = require('../assets/logo_humana.png'); 
    const GOOGLE_ICON = { uri: 'https://img.icons8.com/color/48/google-logo.png' };

    const showAlert = (type, title, message, onCloseAction = null) => {
      setAlertConfig({ visible: true, type, title, message, onCloseAction });
    };

    const handleCloseAlert = () => {
      setAlertConfig(prev => ({ ...prev, visible: false }));
      if (alertConfig.onCloseAction) {
        alertConfig.onCloseAction();
      }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            showAlert('error', 'Data Kosong', 'Email dan Password tidak boleh kosong.');
            return;
        }
        
        try {
            const result = await loginUser(email, password); 
            
            if (result.success === true || result.token || result.status === 200) {
                const userData = result.data || result.user || result || {};
                onLoginSuccess(userData, email); 
            } else {
                showAlert('error', 'Login Gagal', result.message || 'Cek kembali email dan password-mu atau coba metode lain.');
            }
        } catch (err) {
            showAlert('error', 'Terjadi Kesalahan', 'Coba cek koneksi internetmu atau coba metode lain.');
        }
    };

    return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <View style={styles.blueBackgroundTop} />
      <View style={styles.blueBackgroundTriangle} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
          
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
                <Image source={LOGO_SOURCE} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.titleText}>Humanity in action,{"\n"}Learning in motion</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>Masuk</Text>
            
            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>Belum memiliki akun? </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.switchModeLink}>Daftar</Text>
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
                  placeholder="Masukan password" 
                  value={password} 
                  onChangeText={setPassword} 
                  // 2. SECURE TEXT ENTRY SEKARANG DINAMIS MENGIKUTI STATE
                  secureTextEntry={!showPassword} 
                  placeholderTextColor="#A9A9A9" 
                />
                {/* 3. TOMBOL MATA DIBERI FUNGSI ONPRESS UNTUK MENGUBAH STATE */}
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Image 
                    source={EYE_ICON} 
                    // 4. EFEK WARNA BERUBAH JIKA PASSWORD SEDANG DILIHAT
                    style={[styles.eyeIcon, showPassword && { tintColor: '#284B7A' }]} 
                    resizeMode="contain" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rememberForgotRow}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotPasswordText}>Lupa password ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitButtonText}>Masuk</Text>
            </TouchableOpacity>

            <View style={styles.orDividerContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Atau</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
              <Image source={GOOGLE_ICON} style={styles.googleIconRight} resizeMode="contain" />
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              By continuing I agree with the <Text style={styles.linkText}>Terms & Conditions</Text>,{"\n"}<Text style={styles.linkText}>Privacy Policy.</Text>
            </Text>

          </View>
        </ScrollView>
      </SafeAreaView>

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleCloseAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  blueBackgroundTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%', backgroundColor: '#284B7A' },
  blueBackgroundTriangle: { position: 'absolute', top: '65%', left: 0, width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: width / 2, borderRightWidth: width / 2, borderTopWidth: 60, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#284B7A' },
  container: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between' },
  headerSection: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 60, paddingBottom: 20 },
  logoWrapper: { marginBottom: 15 },
  logoImage: { width: 100, height: 100 },
  titleText: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center', lineHeight: 32, marginBottom: 10 },
  formCard: { backgroundColor: '#FFF', borderRadius: 30, paddingHorizontal: 25, paddingTop: 35, paddingBottom: 40, marginHorizontal: 20, marginBottom: 30, elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10 },
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
  rememberForgotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: -10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: '#A9A9A9', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  checkboxActive: { backgroundColor: '#284B7A', borderColor: '#284B7A' },
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
});

export default LoginPage;