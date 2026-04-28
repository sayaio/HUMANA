import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  Image, SafeAreaView, StatusBar, ScrollView, Dimensions
} from 'react-native';

import { registerUser } from '../services/registerService'; 
import CustomAlert from '../components/CustomAlert';

const { width } = Dimensions.get('window');

const RegisterPage = ({ onRegisterSuccess, onNavigateToLogin }) => {
    const [namaLengkap, setNamaLengkap] = useState('');
    const [role, setRole] = useState('Murid');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    const handleRegister = async () => {
        if (namaLengkap !== '' && email !== '' && password !== '' && confirmPassword !== '') {
            if (password === confirmPassword) {
                
                const userData = {
                    namaLengkap: namaLengkap,
                    email: email,
                    password: password,
                    role: role,
                    username: email.split('@')[0] 
                };

                try {
                    const result = await registerUser(userData);

                    if (result.success) {
                        showAlert('success', 'Sukses!', 'Akun kamu berhasil dibuat.', () => {
                          onNavigateToLogin();
                        });
                    } else {
                        showAlert('error', 'Pendaftaran Gagal', result.message || 'Terjadi kesalahan pada server.');
                    }
                } catch (error) {
                    showAlert('error', 'Terjadi Kesalahan', 'Coba cek koneksi internetmu atau coba metode lain.');
                }

            } else {
                showAlert('error', 'Pendaftaran Gagal', 'Password dan Konfirmasi Password tidak cocok!');
            }
        } else {
            showAlert('error', 'Data Belum Lengkap', 'Mohon isi semua kolom yang tersedia.');
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
            <Text style={styles.formCardTitle}>Daftar</Text>
            
            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>Sudah memiliki akun? </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.switchModeLink}>Masuk</Text>
              </TouchableOpacity>
            </View>

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

            <View style={styles.inputWrapper}>
              <Text style={styles.floatingLabel}>Konfirmasi Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordField} placeholder="Masukan password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} placeholderTextColor="#A9A9A9" />
                <TouchableOpacity><Image source={EYE_ICON} style={styles.eyeIcon} resizeMode="contain" /></TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
              <Text style={styles.submitButtonText}>Daftar</Text>
            </TouchableOpacity>

            <View style={styles.orDividerContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Atau</Text>
              <View style={styles.orLine} />
            </View>

            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
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
  radioGroup: { flexDirection: 'row', marginLeft: 10 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#284B7A', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  radioInnerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#284B7A' },
  radioText: { fontSize: 14, color: '#333' },
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

export default RegisterPage;