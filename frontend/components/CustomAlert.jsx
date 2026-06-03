import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Image } from 'react-native';

const CustomAlert = ({ visible, type, title, message, onClose, onConfirm, isConfirmation }) => {
  // Menentukan gambar berdasarkan tipe alert[cite: 9]
  const iconSource = type === 'success' 
    ? require('../assets/sukses.png') 
    : require('../assets/gagal.png');

  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* Overlay abu-abu transparan, jika di-klik akan menutup popup[cite: 9] */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        
        {/* Kotak Putih Popup[cite: 9] */}
        <TouchableOpacity activeOpacity={1} style={styles.alertBox}>
          <Image source={iconSource} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Logika Tombol: Hanya muncul jika mode konfirmasi (Ya/Tidak)[cite: 9] */}
          {isConfirmation && (
            <View style={styles.buttonContainer}>
              {/* Tombol YA (Warna Merah) - Sekarang di KIRI[cite: 9] */}
              <TouchableOpacity 
                style={[styles.button, styles.yesButton]} 
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Ya</Text>
              </TouchableOpacity>

              {/* Tombol TIDAK (Warna Hijau) - Sekarang di KANAN[cite: 9] */}
              <TouchableOpacity 
                style={[styles.button, styles.noButton]} 
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Tidak</Text>
              </TouchableOpacity>
            </View>
          )}
          
        </TouchableOpacity>

      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  // Tombol YA sekarang Merah[cite: 9]
  yesButton: {
    backgroundColor: '#E12525', 
  },
  // Tombol TIDAK sekarang Hijau[cite: 9]
  noButton: {
    backgroundColor: '#3A7D6B', 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default CustomAlert;