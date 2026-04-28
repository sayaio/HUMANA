import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput } from 'react-native';

const EditAcademicProfilePage = ({ profileData, onSave, onCancel }) => {
  const [education, setEducation] = useState(profileData.education);
  const [major, setMajor] = useState(profileData.major);

  const handleSave = () => {
    onSave({ ...profileData, education, major });
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
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}><Text style={styles.backIcon}>{'❮'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Academic Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <InputField label="Jenjang Pendidikan" value={education} onChangeText={setEducation} />
        {/* Typo di Figma "No. Telepon" diganti menjadi "Kelas - Jurusan" agar sinkron */}
        <InputField label="Kelas - Jurusan" value={major} onChangeText={setMajor} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Batalkan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Konfirmasi Perubahan</Text>
        </TouchableOpacity>
      </View>
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

export default EditAcademicProfilePage;