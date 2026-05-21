import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DetailPembayaranPage = ({ sessionData, onBack, onPaymentSuccess }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detail Pembayaran</Text>
      <TouchableOpacity onPress={onBack}><Text>Kembali</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
});

export default DetailPembayaranPage;