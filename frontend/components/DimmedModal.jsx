import React from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import {
  MODAL_CARD_WIDTH,
  MODAL_HORIZONTAL_PADDING,
  MODAL_WIDE_WIDTH,
} from './modalTheme';

/** Warna overlay standar — sama HomePage / PageGuru bottom sheet materi */
export const MODAL_OVERLAY_COLOR = 'rgba(0,0,0,0.45)';

/**
 * Modal fullscreen dengan dimming seamless (status bar ikut tertutup).
 * Tap area gelap di luar konten memanggil onRequestClose.
 * @param {'center'|'bottom'} placement
 * @param {'default'|'wide'} size - lebar kartu tengah (wide untuk kalender/detail)
 */
const DimmedModal = ({
  visible,
  onRequestClose,
  children,
  animationType = 'fade',
  dismissOnBackdropPress = true,
  placement = 'center',
  size = 'default',
  overlayStyle,
  contentContainerStyle,
}) => {
  const placementStyle =
    placement === 'bottom' ? styles.contentBottom : styles.contentCenter;

  const innerSizeStyle =
    placement === 'bottom'
      ? styles.innerBottom
      : size === 'wide'
        ? styles.innerWide
        : styles.innerDefault;

  const canDismissBackdrop =
    dismissOnBackdropPress && typeof onRequestClose === 'function';

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onRequestClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <TouchableWithoutFeedback
        onPress={canDismissBackdrop ? onRequestClose : undefined}
        disabled={!canDismissBackdrop}
      >
        <View style={[styles.overlay, placementStyle, overlayStyle]}>
          <TouchableWithoutFeedback>
            <View style={[innerSizeStyle, contentContainerStyle]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MODAL_HORIZONTAL_PADDING,
  },
  contentBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  innerDefault: {
    width: MODAL_CARD_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
  },
  innerWide: {
    width: MODAL_WIDE_WIDTH,
    alignSelf: 'center',
    alignItems: 'center',
  },
  innerBottom: {
    width: '100%',
    alignSelf: 'stretch',
  },
});

export default DimmedModal;
