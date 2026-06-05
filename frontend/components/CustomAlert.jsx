import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import DimmedModal from './DimmedModal';
import { MODAL_CARD_WIDTH, centerModalCardBase } from './modalTheme';

const CustomAlert = ({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  isConfirmation,
}) => {
  const iconSource =
    type === 'success'
      ? require('../assets/sukses.png')
      : require('../assets/gagal.png');

  return (
    <DimmedModal
      visible={visible}
      onRequestClose={onClose}
      placement="center"
    >
      <View style={styles.alertBox}>
        <Image source={iconSource} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {isConfirmation && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Ya</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.noButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Tidak</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </DimmedModal>
  );
};

const styles = StyleSheet.create({
  alertBox: {
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
  yesButton: {
    backgroundColor: '#E12525',
  },
  noButton: {
    backgroundColor: '#284B7A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
