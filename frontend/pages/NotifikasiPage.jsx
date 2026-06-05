import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import BackButton from '../components/BackButton';
import { fetchNotifikasi, clearNotifikasi } from '../services/notifikasiService';

const NotifikasiPage = ({ guruData, onBack }) => {
    const [notifikasi, setNotifikasi] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotif = async () => {
            if (!guruData?.id) return;
            setLoading(true);
            const res = await fetchNotifikasi('guru', guruData.id);
            if (res.success && Array.isArray(res.data)) {
                setNotifikasi(res.data);
            }
            setLoading(false);
        };
        loadNotif();
    }, [guruData]);

    const handleClear = async () => {
        if (!guruData?.id) return;
        const res = await clearNotifikasi('guru', guruData.id);
        if (res.success) {
            setNotifikasi([]);
            Alert.alert('Sukses', 'Semua notifikasi telah dibersihkan');
        } else {
            Alert.alert('Gagal', 'Gagal membersihkan notifikasi');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.header}>
                <BackButton onPress={onBack} label="" />
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Notifikasi</Text>
                </View>
                {notifikasi.length > 0 ? (
                    <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                        <Text style={styles.clearText}>Bersihkan</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.clearBtnPlaceholder} />
                )}
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#FF7A00" style={{ marginTop: 50 }} />
                ) : notifikasi.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Tidak ada notifikasi saat ini.</Text>
                    </View>
                ) : (
                    notifikasi.map((item, index) => (
                        <View key={item.id_notifikasi || index} style={styles.notifCard}>
                            <Text style={styles.notifTitle}>{item.judul}</Text>
                            <Text style={styles.notifMessage}>{item.pesan}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginRight: -10, // Adjust for back button
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    clearBtn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    clearBtnPlaceholder: {
        width: 80,
    },
    clearText: {
        color: '#FF7A00',
        fontSize: 14,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    notifCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    notifTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    notifMessage: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
});

export default NotifikasiPage;
