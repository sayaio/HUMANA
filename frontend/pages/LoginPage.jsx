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
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { loginUser } from '../services/authService';
import CustomAlert from '../components/CustomAlert';
import { Eye, EyeOff } from 'lucide-react-native';

const LoginPage = ({
  onLoginSuccess,
  onNavigateToRegister,
  onForgotPassword,
}) => {
  // Mengambil dimensi layar perangkat secara real-time
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    onCloseAction: null,
  });

  const LOGO_SOURCE = require('../assets/logo_humana.png');
  // Disarankan mengganti EYE_ICON dengan icon mata asli jika sudah ada di assets

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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert(
        'error',
        'Data Kosong',
        'Email dan Password tidak boleh kosong.',
      );
      return;
    }

    try {
      const result = await loginUser(email, password);

      if (result.success === true || result.token || result.status === 200) {
        const userData =
          result.profile || result.data || result.user || result || {};
        onLoginSuccess(userData, email);
      } else {
        showAlert(
          'error',
          'Login Gagal',
          result.message || 'Cek kembali email dan password-mu.',
        );
      }
    } catch (err) {
      showAlert(
        'error',
        'Terjadi Kesalahan',
        'Coba cek koneksi internetmu atau coba metode lain.',
      );
    }
  };

<<<<<<< HEAD
  // Kalkulasi dimensi dinamis berbasis ukuran layar HP
  const dynamicBackgroundHeight = height * 0.55; // Mengurangi tinggi background biru agar aman di HP pendek
  const dynamicLogoSize = width * 0.22; // Logo berukuran 22% dari lebar layar
=======
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            showAlert('error', 'Data Kosong', 'Email dan Password tidak boleh kosong.');
            return;
        }
        
        try {
            const result = await loginUser(email, password); 
            console.log("Hasil Login:", email);
            console.log("Hasil Login:", password);
            
            if (result.success === true || result.token || result.status === 200) {
                const userData = result.profile || result.data || result.user || result || {};
                onLoginSuccess(userData, email); 
            } else {
                showAlert('error', 'Login Gagal', result.message || 'Cek kembali email dan password-mu atau coba metode lain.');
            }
        } catch (err) {
            showAlert('error', 'Terjadi Kesalahan', 'Coba cek koneksi internetmu atau coba metode lain.');
        }
    };
>>>>>>> 0afc7a3e0c2dc9bce710a47a17dec894ad24e071

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Background dekoratif diposisikan secara dinamis */}
      <View
        style={[styles.blueBackgroundTop, { height: dynamicBackgroundHeight }]}
      />
      <View
        style={[
          styles.blueBackgroundTriangle,
          {
            top: dynamicBackgroundHeight,
            borderLeftWidth: width / 2,
            borderRightWidth: width / 2,
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <View style={[styles.headerSection, { paddingTop: height * 0.06 }]}>
            <View style={styles.logoWrapper}>
              <Image
                source={LOGO_SOURCE}
                style={{ width: dynamicLogoSize, height: dynamicLogoSize }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                styles.titleText,
                { fontSize: width * 0.055, lineHeight: width * 0.075 },
              ]}
            >
              Humanity in action,{'\n'}Learning in motion
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { marginTop: height * 0.02 }]}>
            <Text style={styles.formCardTitle}>Masuk</Text>

            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>Belum memiliki akun? </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.switchModeLink}>Daftar</Text>
              </TouchableOpacity>
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
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#A9A9A9"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                   
                    <Eye size={22} color="#D3D3D3" />
                  ) : (
                     <EyeOff size={22} color="#284B7A" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Lupa Password */}
            <View style={styles.rememberForgotRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxActive]}
                >
                  {rememberMe && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.forgotPasswordText}>Lupa password ?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitButtonText}>Masuk</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.orDividerContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Atau</Text>
              <View style={styles.orLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
              <Image
                source={GOOGLE_ICON}
                style={styles.googleIconRight}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Footer Rules */}
            <Text style={styles.footerText}>
              By continuing I agree with the{' '}
              <Text style={styles.linkText}>Terms & Conditions</Text>,{'\n'}
              <Text style={styles.linkText}>Privacy Policy.</Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  blueBackgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#284B7A',
  },
  blueBackgroundTriangle: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 45,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#284B7A',
  },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  logoWrapper: { marginBottom: 12 },
  titleText: {
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formCardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchModeText: { fontSize: 13, color: '#888' },
  switchModeLink: { fontSize: 13, color: '#4285F4', fontWeight: 'bold' },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 52,
    marginBottom: 20,
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
  },
  floatingLabel: {
    position: 'absolute',
    top: -9,
    left: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
    zIndex: 1,
  },
  inputField: { fontSize: 14, color: '#333', height: '100%' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  passwordField: { flex: 1, fontSize: 14, color: '#333', height: '100%' },
  eyeIcon: { width: 22, height: 22, tintColor: '#D3D3D3' },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#A9A9A9',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxActive: { backgroundColor: '#284B7A', borderColor: '#284B7A' },
  checkboxCheck: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: -2,
  },
  checkboxText: { fontSize: 13, color: '#666' },
  forgotPasswordText: { fontSize: 13, color: '#4285F4', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#B5CB68',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  orLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  orText: { marginHorizontal: 12, fontSize: 12, color: '#A9A9A9' },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 50,
    marginBottom: 15,
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
    fontSize: 11,
    color: '#A9A9A9',
    lineHeight: 16,
  },
  linkText: { textDecorationLine: 'underline' },
});

export default LoginPage;
