import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Image } from 'react-native';

const CustomAlert = ({ visible, type, title, message, onClose }) => {
  // Menentukan gambar berdasarkan tipe alert
  const iconSource = type === 'success' 
    ? require('../assets/sukses.png') 
    : require('../assets/gagal.png');

  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* Overlay abu-abu transparan, jika di-klik akan menutup popup */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        
        {/* Kotak Putih Popup (activeOpacity 1 agar klik di dalam kotak tidak menutup popup) */}
        <TouchableOpacity activeOpacity={1} style={styles.alertBox}>
          <Image source={iconSource} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </TouchableOpacity>

      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Latar belakang semi transparan
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '75%', // Lebar popup
    backgroundColor: '#FFF',
    borderRadius: 24, // Sudut melengkung seperti di Figma
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
  }
});

export default CustomAlert;