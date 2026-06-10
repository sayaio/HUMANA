import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DataRow = ({ label, value }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue} numberOfLines={2}>
      {value || '-'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  dataValue: {
    flex: 2,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default DataRow;
