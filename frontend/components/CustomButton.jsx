import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const CustomButton = ({ 
    title, 
    onPress, 
    variant = 'primary', // 'primary' | 'outline' | 'danger'
    style, 
    textStyle, 
    disabled = false,
    loading = false
}) => {
    let buttonStyle = styles.primaryBtn;
    let titleStyle = styles.primaryText;
    let activeOpacity = 0.8;

    if (variant === 'outline') {
        buttonStyle = styles.outlineBtn;
        titleStyle = styles.outlineText;
    } else if (variant === 'danger') {
        buttonStyle = styles.dangerBtn;
        titleStyle = styles.dangerText;
    }

    return (
        <TouchableOpacity 
            style={[buttonStyle, disabled && styles.disabledBtn, style]} 
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={activeOpacity}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'outline' ? '#284B7A' : '#FFF'} />
            ) : (
                <Text style={[titleStyle, disabled && styles.disabledText, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    primaryBtn: {
        backgroundColor: '#284B7A', height: 42,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    },
    primaryText: { fontFamily: 'SF-Pro-Display-Bold', color: '#FFF', fontSize: 13 },
    outlineBtn: {
        backgroundColor: '#FFF', height: 42,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E0E5ED',
    },
    outlineText: { fontFamily: 'SF-Pro-Display-Bold', color: '#284B7A', fontSize: 13 },
    dangerBtn: {
        backgroundColor: '#FFEEEE', height: 42,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    },
    dangerText: { fontFamily: 'SF-Pro-Display-Bold', color: '#E53935', fontSize: 13 },
    disabledBtn: {
        backgroundColor: '#E0E5ED',
        borderColor: '#E0E5ED',
    },
    disabledText: {
        color: '#A9A9A9'
    }
});

export default CustomButton;
