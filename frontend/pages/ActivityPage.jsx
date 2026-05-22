import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
    StatusBar, ScrollView, Image, ActivityIndicator
} from 'react-native';

import { getHistory, getActiveSchedule } from '../services/historyService';

// Import Ikon Lucide agar seragam dengan HomePage
import { Calendar, MessageSquare, User, Home } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const ActivityPage = ({ initialTab = 'aktif', onNavigate, onDetailClick, userId, userRole }) => {
    const role = userRole ? userRole.toLowerCase() : 'murid';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [activeData, setActiveData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const fetchActiveData = async () => {
        setIsLoading(true);
        try {
            const result = await getActiveSchedule(userRole, userId);
            console.log("Hasil dari Backend:", result);

            if (result && result.success) {
                const rawData = result.data;
                const formattedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
                setActiveData(formattedData);
            } else {
                setActiveData([]);
            }
        } catch (error) {
            console.log("Error fetch active:", error);
            setActiveData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!userId || !userRole) return;

        if (activeTab === 'aktif') {
            fetchActiveData();
        } else {
            fetchHistoryData();
        }
    }, [activeTab, userId, userRole]);

    const fetchHistoryData = async () => {
        console.log("[CEK PROPS] userId:", userId, "| userRole:", userRole);

        if (!userId || !userRole) {
            console.log("❌ FETCH DIBATALKAN KARENA ID ATAU ROLE KOSONG!");
            return;
        }

        setIsLoading(true);
        try {
            const result = await getHistory(userRole, userId);
            console.log("[DEBUG] Balasan API History:", result);

            if (Array.isArray(result)) {
                setHistoryData(result);
            }
            else if (result && (result.success === true || result.status === 200)) {
                setHistoryData(result.data || result.history || []);
            }
            else {
                setHistoryData([]);
            }

        } catch (error) {
            console.log("[DEBUG] Error fetch history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'riwayat') {
            fetchHistoryData();
        }
    }, [activeTab, userId, userRole]);

    const renderCard = (item, isHistory, index) => (
        <View style={styles.card} key={item.id_pemesanan || index}>
            <View style={styles.cardIconBox}><Text style={{ color: '#FFF', fontSize: 24 }}>📖</Text></View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>
                    <Text style={{ fontWeight: 'bold' }}>
                        {item.mata_pelajaran?.nama_mapel || item.nama_mapel || 'Pelajaran'}
                    </Text> - {item.materi?.nama_materi || item.nama_materi || 'Materi'}
                </Text>

                <Text style={styles.cardGuru}>
                    👤 {userRole === 'murid' ? item.nama_guru : item.nama_murid}
                </Text>

                <Text style={styles.cardTime}>
                    {item.waktu_mulai ? new Date(item.waktu_mulai).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : 'Waktu tidak tersedia'}
                </Text>
            </View>

            {isHistory ? (
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#284B7A' }]} 
                    onPress={() => onDetailClick(item)}
                >
                    <Text style={styles.actionBtnText}>Beri Ulasan</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>Ingatkan</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Activity</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'aktif' && styles.activeTabBtn]} onPress={() => setActiveTab('aktif')}>
                    <Text style={[styles.tabText, activeTab === 'aktif' && styles.activeTabText]}>Jadwal Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.activeTabBtn]} onPress={() => setActiveTab('riwayat')}>
                    <Text style={[styles.tabText, activeTab === 'riwayat' && styles.activeTabText]}>Riwayat Sesi</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
                {activeTab === 'aktif' ? (
                    isLoading ? (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#284B7A" />
                            <Text style={{ marginTop: 10, color: '#888' }}>Memuat jadwal...</Text>
                        </View>
                    ) : activeData && activeData.length > 0 ? (
                        activeData.map((item, index) => renderCard(item, false, index))
                    ) : (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Text style={{ fontSize: 40 }}>📅</Text>
                            <Text style={styles.emptyText}>Tidak ada jadwal aktif saat ini.</Text>
                        </View>
                    )
                ) : (
                    isLoading ? (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#284B7A" />
                            <Text style={{ marginTop: 10, color: '#888' }}>Mencari riwayat...</Text>
                        </View>
                    ) : historyData && historyData.length > 0 ? (
                        historyData.map((item, index) => renderCard(item, true, index))
                    ) : (
                        <View style={{ marginTop: 50, alignItems: 'center' }}>
                            <Text style={{ fontSize: 40 }}>📭</Text>
                            <Text style={styles.emptyText}>Belum ada riwayat sesi.</Text>
                        </View>
                    )
                )}
            </ScrollView>

            {/* BOTTOM NAVBAR DENGAN FITUR KLIK SINKRON HOMEPAGE */}
            <View style={styles.customBottomNavbar}>
                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Home')}>
                    <Home color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>{role === 'guru' ? 'Home' : 'Beranda'}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navBarItem}>
                    <Calendar color="#284B7A" size={22} />
                    <Text style={[styles.navBarLabel, { color: '#284B7A', fontWeight: 'bold' }]}>
                        {role === 'guru' ? 'Activity' : 'Aktivitas'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.centerFabContainer}>
                    <TouchableOpacity 
                        style={styles.centerFabButton}
                        onPress={() => {
                            if (onNavigate) {
                                onNavigate(role === 'guru' ? 'Activity' : 'PesanSesi');
                            }
                        }}
                    >
                        <Image source={LOGO_SOURCE} style={styles.centerFabLogoIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <Text style={styles.centerFabLabelText}>
                        {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Chat')}>
                    <MessageSquare color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Profile')}>
                    <User color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFF' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTabBtn: { borderBottomWidth: 2, borderBottomColor: '#284B7A' },
    tabText: { fontSize: 14, color: '#A9A9A9', fontWeight: '600' },
    activeTabText: { color: '#284B7A' },

    card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    cardIconBox: { width: 60, height: 60, backgroundColor: '#387C65', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 12, color: '#333', marginBottom: 5 },
    cardGuru: { fontSize: 11, color: '#555', marginBottom: 5 },
    cardTime: { fontSize: 10, color: '#A9A9A9' },
    actionBtn: { backgroundColor: '#387C65', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, position: 'absolute', bottom: 15, right: 15 },
    actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 10, fontSize: 14 },

    customBottomNavbar: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEF0F2', paddingHorizontal: 10 },
    navBarItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
    centerFabContainer: { alignItems: 'center', width: 75, height: 80, top: -16 },
    centerFabButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#284B7A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
    centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
    centerFabLabelText: { fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4, fontWeight: '600' },
});

export default ActivityPage;