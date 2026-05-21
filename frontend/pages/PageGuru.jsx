import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    useWindowDimensions,
    ActivityIndicator // Tambahan untuk animasi loading
} from 'react-native';
// Pastikan library lucide-react-native sudah sinkron di semua laptop tim ya!
import { Calendar, BookOpen, Wallet, MousePointerClick, MapPin, MessageSquare, Home, Activity, MessageCircle, User } from 'lucide-react-native';

// 1. IMPORT SERVICE (Sesuaikan path folder dengan struktur file project tim-mu)
import { fetchPermintaanBaru } from '../services/matchingService';

const PageGuru = () => {
    const { width } = useWindowDimensions();

    // 2. STATE UNTUK MENAMPUNG DATA DATABASE
    const [permintaan, setPermintaan] = useState([]);
    const [loading, setLoading] = useState(true);

    // 3. FUNGSI LOAD DATA DARI SERVICE
    const loadPermintaan = async () => {
        setLoading(true);
        const result = await fetchPermintaanBaru();
        if (result && result.success) {
            setPermintaan(result.data);
        }
        setLoading(false);
    };

    // 4. JALANKAN LOAD DATA SAAT HALAMAN DIBUKA
    useEffect(() => {
        loadPermintaan();
    }, []);

    // 5. HELPER FORMAT WAKTU & RUPIAH
    const formatWaktu = (waktuString) => {
        if (!waktuString) return '';
        const date = new Date(waktuString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const formatRupiah = (number) => {
        if (!number) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <View style={styles.container}>
            {/* 1. STATUS BAR */}
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* 2. HEADER BLUE BACKGROUND */}
                <View style={styles.headerBackground}>
                    <Text style={styles.welcomeText}>Halo,</Text>
                    <Text style={styles.nameText}>Ahmad Pambudi!</Text>
                </View>

                {/* 3. CARD: SESI HARI INI (Statis) */}
                <View style={styles.mainCard}>
                    <Text style={styles.cardSectionTitle}>SESI HARI INI</Text>

                    <View style={styles.profileRow}>
                        <View style={styles.avatarCircle}><Text style={styles.avatarText}>MA</Text></View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.studentName}>Mario Arkan</Text>
                            <Text style={styles.subjectText}>Matematika — Relasi & Fungsi</Text>
                        </View>
                        <View style={styles.badgeSegera}><Text style={styles.badgeTextSegera}>• Segera</Text></View>
                    </View>

                    {/* Detail Waktu, Lokasi, Bayaran */}
                    <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Waktu</Text>
                            <Text style={styles.detailValue}>06.30 – 09.30</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Lokasi</Text>
                            <Text style={styles.detailValue} numberOfLines={2}>Jl. Cihampelas No.12</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Bayaran</Text>
                            <Text style={styles.detailValue}>Rp 34.000</Text>
                        </View>
                    </View>

                    {/* Tombol Aksi Sesi */}
                    <View style={styles.actionButtonRow}>
                        <TouchableOpacity style={[styles.btnAction, styles.btnPrimary]}>
                            <Text style={styles.btnTextWhite}>Lihat Rute</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAction, styles.btnSecondary]}>
                            <Text style={styles.btnTextBlue}>Chat Murid</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 4. GRID MENU BUTTONS */}
                <View style={styles.menuGridContainer}>
                    <View style={styles.menuRow}>
                        <TouchableOpacity style={styles.menuItemButton}>
                            <View style={styles.iconContainer}><Calendar color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Jadwal Saya</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItemButton}>
                            <View style={styles.iconContainer}><BookOpen color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Materi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItemButton}>
                            <View style={styles.iconContainer}><Wallet color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Pendapatan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItemButton}>
                            <View style={styles.iconContainer}><MousePointerClick color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Permintaan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 5. SECTION: PERMINTAAN BARU */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>PERMINTAAN BARU</Text>
                    {/* Tombol ini saya ubah jadi refresh data agar mempermudah testing tim */}
                    <TouchableOpacity onPress={loadPermintaan}>
                        <Text style={styles.linkText}>Refresh Data</Text>
                    </TouchableOpacity>
                </View>

                {/* 6. RENDER DATA PERMINTAAN BARU DINAMIS */}
                {loading ? (
                    <ActivityIndicator size="large" color="#284B7A" style={{ marginTop: 30 }} />
                ) : permintaan.length === 0 ? (
                    <View style={{ padding: 30, alignItems: 'center' }}>
                        <Text style={{ color: '#888' }}>Belum ada permintaan mengajar saat ini.</Text>
                    </View>
                ) : (
                    permintaan.map((item) => (
                        <View key={item.id_pemesanan} style={styles.requestCard}>
                            <View style={styles.profileRow}>
                                <View style={[styles.avatarCircle, { backgroundColor: '#284B7A' }]}>
                                    <Text style={styles.avatarText}>
                                        {item.nama_murid ? item.nama_murid.substring(0, 2).toUpperCase() : 'SN'}
                                    </Text>
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.studentName}>{item.nama_murid}</Text>
                                    <Text style={styles.subjectText}>{item.nama_materi}</Text>
                                </View>
                                <View style={styles.badgeBaru}><Text style={styles.badgeTextBaru}>• Baru</Text></View>
                            </View>

                            <View style={styles.detailGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Waktu</Text>
                                    <Text style={styles.detailValue}>
                                        {formatWaktu(item.waktu_mulai)} – {formatWaktu(item.waktu_selesai)}
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Lokasi</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>{item.lokasi_sesi}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Bayaran</Text>
                                    {/* Pastikan kolom di tabel pemesanan bernama harga_total, jika bukan, sesuaikan */}
                                    <Text style={styles.detailValue}>{formatRupiah(item.harga_total)}</Text>
                                </View>
                            </View>

                            <View style={styles.actionButtonRow}>
                                <TouchableOpacity
                                    style={[styles.btnAction, styles.btnDanger]}
                                    onPress={() => console.log('Tolak id:', item.id_pemesanan)}
                                >
                                    <Text style={styles.btnTextWhite}>Tolak</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btnAction, styles.btnPrimary]}
                                    onPress={() => console.log('Terima id:', item.id_pemesanan)}
                                >
                                    <Text style={styles.btnTextWhite}>Terima</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}

                {/* Tambahan Space di bawah ScrollView agar tidak tertutup Bottom Tab */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* 6. BOTTOM NAVIGATION BAR (MOCKUP VISUAL) */}
            <View style={styles.bottomTabContainer}>
                <TouchableOpacity style={styles.tabItem}>
                    <Home color="#284B7A" size={24} />
                    <Text style={[styles.tabLabel, styles.activeTabLabel]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Activity color="#666" size={24} />
                    <Text style={styles.tabLabel}>Activity</Text>
                </TouchableOpacity>

                {/* Floating Center Button */}
                <View style={styles.centerTabWrapper}>
                    <TouchableOpacity style={styles.centerTabButton}>
                        {/* Menggunakan inisial logo Humana buatan sendiri */}
                        <Text style={styles.centerLogoText}>H</Text>
                    </TouchableOpacity>
                    <Text style={styles.centerTabLabel}>Permintaan</Text>
                </View>

                <TouchableOpacity style={styles.tabItem}>
                    <MessageCircle color="#666" size={24} />
                    <Text style={styles.tabLabel}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <User color="#666" size={24} />
                    <Text style={styles.tabLabel}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ... BAGIAN STYLES TETAP SAMA PERSIS SEPERTI MILIKMU ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    scrollContainer: { flex: 1 },

    // Header Blue Styling
    headerBackground: {
        backgroundColor: '#284B7A',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 70,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    welcomeText: { color: '#FFF', fontSize: 28, fontWeight: '400' },
    nameText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 4 },

    // Main Card Sesi Hari Ini
    mainCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 20,
        marginTop: -50,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 12 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    profileInfo: { flex: 1, marginLeft: 12 },
    studentName: { fontSize: 18, fontWeight: 'bold', color: '#1A335E' },
    subjectText: { fontSize: 13, color: '#666', marginTop: 2 },

    // Badges
    badgeSegera: { backgroundColor: '#C1F4D3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeTextSegera: { color: '#25A244', fontSize: 12, fontWeight: 'bold' },
    badgeBaru: { backgroundColor: '#FFE6A3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeTextBaru: { color: '#D4A017', fontSize: 12, fontWeight: 'bold' },

    // Detail Info Grid
    detailGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    detailItem: { flex: 1, marginRight: 8 },
    detailLabel: { fontSize: 12, color: '#999', fontWeight: 'bold' },
    detailValue: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 4 },

    // Buttons Action
    actionButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    btnAction: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
    btnPrimary: { backgroundColor: '#284B7A' },
    btnSecondary: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD' },
    btnDanger: { backgroundColor: '#FF8A8A' },
    btnTextWhite: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    btnTextBlue: { color: '#284B7A', fontWeight: 'bold', fontSize: 14 },

    // Grid Menu Buttons Middle
    menuGridContainer: { paddingHorizontal: 24, marginTop: 24 },
    menuRow: { flexDirection: 'row', justifyContent: 'space-between' },
    menuItemButton: { alignItems: 'center', width: '22%' },
    iconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E4F0EC', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    menuButtonText: { fontSize: 12, fontWeight: 'bold', color: '#222', textAlign: 'center' },

    divider: { height: 6, backgroundColor: '#F0F2F5', marginTop: 24 },

    // Section Permintaan Baru
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 20, alignItems: 'center' },
    sectionTitleText: { fontSize: 14, fontWeight: 'bold', color: '#888' },
    linkText: { fontSize: 14, fontWeight: 'bold', color: '#3A7BD5' },
    requestCard: { backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 24, padding: 20, marginTop: 12, borderWidth: 1, borderColor: '#ECEFF1' },

    // Bottom Navigation Bar Custom Look
    bottomTabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingBottom: 10,
    },
    tabItem: { alignItems: 'center', justifyContent: 'center' },
    tabLabel: { fontSize: 11, color: '#666', marginTop: 4 },
    activeTabLabel: { color: '#284B7A', fontWeight: 'bold' },

    // Center Floating Tab Button Style
    centerTabWrapper: { alignItems: 'center', marginTop: -30 },
    centerTabButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', borderWhiteWidth: 4, borderColor: '#FFF', elevation: 4 },
    centerLogoText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    centerTabLabel: { fontSize: 11, color: '#666', marginTop: 6 },
});

export default PageGuru;