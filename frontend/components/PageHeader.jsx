import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from './BackButton';

const SIDE_SLOT_MIN_WIDTH = 80;

const PageHeader = ({
  title,
  onBack,
  backLabel = 'Kembali',
  showBack = true,
  variant = 'light',
  rightAction = null,
  leftContent = null,
  borderBottom,
  style,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  const isDark = variant === 'dark';

  const colors = {
    bg: isDark ? '#284B7A' : '#FFFFFF',
    title: isDark ? '#FFFFFF' : '#000000',
  };

  const showBorder = borderBottom ?? !isDark;
  const topPadding = insets.top + 12;
  const bottomPadding = 15;

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          backgroundColor: colors.bg,
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: isDark ? 'transparent' : '#F0F0F0',
        },
        style,
      ]}
    >
      <View style={[styles.sideSlot, styles.leftSlot]}>
        {leftContent ??
          (showBack && onBack ? (
            <BackButton onPress={onBack} label={backLabel} variant={variant} />
          ) : null)}
      </View>

      <View style={styles.centerSlot}>
        <Text
          style={[styles.title, { color: colors.title }, titleStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>

      <View style={[styles.sideSlot, styles.rightSlot]}>{rightAction}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  sideSlot: {
    minWidth: SIDE_SLOT_MIN_WIDTH,
    maxWidth: 110,
    flexShrink: 0,
  },
  leftSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});

export default PageHeader;
