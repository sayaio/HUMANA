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
  Dimensions,
} from 'react-native';

import { Eye, EyeOff } from 'lucide-react-native';
import { registerUser } from '../services/registerService';
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

const RegisterPage = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState('Murid');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    onCloseAction: null,
  });

  const LOGO_SOURCE = require('../assets/logo_humana.png');
  const GOOGLE_ICON = {
    uri: 'https://img.icons8.com/color/48/google-logo.png',
  };

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
    if (
      namaLengkap !== '' &&
      email !== '' &&
      password !== '' &&
      confirmPassword !== ''
    ) {
      if (password === confirmPassword) {
        const userData = {
          namaLengkap: namaLengkap,
          email: email,
          password: password,
          role: role,
          username: email.split('@')[0],
        };

        try {
          const result = await registerUser(userData);

          if (result.success) {
            showAlert(
              'success',
              'Sukses!',
              'Akun kamu berhasil dibuat.',
              () => {
                onNavigateToLogin();
              },
            );
          } else {
            showAlert(
              'error',
              'Pendaftaran Gagal',
              result.message || 'Terjadi kesalahan pada server.',
            );
          }
        } catch (error) {
          showAlert(
            'error',
            'Terjadi Kesalahan',
            'Coba cek koneksi internetmu atau coba metode lain.',
          );
        }
      } else {
        showAlert(
          'error',
          'Pendaftaran Gagal',
          'Password dan Konfirmasi Password tidak cocok!',
        );
      }
    } else {
      showAlert(
        'error',
        'Data Belum Lengkap',
        'Mohon isi semua kolom yang tersedia.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Background Geometris Asli */}
      <View style={styles.blueBackgroundTop} />
      <View style={styles.blueBackgroundTriangle} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Section: Logo & Text Humana (Sudah Diperbesar & Diturunkan) */}
        <View style={styles.headerSection}>
          <View style={styles.logoRow}>
            <Image
              source={LOGO_SOURCE}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Humana.</Text>
          </View>
        </View>

        {/* Form Card: Pas di Tengah Tanpa Bisa Scroll */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Daftar</Text>

          <View style={styles.switchModeContainer}>
            <Text style={styles.switchModeText}>Sudah memiliki akun? </Text>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.switchModeLink}>Masuk</Text>
            </TouchableOpacity>
          </View>

          {/* Input Nama Lengkap */}
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.inputField}
              placeholder="someone"
              value={namaLengkap}
              onChangeText={setNamaLengkap}
              placeholderTextColor="#A9A9A9"
            />
          </View>

          {/* Input Daftar Sebagai */}
          <View style={[styles.inputWrapper, { height: height * 0.065, flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={styles.floatingLabel}>Daftar Sebagai</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setRole('Guru')}
              >
                <View style={styles.radioCircle}>
                  {role === 'Guru' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={styles.radioText}>Guru</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setRole('Murid')}
              >
                <View style={styles.radioCircle}>
                  {role === 'Murid' && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={styles.radioText}>Murid</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Email */}
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

          {/* Input Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordField}
                placeholder="Masukan password"
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#A9A9A9"
              />
              <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
                {securePassword ? (
                  <EyeOff color="#D3D3D3" size={22} />
                ) : (
                  <Eye color="#284B7A" size={22} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Konfirmasi Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.floatingLabel}>Konfirmasi Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordField}
                placeholder="Masukan password"
                secureTextEntry={secureConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#A9A9A9"
              />
              <TouchableOpacity onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}>
                {secureConfirmPassword ? (
                  <EyeOff color="#D3D3D3" size={22} />
                ) : (
                  <Eye color="#284B7A" size={22} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Button Submit */}
          <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
            <Text style={styles.submitButtonText}>Daftar</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orDividerContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Atau</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
            <Image source={GOOGLE_ICON} style={styles.googleIconRight} resizeMode="contain" />
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            By continuing I agree with the{' '}
            <Text style={styles.linkText}>Terms & Conditions</Text>,{'\n'}
            <Text style={styles.linkText}>Privacy Policy.</Text>
          </Text>
        </View>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  safeArea: { 
    flex: 1,
    justifyContent: 'space-between',
  },
  blueBackgroundTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: height * 0.44, // Ditambah sedikit ruang ke bawah
    backgroundColor: '#284B7A',
  },
  blueBackgroundTriangle: {
    position: 'absolute',
    top: height * 0.44,    
    borderLeftWidth: width / 2,
    borderRightWidth: width / 2,
    borderTopWidth: 40,    
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#284B7A',
  },
  // Diturunkan dengan menambah paddingTop
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.08, // Diubah dari 0.05 ke 0.08 agar logo lebih turun
    height: height * 0.18,     // Ditambah tingginya agar space logo lebih leluasa
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Diperbesar ukurannya (Sumbu kotak width & height dinaikkan)
  logoImage: { 
    width: 65,  // Diperbesar dari 55 ke 65
    height: 65, // Diperbesar dari 55 ke 65
    tintColor: '#FFFFFF',
  },
  // Diperbesar ukuran font sizenya
  logoText: {
    fontSize: 52, // Diperbesar dari 44 ke 52
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 14,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: width * 0.06, 
    paddingTop: height * 0.025,       
    paddingBottom: height * 0.025,
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    height: height * 0.76, 
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  formCardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -4,
  },
  switchModeText: { fontSize: 13, color: '#888' },
  switchModeLink: { fontSize: 13, color: '#4285F4', fontWeight: 'bold' },
  
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: height * 0.056, 
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -9,
    left: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    zIndex: 1,
  },
  inputField: {
    fontSize: 14,
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
    fontSize: 14,
    color: '#333',
    height: '100%',
    paddingVertical: 0,
  },
  radioGroup: { 
    flexDirection: 'row', 
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  radioOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 30 
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInnerCircle: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#284B7A',
  },
  radioText: { fontSize: 14, color: '#333', fontWeight: '500' },
  
  submitButton: {
    backgroundColor: '#3a7d6b',
    borderRadius: 16,
    height: height * 0.056, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  orText: { marginHorizontal: 15, fontSize: 12, color: '#A9A9A9' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: height * 0.056,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  googleIconRight: { width: 18, height: 18 },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#A9A9A9',
    lineHeight: 15,
  },
  linkText: { textDecorationLine: 'underline' },
});

export default RegisterPage;