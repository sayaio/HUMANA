import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import BackIconSvg from './BackIconSvg';

const VARIANT_COLORS = {
  light: '#000000',
  dark: '#FFFFFF',
};

const BackButton = ({
  onPress,
  label = 'Kembali',
  variant = 'light',
  color,
  iconSize = 10,
  style,
  textStyle,
  activeOpacity = 0.7,
  disabled = false,
}) => {
  const resolvedColor = color ?? VARIANT_COLORS[variant] ?? VARIANT_COLORS.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.backBtn, style]}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      <BackIconSvg size={iconSize} color={resolvedColor} />
      <Text style={[styles.backText, { color: resolvedColor }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 15,
    marginLeft: 6,
    fontFamily: 'SF-Pro-Display-Bold',
  },
});

export default BackButton;
