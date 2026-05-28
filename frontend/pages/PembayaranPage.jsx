import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Image, Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

const DetailPembayaranPage = ({ sessionData, onBack, onPaymentSuccess }) => {
  // === STATE ===
  const [selectedMethod, setSelectedMethod] = useState(null); // 'virtual account', 'e-wallet', atau 'qr-code'
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // === HANDLER UTAMA ===
  const handlePaymentPress = () => {
    if (!selectedMethod) {
      Alert.alert('Peringatan', 'Mohon pilih metode pembayaran terlebih dahulu.');
      return;
    }
    // Mengirimkan selectedMethod ke App.jsx agar PembayaranPage tahu apa yang harus ditampilkan
    if (onPaymentSuccess) {
      onPaymentSuccess(selectedMethod);
    }
  };

  const getMethodLabel = () => {
    if (selectedMethod === 'virtual account') return 'virtual account';
    if (selectedMethod === 'e-wallet') return 'e-wallet';
    if (selectedMethod === 'qr-code') return 'QR Code';
    return 'Pilih Pembayaran';
  };

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setShowCancelModal(true)}>
          <Text style={styles.backText}>❮ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pembayaran</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ================= INFO MATERI ================= */}
      <View style={styles.materiSection}>
        <Text style={styles.subjectTitle}>{sessionData?.mataPelajaran || 'Matematika'}</Text>
        <Text style={styles.chapterText}>{sessionData?.materi || 'Relasi & Fungsi'}</Text>
        <View style={styles.divider} />
        <Text style={styles.gradeText}>{sessionData?.jenjang || 'SMA - Kelas 12'}</Text>
      </View>

      {/* ================= CARD 1: LOKASI & JADWAL ================= */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardLabelTitle}>Lokasi Belajar</Text>
        <View style={styles.inputStyle}>
          <Text style={styles.inputTextValue}>Kampus</Text>
        </View>

        <View style={[styles.inputStyle, styles.addressRow]}>
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {sessionData?.lokasi || 'Jl. Telekomunikasi No.1, Sukapura.'}
          </Text>
        </View>

        <Text style={[styles.cardLabelTitle, { marginTop: 15 }]}>Jadwal Pemesanan</Text>
        <View style={styles.inputStyle}>
          <Text style={styles.inputTextValue}>{sessionData?.tanggal || '12 Juni 2023'}</Text>
        </View>

        <Text style={[styles.cardLabelTitle, { marginTop: 15 }]}>Durasi sesi</Text>
        <View style={styles.inputStyle}>
          <Text style={styles.inputTextValue}>{sessionData?.waktuSesi || '07:00 - 09:00'}</Text>
        </View>
      </View>

      {/* ================= CARD 2: RINCIAN & METODE ================= */}
      <View style={styles.cardInfo}>
        <View style={styles.methodRow}>
          <Text style={styles.methodTitle}>
            Metode Pembayaran : <Text style={styles.methodSelectedText}>{getMethodLabel()}</Text>
          </Text>
          <TouchableOpacity onPress={() => setShowMethodModal(true)}>
            <Text style={styles.actionTextLink}>{selectedMethod ? 'Ubah' : 'Pilih Pembayaran'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { marginVertical: 12 }]} />

        <Text style={styles.rincianTitle}>Rincian Pembayaran :</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Biaya Pembelajaran</Text>
          <Text style={styles.priceValue}>: Rp 20.000</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Biaya Transportasi Guru</Text>
          <Text style={styles.priceValue}>: Rp 14.000</Text>
        </View>

        <View style={[styles.divider, { marginVertical: 12 }]} />

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>: Rp 34.000</Text>
        </View>
      </View>

      {/* ================= TOMBOL BAYAR ================= */}
      <TouchableOpacity 
        style={[styles.payButton, selectedMethod ? styles.payButtonActive : styles.payButtonDisabled]} 
        onPress={handlePaymentPress}
      >
        <Text style={[styles.payButtonText, selectedMethod ? styles.payButtonTextActive : styles.payButtonTextDisabled]}>
          Lakukan Pembayaran
        </Text>
      </TouchableOpacity>

      {/* ================= MODAL PILIHAN METODE ================= */}
      <Modal transparent visible={showMethodModal} animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMethodModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheetContainer}>
            <View style={styles.notchIndicator} />
            
            <TouchableOpacity style={styles.methodOptionBox} onPress={() => { setSelectedMethod('virtual account'); setShowMethodModal(false); }}>
              <Text style={styles.optionIcon}>🏦</Text>
              <Text style={styles.optionText}>Virtual Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodOptionBox} onPress={() => { setSelectedMethod('e-wallet'); setShowMethodModal(false); }}>
              <Text style={styles.optionIcon}>💼</Text>
              <Text style={styles.optionText}>E-Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.methodOptionBox} onPress={() => { setSelectedMethod('qr-code'); setShowMethodModal(false); }}>
              <Text style={styles.optionIcon}>🔲</Text>
              <Text style={styles.optionText}>QR Code</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ================= MODAL BATALKAN PESANAN ================= */}
      <Modal transparent visible={showCancelModal} animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Batalkan pesanan?</Text>
            <View style={styles.dialogButtonRow}>
              <TouchableOpacity style={[styles.dialogButton, styles.btnYes]} onPress={() => { setShowCancelModal(false); onBack(); }}>
                <Text style={styles.btnTextWhite}>Ya</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dialogButton, styles.btnNo]} onPress={() => setShowCancelModal(false)}>
                <Text style={styles.btnTextWhite}>Tidak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 24, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  backButton: { paddingVertical: 5 },
  backText: { fontSize: 16, color: '#666', fontWeight: '500' },
  headerTitle: { fontSize: 19, fontWeight: 'bold', color: '#333' },
  materiSection: { marginBottom: 20 },
  subjectTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  chapterText: { fontSize: 15, color: '#555', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 10 },
  gradeText: { fontSize: 14, color: '#777', fontWeight: '500' },
  cardInfo: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0', padding: 20, marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardLabelTitle: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  inputStyle: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 8 },
  inputTextValue: { fontSize: 14, color: '#999' },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  pinIcon: { fontSize: 14, marginRight: 8 },
  addressText: { fontSize: 13, color: '#AAA', flex: 1 },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodTitle: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  methodSelectedText: { fontWeight: 'normal' },
  actionTextLink: { fontSize: 14, color: '#2D9CDB', textDecorationLine: 'underline' },
  rincianTitle: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  priceLabel: { fontSize: 13, color: '#555' },
  priceValue: { fontSize: 13, color: '#333', textAlign: 'right', minWidth: 90 },
  totalLabel: { fontSize: 14, fontWeight: 'bold' },
  totalValue: { fontSize: 14, fontWeight: 'bold' },
  payButton: { borderRadius: 25, paddingVertical: 16, alignItems: 'center', position: 'absolute', bottom: 35, left: 24, right: 24 },
  payButtonDisabled: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#000' },
  payButtonActive: { backgroundColor: '#3B7A57' },
  payButtonText: { fontSize: 16, fontWeight: 'bold' },
  payButtonTextDisabled: { color: '#000' },
  payButtonTextActive: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 24, paddingTop: 15, paddingBottom: 40 },
  notchIndicator: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 25 },
  methodOptionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 16, padding: 16, marginBottom: 15 },
  optionIcon: { fontSize: 22, marginRight: 15 },
  optionText: { fontSize: 16, fontWeight: 'bold' },
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dialogBox: { width: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center' },
  dialogTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 25 },
  dialogButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  dialogButton: { flex: 1, paddingVertical: 12, borderRadius: 20, alignItems: 'center', marginHorizontal: 8 },
  btnYes: { backgroundColor: '#E12525' },
  btnNo: { backgroundColor: '#2C4373' },
  btnTextWhite: { color: '#FFF', fontWeight: 'bold' }
});

export default DetailPembayaranPage;