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
  options = {},
}) => {
  const iconSource =
    type === 'success'
      ? require('../assets/sukses.png')
      : require('../assets/gagal.png');

  const hideIcon = options.hideIcon || false;
  const swapButtons = options.swapButtons || false;

  const btnKiriProps = swapButtons
    ? { text: 'Tidak', style: styles.noButtonSwap, onPress: onClose }
    : { text: 'Ya', style: styles.yesButton, onPress: onConfirm };
  const btnKananProps = swapButtons
    ? { text: 'Ya', style: styles.yesButtonSwap, onPress: onConfirm }
    : { text: 'Tidak', style: styles.noButton, onPress: onClose };

  return (
    <DimmedModal
      visible={visible}
      onRequestClose={onClose}
      placement="center"
    >
      <View style={styles.alertBox}>
        {!hideIcon && <Image source={iconSource} style={styles.icon} />}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {isConfirmation && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, btnKiriProps.style]}
              onPress={btnKiriProps.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{btnKiriProps.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, btnKananProps.style]}
              onPress={btnKananProps.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{btnKananProps.text}</Text>
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
    borderRadius: 25,
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
  noButtonSwap: {
    backgroundColor: '#E12525',
  },
  yesButtonSwap: {
    backgroundColor: '#284B7A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
