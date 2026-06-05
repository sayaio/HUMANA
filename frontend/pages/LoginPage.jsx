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
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginUser,
  checkEmail,
  loginUserGoogle,
} from '../services/authService';
import CustomAlert from '../components/CustomAlert';
import { Eye, EyeOff } from 'lucide-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const LoginPage = ({
  onLoginSuccess,
  onNavigateToRegister,
  onForgotPassword,
}) => {
  // Mengambil dimensi layar perangkat secara real-time
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // UBAH: Set default menjadi true agar otomatis menyimpan sesi login
  const [rememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    onCloseAction: null,
  });

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '775122124755-8hfq1podstfpjq4bra4f45ebtcd0jdol.apps.googleusercontent.com',
    });
  }, []);

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

        // Fungsi ini akan selalu berjalan karena rememberMe bernilai true
        if (rememberMe) {
          const sessionData = {
            userData: userData,
            email: email,
          };
          await AsyncStorage.setItem(
            'user_session',
            JSON.stringify(sessionData),
          );
          console.log(
            'Sesi login berhasil disimpan ke user_session secara otomatis!',
          );
        }

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

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data.idToken,
      );
      const firebaseResult = await auth().signInWithCredential(
        googleCredential,
      );

      const email = firebaseResult.user.email;

      const result = await loginUserGoogle(email);

      if (result.success) {
        const userData = result.profile || {};
        await AsyncStorage.setItem(
          'user_session',
          JSON.stringify({ userData, email }),
        );
        onLoginSuccess(userData, email);
      } else {
        await auth().signOut();
        await GoogleSignin.signOut();
        showAlert(
          'error',
          'Akun Tidak Ditemukan',
          result.message ||
            'Email ini belum terdaftar. Silakan daftar terlebih dahulu.',
        );
      }
    } catch (error) {
      showAlert('error', 'Google Login Gagal', error.message || 'Coba lagi.');
    }
  };

  const dynamicBackgroundHeight = height * 0.55;
  const dynamicLogoSize = width * 0.22;

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
                { fontSize: width * 0.065, lineHeight: width * 0.07 },
              ]}
            >
              Humanity in action,{'\n'}Learning in motion.
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
              <Text style={styles.floatingLabel}>Email atau Username </Text>
              <TextInput
                style={styles.inputField}
                placeholder="someone@domain.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="default"
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
                    <Eye size={22} color="#284B7A" />
                  ) : (
                    <EyeOff size={22} color="#D3D3D3" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me diubah menjadi row Lupa Password saja */}
            <View style={styles.rememberForgotRow}>
              <View />
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
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
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

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  blueBackgroundTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#284B7A',
  },
  blueBackgroundTriangle: {
    position: 'absolute',
    borderLeftWidth: width / 2,
    borderRightWidth: width / 2,
    borderTopWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#284B7A',
  },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  headerSection: {
    alignItems: 'center',
    paddingTop: height * 0.06,
    paddingBottom: 20,
  },
  logoWrapper: { marginBottom: 12 },
  titleText: {
    fontFamily: 'SF-Pro-Display-Bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.04,
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  formCardTitle: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: 30,
    color: '#333',
    textAlign: 'center',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchModeText: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: 13,
    color: '#888',
  },
  switchModeLink: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: 13,
    color: '#4285F4',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: height * 0.065,
    marginBottom: height * 0.02,
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
  inputField: {
    fontFamily: 'SF-Pro-Display-Regular',
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  passwordContainer: {
    fontFamily: 'SF-Pro-Display-Regular',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  passwordField: {
    fontFamily: 'SF-Pro-Display-Regular',
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  // Catatan: Style checkbox yang lama sengaja tidak dihapus agar file stylesheet Anda tidak error jika masih mereferensikannya di file lain.
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
  forgotPasswordText: {
    fontSize: 13,
    color: '#4285F4',
    fontFamily: 'SF-Pro-Display-Bold',
  },
  submitButton: {
    backgroundColor: '#3a7d6b',
    borderRadius: 25,
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  orLine: {
    fontFamily: 'SF-Pro-Display-Regular',
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
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
    fontFamily: 'SF-Pro-Display-Bold',
    color: '#333',
    fontSize: 14,
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
