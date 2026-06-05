import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import DimmedModal from './DimmedModal';
import { MODAL_CARD_WIDTH, centerModalCardBase } from './modalTheme';

/**
 * Alert informatif tanpa tombol — tutup dengan tap area gelap (DimmedModal).
 */
const InfoModal = ({ visible, title, message, type = 'gagal', onClose }) => {
  const iconSource =
    type === 'success'
      ? require('../assets/sukses.png')
      : require('../assets/gagal.png');

  return (
    <DimmedModal visible={visible} onRequestClose={onClose} placement="center">
      <View style={styles.card}>
        <Image source={iconSource} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </DimmedModal>
  );
};

const styles = StyleSheet.create({
  card: {
    ...centerModalCardBase,
    width: MODAL_CARD_WIDTH,
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
  },
});

export default InfoModal;
