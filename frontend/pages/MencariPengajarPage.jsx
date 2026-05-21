import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MencariPengajarPage = ({ sessionData, onCancel, onMatchSuccess }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mencari Pengajar...</Text>
      <TouchableOpacity onPress={onCancel}><Text>Batal</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
});

export default MencariPengajarPage;