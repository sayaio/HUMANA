import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconBox}>{icon}</View>
        <Text style={styles.menuLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    menuItem: { 
        alignItems: 'center', 
        width: '22%' 
    },
    menuIconBox: {
        width: 65, height: 65, backgroundColor: '#3A7D6B',
        borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    menuLabel: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 11, color: '#333', textAlign: 'center',
    },
});

export default MenuItem;
