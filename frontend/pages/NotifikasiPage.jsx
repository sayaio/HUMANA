import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    SafeAreaView,
    FlatList
} from 'react-native';
import BackButton from '../components/BackButton';
import { fetchNotifikasi, clearNotifikasi } from '../services/notifikasiService';

const NotifikasiPage = ({ userId, userRole, onBack }) => {
    const role = userRole ? userRole.toLowerCase() : 'murid';
    const [notifikasi, setNotifikasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;

    const loadNotif = async (isLoadMore = false) => {
        if (!userId || (!isLoadMore && !loading) && hasMore === false) return;
        
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        const currentOffset = isLoadMore ? offset : 0;
        const res = await fetchNotifikasi(role, userId, limit, currentOffset);
        
        if (res.success && Array.isArray(res.data)) {
            if (res.data.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (isLoadMore) {
                setNotifikasi(prev => [...prev, ...res.data]);
            } else {
                setNotifikasi(res.data);
            }
            setOffset(currentOffset + limit);
        } else if (!isLoadMore) {
            setNotifikasi([]);
            setHasMore(false);
        }
        
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        setOffset(0);
        setHasMore(true);
        loadNotif(false);
    }, [userId, role]);

    const handleLoadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            loadNotif(true);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.notifCard}>
            <Text style={styles.notifTitle}>{item.judul}</Text>
            <Text style={styles.notifMessage}>{item.pesan}</Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#284B7A" />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <View style={styles.header}>
                <BackButton onPress={onBack} />
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Notifikasi</Text>
                </View>
                <View style={styles.clearBtnPlaceholder} />
            </View>

            {loading && offset === 0 ? (
                <ActivityIndicator size="large" color="#284B7A" style={{ marginTop: 50 }} />
            ) : notifikasi.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Tidak ada notifikasi saat ini.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifikasi}
                    keyExtractor={(item, index) => (item.id_notifikasi ? item.id_notifikasi.toString() : index.toString())}
                    renderItem={renderItem}
                    contentContainerStyle={styles.contentContainer}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            )}
        </SafeAreaView>
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
        justifyContent: 'space-between',
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
        position: 'absolute',
        left: 0,
        right: 0,
        top: 50, // Adjust based on paddingTop of header
        bottom: 15, // Adjust based on paddingBottom of header
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    clearBtnPlaceholder: {
        width: 80,
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
