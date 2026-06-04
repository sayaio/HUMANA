import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Padding kiri/kanan area konten modal (selaras sheet materi) */
export const MODAL_HORIZONTAL_PADDING = 24;

/** Kartu popup tengah — alert, konfirmasi, form pendek */
export const MODAL_CARD_MAX_WIDTH = 360;
export const MODAL_CARD_WIDTH = Math.min(
  SCREEN_WIDTH * 0.85,
  MODAL_CARD_MAX_WIDTH,
);

/** Kartu lebih lebar — kalender, detail sesi */
export const MODAL_WIDE_MAX_WIDTH = 400;
export const MODAL_WIDE_WIDTH = Math.min(
  SCREEN_WIDTH * 0.88,
  MODAL_WIDE_MAX_WIDTH,
);

/** Gaya dasar kartu putih di tengah layar */
export const centerModalCardBase = {
  width: MODAL_CARD_WIDTH,
  backgroundColor: '#FFF',
  borderRadius: 24,
  alignSelf: 'center',
};

export const wideModalCardBase = {
  width: MODAL_WIDE_WIDTH,
  backgroundColor: '#FFF',
  borderRadius: 20,
  alignSelf: 'center',
};
