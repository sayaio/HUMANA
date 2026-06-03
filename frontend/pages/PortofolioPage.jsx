import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackIconSvg from '../components/BackIconSvg';

const { width } = Dimensions.get('window');

const PortofolioPage = ({ onBack, idGuru }) => {
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [kategori, setKategori] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('12 Juni 2023');
  const [tanggalSelesai, setTanggalSelesai] = useState('12 Juni 2023');
  const [deskripsi, setDeskripsi] = useState('');
  const [urlBukti, setUrlBukti] = useState('');

  const handleSimpan = () => {
    if (!namaKegiatan.trim() || !deskripsi.trim()) {
      Alert.alert('Peringatan', 'Mohon lengkapi Nama Kegiatan dan Deskripsi.');
      return;
    }
    
    // Tempat menaruh integrasi service API simpan portfolio jika sudah ada nanti
    Alert.alert('Sukses', 'Portofolio baru berhasil disimpan!', [
      { text: 'OK', onPress: () => onBack && onBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER NAVIGASI FIGMA */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonTarget} activeOpacity={0.6}>
          <BackIconSvg size={12} color="#333333" />
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Tambah Portofolio</Text>
        <View style={{ width: width * 0.22 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollBodyPadding}
        keyboardShouldPersistTaps="handled"
      >
        {/* INPUT: NAMA KEGIATAN */}
        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Nama Kegiatan atau Sertifikasi</Text>
          <TextInput
            style={styles.outlineInputBox}
            placeholder="Masukkan Nama"
            placeholderTextColor="#C4C4C4"
            value={namaKegiatan}
            onChangeText={setNamaKegiatan}
          />
        </View>

        {/* INPUT: KATEGORI */}
        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Kategori</Text>
          <TouchableOpacity style={styles.dropdownSelectBox} activeOpacity={0.7}>
            <Text style={[styles.dropdownValueText, !kategori && { color: '#C4C4C4' }]}>
              {kategori || 'Pilih Kategori'}
            </Text>
            <Text style={styles.dropdownChevronIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* GRID ROW: TANGGAL MULAI & SELESAI */}
        <View style={styles.metaGridRow}>
          <View style={styles.metaGridCard}>
            <Text style={styles.metaInputLabel}>Tanggal Mulai</Text>
            <Text style={styles.metaLabelTitle}>Tanggal</Text>
            <Text style={styles.metaValueText}>{tanggalMulai}</Text>
          </View>
          <View style={styles.metaGridCard}>
            <Text style={styles.metaInputLabel}>Tanggal Selesai</Text>
            <Text style={styles.metaLabelTitle}>Tanggal</Text>
            <Text style={styles.metaValueText}>{tanggalSelesai}</Text>
          </View>
        </View>

        {/* INPUT: DESKRIPSI (TEXTAREA MULTILINE) */}
        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Deskripsi</Text>
          <TextInput
            style={[styles.outlineInputBox, styles.textareaInputBox]}
            placeholder="Masukkan Deskripsi"
            placeholderTextColor="#C4C4C4"
            multiline={true}
            numberOfLines={4}
            value={deskripsi}
            onChangeText={setDeskripsi}
          />
        </View>

        {/* INPUT: URL BUKTI */}
        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>URL Bukti</Text>
          <TextInput
            style={styles.outlineInputBox}
            placeholder="Masukkan URL"
            placeholderTextColor="#C4C4C4"
            value={urlBukti}
            onChangeText={setUrlBukti}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

      </ScrollView>

      {/* PERSISTENT FIXED FOOTER: TOMBOL HIJAU FIGMA */}
      <View style={styles.persistentFooterContainer}>
        <TouchableOpacity 
          style={styles.primarySubmitButton}
          onPress={handleSimpan}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonLabelText}>Simpan Portofolio</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButtonTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.22,
    height: '100%',
  },
  backButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    marginLeft: 6,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  scrollBodyPadding: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  fieldBlockWrapper: {
    marginBottom: 20,
  },
  fieldSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  outlineInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333333',
  },
  textareaInputBox: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  dropdownSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
  },
  dropdownValueText: {
    fontSize: 14,
    color: '#333333',
  },
  dropdownChevronIcon: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  metaGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaGridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaInputLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
  },
  metaLabelTitle: {
    fontSize: 11,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  metaValueText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  persistentFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  primarySubmitButton: {
    backgroundColor: '#387C65',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonLabelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default PortofolioPage;