// pages/RiwayatPendapatanPage.jsx

import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, ScrollView,
    TouchableOpacity, StatusBar, ActivityIndicator, Image
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { fetchRiwayatPendapatan } from '../services/pendapatanService';
import PageHeader from '../components/PageHeader';

const FONTS = {
    bold: 'SF-Pro-Display-Bold',
    regular: 'SF-Pro-Display-Regular',
};

const SUBJECT_ICONS = {
    'Matematika': require('../assets/matematika.png'),
    'Informatika': require('../assets/informatika.png'),
    'Biologi': require('../assets/biologi.png'),
    'Kimia': require('../assets/kimia.png'),
    'Fisika': require('../assets/fisika.png'),
    'Sejarah': require('../assets/sejarah.png'),
    'Sosiologi': require('../assets/sosiologi.png'),
    'Bahasa Inggris': require('../assets/inggris.png'),
};

const HARI_ID = {
    'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu',
    'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu'
};

const BULAN = [
    { label: 'Semua', value: null },
    { label: 'Jan', value: 1 }, { label: 'Feb', value: 2 },
    { label: 'Mar', value: 3 }, { label: 'Apr', value: 4 },
    { label: 'Mei', value: 5 }, { label: 'Jun', value: 6 },
    { label: 'Jul', value: 7 }, { label: 'Agt', value: 8 },
    { label: 'Sep', value: 9 }, { label: 'Okt', value: 10 },
    { label: 'Nov', value: 11 }, { label: 'Des', value: 12 },
];

const formatRupiah = (angka) => {
    if (!angka) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
};

const currentYear = new Date().getFullYear();
const TAHUN = [null, currentYear, currentYear - 1, currentYear - 2].map(y => ({
    label: y ? String(y) : 'Semua',
    value: y
}));

const RiwayatPendapatanPage = ({ guruData, onNavigate }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBulan, setSelectedBulan] = useState(null);
    const [selectedTahun, setSelectedTahun] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const result = await fetchRiwayatPendapatan(
                    guruData?.id,
                    selectedBulan,
                    selectedTahun
                );
                if (result?.success) {
                    setData(Array.isArray(result.data) ? result.data : []);
                }
            } catch (err) {
                console.error('[RiwayatPendapatanPage] Error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedBulan, selectedTahun, guruData?.id]);

    const totalFilter = data.reduce((acc, item) => acc + Number(item.jumlah || 0), 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <PageHeader
                title="Riwayat Pendapatan"
                onBack={() => onNavigate?.('Pendapatan')}
            />

            {/* Filter Tahun */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Tahun</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {TAHUN.map(t => (
                        <TouchableOpacity
                            key={String(t.value)}
                            style={[styles.filterChip, selectedTahun === t.value && styles.filterChipActive]}
                            onPress={() => setSelectedTahun(t.value)}
                        >
                            <Text style={[styles.filterChipText, selectedTahun === t.value && styles.filterChipTextActive]}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Filter Bulan */}
            <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Bulan</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {BULAN.map(b => (
                        <TouchableOpacity
                            key={String(b.value)}
                            style={[styles.filterChip, selectedBulan === b.value && styles.filterChipActive]}
                            onPress={() => setSelectedBulan(b.value)}
                        >
                            <Text style={[styles.filterChipText, selectedBulan === b.value && styles.filterChipTextActive]}>
                                {b.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Total Filter */}
            <View style={styles.totalFilterCard}>
                <Text style={styles.totalFilterLabel}>Total Periode Ini</Text>
                <Text style={styles.totalFilterValue}>{formatRupiah(totalFilter)}</Text>
            </View>

            {/* List Riwayat */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#284B7A" />
                    <Text style={styles.loadingText}>Memuat riwayat...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                    {data.length > 0 ? data.map((item, index) => (
                        <View key={item.id_pemesanan || index} style={styles.riwayatCard}>
                            <View style={styles.iconBox}>
                                {/* ✅ DIUBAH: Menggunakan komponen Image berbasis path asset lokal */}
                                {SUBJECT_ICONS[item.nama_mapel] ? (
                                    <Image 
                                        source={SUBJECT_ICONS[item.nama_mapel]} 
                                        style={styles.mapelIconImage} 
                                        resizeMode="contain" 
                                    />
                                ) : (
                                    <Text style={styles.iconText}>⊞</Text>
                                )}
                            </View>
                            <View style={styles.riwayatInfo}>
                                <Text style={styles.riwayatNama} numberOfLines={1}>
                                    {item.nama_mapel} — {item.nama_materi}
                                </Text>
                                <Text style={styles.riwayatSub} numberOfLines={1}>
                                    {HARI_ID[item.hari] || item.hari}, {item.jam} • {item.nama_murid}
                                </Text>
                            </View>
                            <View style={styles.riwayatRight}>
                                <Text style={styles.riwayatJumlah}>+{formatRupiah(item.jumlah)}</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.status?.toUpperCase() || 'LUNAS'}</Text>
                                </View>
                            </View>
                        </View>
                    )) : (
                        <View style={styles.emptyContainer}>
                            <Text style={{ fontSize: 36 }}>💸</Text>
                            <Text style={styles.emptyText}>Tidak ada riwayat untuk periode ini.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    filterSection: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    filterLabel: { fontFamily: FONTS.bold, fontSize: 11, color: '#ABABAB', letterSpacing: 1, marginBottom: 8 },
    filterRow: { flexDirection: 'row' },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: '#F0F3F8', marginRight: 8, marginBottom: 8,
    },
    filterChipActive: { backgroundColor: '#284B7A' },
    filterChipText: { fontFamily: FONTS.bold, fontSize: 12, color: '#666' },
    filterChipTextActive: { color: '#FFF' },

    totalFilterCard: {
        backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 12,
        borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EAEEF3',
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    totalFilterLabel: { fontFamily: FONTS.regular, fontSize: 13, color: '#888' },
    totalFilterValue: { fontFamily: FONTS.bold, fontSize: 16, color: '#284B7A' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontFamily: FONTS.regular, marginTop: 10, color: '#999', fontSize: 13 },

    riwayatCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        borderRadius: 16, marginBottom: 10, padding: 14,
        borderWidth: 1, borderColor: '#EAEEF3',
    },
    iconBox: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: '#EBF0F8',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    mapelIconImage: { width: 32, height: 32 },
    iconText: { fontSize: 20 },
    riwayatInfo: { flex: 1 },
    riwayatNama: { fontFamily: FONTS.bold, fontSize: 14, color: '#1A1A2E', marginBottom: 4 },
    riwayatSub: { fontFamily: FONTS.regular, fontSize: 12, color: '#888' },
    riwayatRight: { alignItems: 'flex-end', marginLeft: 8 },
    riwayatJumlah: { fontFamily: FONTS.bold, fontSize: 14, color: '#284B7A', marginBottom: 4 },
    badge: { backgroundColor: '#EBF0F8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#284B7A' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontFamily: FONTS.regular, color: '#999', marginTop: 8, fontSize: 13 },
});

export default RiwayatPendapatanPage;