import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  StatusBar, ScrollView, TextInput, ActivityIndicator 
} from 'react-native';

import { updateBasicProfile } from '../services/edtProfileService';
import CustomAlert from '../components/CustomAlert'; // IMPORT CUSTOM ALERT

const EditBasicProfilePage = ({ profileData, onSave, onCancel }) => {
  const [username, setUsername] = useState(profileData.username);
  const [phone, setPhone] = useState(profileData.phone);
  const [gender, setGender] = useState(profileData.gender);
  const [domicile, setDomicile] = useState(profileData.domicile);
  
  const [isLoading, setIsLoading] = useState(false);

  // STATE UNTUK CUSTOM ALERT
  const [alertConfig, setAlertConfig] = useState({
    visible: false, type: 'success', title: '', message: '', onCloseAction: null
  });

  const showAlert = (type, title, message, onCloseAction = null) => {
    setAlertConfig({ visible: true, type, title, message, onCloseAction });
  };

  const handleCloseAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (alertConfig.onCloseAction) {
      alertConfig.onCloseAction();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        id: profileData.id,
        id_user: profileData.id,
        username: username,
        phone: phone,
        no_telepon: phone,
        gender: gender,
        jenis_kelamin: gender,
        domicile: domicile,
        domisili: domicile
      };

      const result = await updateBasicProfile(payload);

      if (result.success === true || result.status === 200) {
        // Tampilkan Custom Alert Sukses, lalu simpan & kembali ke profil saat ditutup
        showAlert('success', 'Sukses!', 'Profil dasar berhasil diperbarui.', () => {
          onSave({ ...profileData, username, phone, gender, domicile });
        });
      } else {
        // Tampilkan Custom Alert Gagal
        showAlert('error', 'Gagal Menyimpan', result.message || "Pastikan data sudah benar.");
      }
    } catch (error) {
      console.log("Error Update Basic Profile:", error);
      showAlert('error', 'Error Jaringan', "Gagal terhubung ke server. Periksa koneksi internetmu.");
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={styles.input} 
        value={value} 
        onChangeText={onChangeText}
        placeholderTextColor="#A9A9A9"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn} disabled={isLoading}>
          <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Basic Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <InputField label="Username" value={username} onChangeText={setUsername} />
        <InputField label="No. Telepon" value={phone} onChangeText={setPhone} />
        <InputField label="Jenis Kelamin" value={gender} onChangeText={setGender} />
        <InputField label="Domisili" value={domicile} onChangeText={setDomicile} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isLoading}>
          <Text style={styles.cancelBtnText}>Batalkan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Konfirmasi Perubahan</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* PANGGIL KOMPONEN CUSTOM ALERT DI SINI */}
      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleCloseAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { padding: 10, marginLeft: -10 },
  backIcon: { fontSize: 20, color: '#000', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  
  content: { padding: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, height: 50, paddingHorizontal: 15, fontSize: 14, color: '#000', fontWeight: '600' },
  
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFF' },
  cancelBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cancelBtnText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  saveBtn: { flex: 1.2, height: 50, borderRadius: 25, backgroundColor: '#387C65', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});

export default EditBasicProfilePage;