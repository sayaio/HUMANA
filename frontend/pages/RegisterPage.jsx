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
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';
import { registerUser } from '../services/registerService';
import CustomAlert from '../components/CustomAlert';
import DimmedModal from '../components/DimmedModal';
import CustomButton from '../components/CustomButton';
import { centerModalCardBase, MODAL_CARD_WIDTH } from '../components/modalTheme';

const { width, height } = Dimensions.get('window');

const RegisterPage = ({ onRegisterSuccess, onNavigateToLogin }) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [role, setRole] = useState('Murid');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalStep, setModalStep] = useState(1);
  const [googlePassword, setGooglePassword] = useState('');
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState('');
  const [secureGooglePassword, setSecureGooglePassword] = useState(true);
  const [secureGoogleConfirmPassword, setSecureGoogleConfirmPassword] =
    useState(true);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    onCloseAction: null,
  });
  const [googleUserTemp, setGoogleUserTemp] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleRole, setGoogleRole] = useState('Murid');
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
    if (!namaLengkap || !email || !password || !confirmPassword) {
      showAlert('error', 'Data Belum Lengkap', 'Mohon isi semua kolom yang tersedia.');
      return;
    }

    const nameRegex = /^[A-Za-z\s.,]{5,}$/;
    if (!nameRegex.test(namaLengkap.trim())) {
      showAlert('error', 'Validasi Gagal', 'Nama lengkap minimal 5 karakter tanpa karakter acak (hanya huruf, titik, koma, spasi).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('error', 'Format Email Salah', 'Alamat email harus menggunakan format yang benar (mengandung "@" dan domain seperti .com).');
      return;
    }

    if (password.trim().length < 5) {
      showAlert('error', 'Validasi Gagal', 'Password minimal 5 karakter.');
      return;
    }

    if (confirmPassword.trim().length < 5) {
      showAlert('error', 'Validasi Gagal', 'Konfirmasi password minimal 5 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('error', 'Pendaftaran Gagal', 'Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    const userData = {
      namaLengkap: namaLengkap.trim(),
      email: email.trim(),
      password: password,
      role: role,
      username: email.trim().split('@')[0],
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
  };

  const handleGoogleRegister = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data.idToken,
      );
      const firebaseResult = await auth().signInWithCredential(
        googleCredential,
      );

      setGoogleUserTemp({
        name: firebaseResult.user.displayName,
        email: firebaseResult.user.email,
        photo: firebaseResult.user.photoURL,
      });
      setShowRoleModal(true);
    } catch (error) {
      showAlert('error', 'Google Gagal', error.message || 'Coba lagi.');
    }
  };

  // Hanya pindah ke step 2
  const handleConfirmGoogleRole = () => {
    setModalStep(2);
  };

  const closeGoogleRoleModal = async () => {
    setShowRoleModal(false);
    setModalStep(1);
    setGoogleUserTemp(null);
    setGooglePassword('');
    setGoogleConfirmPassword('');
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
    } catch (_) {}
  };

  const handleConfirmGooglePassword = async () => {
    if (!googlePassword || !googleConfirmPassword) {
      showAlert('error', 'Data Kosong', 'Mohon isi semua kolom password.');
      return;
    }
    if (googlePassword !== googleConfirmPassword) {
      showAlert(
        'error',
        'Password Tidak Cocok',
        'Password dan konfirmasi tidak sama.',
      );
      return;
    }
    if (googlePassword.length < 6) {
      showAlert('error', 'Password Terlalu Pendek', 'Minimal 6 karakter.');
      return;
    }

    try {
      const userData = {
        namaLengkap: googleUserTemp.name,
        email: googleUserTemp.email,
        password: googlePassword,
        role: googleRole,
        username: googleUserTemp.email.split('@')[0],
      };

      const result = await registerUser(userData);

      if (result.success) {
        setShowRoleModal(false);
        setModalStep(1);
        await AsyncStorage.setItem(
          'user_session',
          JSON.stringify({
            userData: googleUserTemp,
            email: googleUserTemp.email,
          }),
        );
        onRegisterSuccess(googleUserTemp, googleUserTemp.email);
      } else {
        setShowRoleModal(false);
        setModalStep(1);
        showAlert(
          'error',
          'Pendaftaran Gagal',
          result.message || 'Terjadi kesalahan.',
        );
      }
    } catch (error) {
      showAlert('error', 'Terjadi Kesalahan', 'Coba lagi.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.blueBackgroundTop} />
      <View style={styles.blueBackgroundTriangle} />

      <SafeAreaView style={styles.safeArea}>
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
            <TextInput
              style={styles.inputField}
              placeholder="someone"
              value={namaLengkap}
              onChangeText={setNamaLengkap}
              placeholderTextColor="#A9A9A9"
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              {
                height: height * 0.065,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
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
                secureTextEntry={securePassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#A9A9A9"
              />
              <TouchableOpacity
                onPress={() => setSecurePassword(!securePassword)}
              >
                {securePassword ? (
                  <EyeOff color="#D3D3D3" size={22} />
                ) : (
                  <Eye color="#284B7A" size={22} />
                )}
              </TouchableOpacity>
            </View>
          </View>

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
              <TouchableOpacity
                onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
              >
                {secureConfirmPassword ? (
                  <EyeOff color="#D3D3D3" size={22} />
                ) : (
                  <Eye color="#284B7A" size={22} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, { marginTop: 10 }]} 
            onPress={handleRegister}
          >
            <Text style={styles.submitButtonText}>Daftar</Text>
          </TouchableOpacity>

          <View style={styles.orDividerContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Atau</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleRegister}
          >
            <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
            <Image
              source={GOOGLE_ICON}
              style={styles.googleIconRight}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By continuing I agree with the{' '}
            <Text style={styles.linkText}>Terms & Conditions</Text>,{'\n'}
            <Text style={styles.linkText}>Privacy Policy.</Text>
          </Text>
        </View>

        {/* Modal Pilih Role & Buat Password */}
        <DimmedModal
          visible={showRoleModal}
          onRequestClose={closeGoogleRoleModal}
          placement="center"
        >
            <View style={styles.modalCard}>

              {/* STEP 1: Pilih Role */}
              {modalStep === 1 && (
                <>
                  <Text style={styles.modalTitle}>Daftar Sebagai?</Text>
                  <Text style={styles.modalSubtitle}>
                    Pilih role untuk akun Google kamu
                  </Text>
                  <View style={styles.modalRadioGroup}>
                    <TouchableOpacity
                      style={styles.modalRadioOption}
                      onPress={() => setGoogleRole('Guru')}
                    >
                      <View style={styles.radioCircle}>
                        {googleRole === 'Guru' && (
                          <View style={styles.radioInnerCircle} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Guru</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalRadioOption}
                      onPress={() => setGoogleRole('Murid')}
                    >
                      <View style={styles.radioCircle}>
                        {googleRole === 'Murid' && (
                          <View style={styles.radioInnerCircle} />
                        )}
                      </View>
                      <Text style={styles.radioText}>Murid</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleConfirmGoogleRole}
                  >
                    <Text style={styles.submitButtonText}>Lanjut</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={closeGoogleRoleModal}
                  >
                    <Text style={styles.modalCancelText}>Batal</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* STEP 2: Buat Password */}
              {modalStep === 2 && (
                <>
                  <Text style={styles.modalTitle}>Buat Password</Text>
                  <Text style={styles.modalSubtitle}>
                    Buat password untuk login manual nanti
                  </Text>

                  <View style={styles.modalInputWrapper}>
                    <Text style={styles.floatingLabel}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordField}
                        placeholder="Minimal 6 karakter"
                        secureTextEntry={secureGooglePassword}
                        value={googlePassword}
                        onChangeText={setGooglePassword}
                        placeholderTextColor="#A9A9A9"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setSecureGooglePassword(!secureGooglePassword)
                        }
                      >
                        {secureGooglePassword ? (
                          <EyeOff color="#D3D3D3" size={20} />
                        ) : (
                          <Eye color="#284B7A" size={20} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.modalInputWrapper}>
                    <Text style={styles.floatingLabel}>Konfirmasi Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordField}
                        placeholder="Ulangi password"
                        secureTextEntry={secureGoogleConfirmPassword}
                        value={googleConfirmPassword}
                        onChangeText={setGoogleConfirmPassword}
                        placeholderTextColor="#A9A9A9"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setSecureGoogleConfirmPassword(
                            !secureGoogleConfirmPassword,
                          )
                        }
                      >
                        {secureGoogleConfirmPassword ? (
                          <EyeOff color="#D3D3D3" size={20} />
                        ) : (
                          <Eye color="#284B7A" size={20} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleConfirmGooglePassword}
                  >
                    <Text style={styles.submitButtonText}>Daftar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setModalStep(1)}
                  >
                    <Text style={styles.modalCancelText}>Kembali</Text>
                  </TouchableOpacity>
                </>
              )}

            </View>
        </DimmedModal>
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
    height: height * 0.44,
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
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.08,
    height: height * 0.18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 65,
    height: 65,
    tintColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 52,
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
    marginRight: 30,
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
    borderRadius: 25,
    height: height * 0.06,
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
  modalCard: {
    ...centerModalCardBase,
    width: MODAL_CARD_WIDTH,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalRadioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 24,
    width: '100%',
  },
  modalRadioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInputWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    width: '100%',
    marginBottom: 12,
    position: 'relative',
  },
  modalConfirmButton: {
    backgroundColor: '#3a7d6b',
    borderRadius: 25,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 8,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
});

export default RegisterPage;