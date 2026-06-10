import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

const SubjectItem = ({ subject, icon, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.subjectItemContainer}
            onPress={onPress}
        >
            <View style={styles.subjectIconBox}>
                <Image source={icon} style={styles.subjectIconImage} resizeMode="contain" />
            </View>
            <Text style={styles.subjectItemText}>{subject.nama_mapel}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    subjectItemContainer: { width: '25%', alignItems: 'center', marginBottom: 20 },
    subjectIconBox: {
        width: 58, height: 58, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8, backgroundColor: '#F0F3F8',
    },
    subjectIconImage: { width: 48, height: 48, borderRadius: 10 },
    subjectItemText: { fontFamily: 'SF-Pro-Display-Regular', fontSize: 11, color: '#444', textAlign: 'center' },
});

export default SubjectItem;
