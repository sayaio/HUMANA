import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    useWindowDimensions,
    ActivityIndicator,
    Alert,
    Animated,
    Modal, Dimensions, PanResponder
} from 'react-native';
import { Calendar, BookOpen, Wallet, MousePointerClick, Home, Activity, MessageCircle, User } from 'lucide-react-native';
const { width, height } = Dimensions.get('window');

// Import service yang sudah diperbarui
import { fetchPermintaanBaru, terimaPermintaanSesiAPI, fetchSesiDikonfirmasi } from '../services/matchingService';
import { fetchAllMapel } from '../services/MateriService';

const LOGO_SOURCE = require('../assets/logo_humana.png');

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

const PageGuru = ({ guruData, onNavigate, onSelectSubject }) => {
    const { width } = useWindowDimensions();

    const [permintaan, setPermintaan] = useState([]);
    const [sesiDikonfirmasi, setSesiDikonfirmasi] = useState(null);
    const [loading, setLoading] = useState(true);

    const LAT_GURU_MOCK = -6.9744;
    const LNG_GURU_MOCK = 107.6303;

    const loadPermintaan = async () => {
        if (!guruData || !guruData.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const resultReq = await fetchPermintaanBaru(guruData.id, LAT_GURU_MOCK, LNG_GURU_MOCK);
        if (resultReq && resultReq.success) {
            setPermintaan(resultReq.data);
        } else {
            setPermintaan([]);
        }

        const resultSesi = await fetchSesiDikonfirmasi(guruData.id);
        if (resultSesi && resultSesi.success && resultSesi.data) {
            setSesiDikonfirmasi(resultSesi.data);
        } else {
            setSesiDikonfirmasi(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPermintaan();
    }, [guruData]);

    const handleTerimaSesi = async (item) => {
        Alert.alert(
            "Konfirmasi Terima",
            `Apakah Anda yakin ingin menerima permintaan mengajar dari ${item.nama_murid}?`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Terima",
                    onPress: async () => {
                        setLoading(true);
                        const res = await terimaPermintaanSesiAPI(
                            item.id_pemesanan,
                            guruData.id,
                            item.biaya_sesi,       // dikirim ke parameter biayaSesi
                            item.biaya_jarak,      // dikirim ke parameter biayaJarak
                            item.harga_total       // dikirim ke parameter totalPembayaranFinal
                        );
                        if (res && res.success) {
                            Alert.alert("Sukses", "Sesi berhasil dikonfirmasi!");
                            setPermintaan(prev => prev.filter(p => p.id_pemesanan !== item.id_pemesanan));
                        } else {
                            Alert.alert("Gagal", res.message || "Terjadi kesalahan sistem.");
                        }
                        setLoading(false);
                    }
                }
            ]
        );
    };

    const handleTolakSesi = (item) => {
        Alert.alert(
            "Tolak Permintaan",
            `Abaikan permintaan dari ${item.nama_murid}? Sesi akan dihapus dari daftar pantauan Anda.`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Tolak",
                    style: "destructive",
                    onPress: () => {
                        setPermintaan(prev => prev.filter(p => p.id_pemesanan !== item.id_pemesanan));
                    }
                }
            ]
        );
    };

    const formatRupiah = (number) => {
        if (!number) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    // Tes materi
    const [isMateriVisible, setIsMateriVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(height));
    const [allSubjects, setAllSubjects] = useState([]);
    const [loadingMapel, setLoadingMapel] = useState(false);

    useEffect(() => {
        if (isMateriVisible) {
            Animated.timing(slideAnim, {
                toValue: 0, duration: 300, useNativeDriver: true,
            }).start();
        }
    }, [isMateriVisible]);

    const closeMateriSheet = () => {
        Animated.timing(slideAnim, {
            toValue: height, duration: 250, useNativeDriver: true,
        }).start(() => setIsMateriVisible(false));
    };

    const panResponder = useState(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
            onPanResponderMove: (_, g) => { if (g.dy > 0) slideAnim.setValue(g.dy); },
            onPanResponderRelease: (_, g) => {
                if (g.dy > 120 || g.vy > 0.5) {
                    closeMateriSheet();
                } else {
                    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
                }
            },
        })
    )[0];

    useEffect(() => {
        if (!isMateriVisible) return;
        const load = async () => {
            setLoadingMapel(true);
            try {
                const data = await fetchAllMapel();
                setAllSubjects(Array.isArray(data) ? data : (data ? [data] : []));
            } catch (err) {
                console.error('[HomePage] Gagal fetch mapel:', err);
            } finally {
                setLoadingMapel(false);
            }
        };
        load();
    }, [isMateriVisible]);

    const renderSubjectItem = (subject) => {
        const icon = SUBJECT_ICONS[subject.nama_mapel] || LOGO_SOURCE;
        return (
            <TouchableOpacity
                key={subject.id_mapel || Math.random()}
                style={styles.subjectItemContainer}
                onPress={() => {
                    closeMateriSheet();
                    if (onSelectSubject) onSelectSubject({ id_mapel: subject.id_mapel, subjectName: subject.nama_mapel });
                }}
            >
                <View style={styles.subjectIconBox}>
                    <Image source={icon} style={styles.subjectIconImage} resizeMode="contain" />
                </View>
                <Text style={styles.subjectItemText}>{subject.nama_mapel}</Text>
            </TouchableOpacity>
        );
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.headerBackground}>
                    <Text style={styles.welcomeText}>Halo,</Text>
                    <Text style={styles.nameText}>{guruData?.name || 'Guru'}!</Text>
                </View>

                {/* CARD: SESI HARI INI */}
                <View style={styles.mainCard}>
                    <Text style={styles.cardSectionTitle}>SESI DIKONFIRMASI / TERDEKAT</Text>
                    {sesiDikonfirmasi ? (
                        <>
                            <View style={styles.profileRow}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>
                                        {sesiDikonfirmasi.nama_murid ? sesiDikonfirmasi.nama_murid.substring(0, 2).toUpperCase() : 'SR'}
                                    </Text>
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.studentName}>{sesiDikonfirmasi.nama_murid}</Text>
                                    <Text style={styles.subjectText}>{sesiDikonfirmasi.nama_materi}</Text>
                                </View>
                                <View style={[styles.badgeSegera, { backgroundColor: '#D1E7DD' }]}>
                                    <Text style={[styles.badgeTextSegera, { color: '#0F5132' }]}>• Siap</Text>
                                </View>
                            </View>

                            <View style={styles.detailGrid}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Waktu</Text>
                                    <Text style={styles.detailValue}>{sesiDikonfirmasi.waktu_string || 'Sesi Terjadwal'}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Lokasi</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>{sesiDikonfirmasi.lokasi_sesi}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Bayaran</Text>
                                    <Text style={styles.detailValue}>{formatRupiah(sesiDikonfirmasi.harga_total)}</Text>
                                </View>
                            </View>

                            <View style={styles.actionButtonRow}>
                                <TouchableOpacity style={[styles.btnAction, styles.btnPrimary]}>
                                    <Text style={styles.btnTextWhite}>Lihat Rute</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnAction, styles.btnSecondary]}>
                                    <Text style={styles.btnTextBlue}>Chat Murid</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        /* UBAH: Tampilan card kosong disamakan konsepnya dengan murid (Center & Menggunakan Emoji) */
                        <View style={{ paddingVertical: 36, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 36, marginBottom: 8 }}>🏖️</Text>
                            <Text style={{ fontSize: 14, color: '#999', fontFamily: 'SF-Pro-Display-Regular', textAlign: 'center' }}>
                                Tidak ada sesi mengajar hari ini.
                            </Text>
                        </View>
                    )}
                </View>

                {/* GRID MENU BUTTONS */}
                <View style={styles.menuGridContainer}>
                    <View style={styles.menuRow}>
                        <TouchableOpacity style={styles.menuItemButton} onPress={() => onNavigate && onNavigate('ActivityGuru')}>
                            <View style={styles.iconContainer}><Calendar color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Jadwal Saya</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItemButton} onPress={() => setIsMateriVisible(true)}>
                            <View style={styles.iconContainer} ><BookOpen color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Materi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItemButton}>
                            <View style={styles.iconContainer}><Wallet color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Pendapatan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItemButton} onPress={() => onNavigate && onNavigate('ActivityGuru')}>
                            <View style={styles.iconContainer}><MousePointerClick color="#2D6A61" size={28} /></View>
                            <Text style={styles.menuButtonText}>Permintaan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* SECTION: PERMINTAAN BARU */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>PERMINTAAN BARU</Text>
                    {/* Mengubah Refresh Data menjadi Lihat Semua */}
                    <TouchableOpacity onPress={() => onNavigate && onNavigate('ActivityGuru')}>
                        <Text style={styles.linkText}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#284B7A" style={{ marginTop: 30 }} />
                ) : permintaan.length === 0 ? (
                    <View style={{ padding: 30, alignItems: 'center' }}>
                        <Text style={{ color: '#888' }}>Belum ada permintaan mengajar saat ini.</Text>
                    </View>
                ) : (
                    // Melakukan slice(0, 2) untuk membatasi tampilan hanya 2 card teratas
                    permintaan.slice(0, 2).map((item) => (
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
                                    <Text style={styles.detailValue}>{item.waktu_string}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Lokasi</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>{item.lokasi_sesi}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Bayaran</Text>
                                    <Text style={styles.detailValue}>{formatRupiah(item.harga_total)}</Text>
                                </View>
                            </View>

                            <View style={styles.actionButtonRow}>
                                <TouchableOpacity style={[styles.btnAction, styles.btnDanger]} onPress={() => handleTolakSesi(item)}>
                                    <Text style={styles.btnTextWhite}>Tolak</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnAction, styles.btnPrimary]} onPress={() => handleTerimaSesi(item)}>
                                    <Text style={styles.btnTextWhite}>Terima</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* BOTTOM NAVIGATION BAR */}
            <View style={styles.bottomTabContainer}>
                <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate && onNavigate('HomeGuru')}>
                    <Home color="#284B7A" size={24} />
                    <Text style={[styles.tabLabel, styles.activeTabLabel]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate && onNavigate('ActivityGuru')}>
                    <Activity color="#666" size={24} />
                    <Text style={styles.tabLabel}>Activity</Text>
                </TouchableOpacity>

                <View style={styles.centerTabWrapper}>
                    <TouchableOpacity style={styles.centerTabButton} onPress={() => onNavigate && onNavigate('HomeGuru')}>
                        <Image source={LOGO_SOURCE} style={styles.centerLogoImage} resizeMode="contain" />
                    </TouchableOpacity>
                    <Text style={styles.centerTabLabel}>Permintaan</Text>
                </View>

                <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate && onNavigate('ChatGuru')}>
                    <MessageCircle color="#666" size={24} />
                    <Text style={styles.tabLabel}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => onNavigate && onNavigate('ProfileGuru')}>
                    <User color="#666" size={24} />
                    <Text style={styles.tabLabel}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* ── Bottom Sheet Materi ───────────────────────────────────── */}
            <Modal
                visible={isMateriVisible}
                animationType="fade"
                transparent
                onRequestClose={closeMateriSheet}
                statusBarTranslucent
                presentationStyle="overFullScreen"
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeMateriSheet} />
                    <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.sheetHandleArea} {...panResponder.panHandlers}>
                            <View style={styles.sheetHandle} />
                        </View>
                        {loadingMapel ? (
                            <View style={[styles.centerContent, { paddingVertical: 40 }]}>
                                <ActivityIndicator size="large" color="#284B7A" />
                                <Text style={styles.loadingText}>Memuat pelajaran...</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.sheetTitle}>Semua Pelajaran</Text>
                                <View style={styles.subjectGrid}>
                                    {allSubjects.length > 0
                                        ? allSubjects.map(renderSubjectItem)
                                        : <Text style={styles.emptyText}>Tidak ada data mata pelajaran.</Text>
                                    }
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    scrollContainer: { flex: 1 },
    headerBackground: { backgroundColor: '#284B7A', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 70, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
    welcomeText: { color: '#FFF', fontSize: 28, fontWeight: '400' },
    nameText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
    mainCard: { backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 24, padding: 20, marginTop: -50, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    cardSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 12 },
    profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    profileInfo: { flex: 1, marginLeft: 12 },
    studentName: { fontSize: 18, fontWeight: 'bold', color: '#1A335E' },
    subjectText: { fontSize: 13, color: '#666', marginTop: 2 },
    badgeSegera: { backgroundColor: '#C1F4D3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeTextSegera: { color: '#25A244', fontSize: 12, fontWeight: 'bold' },
    badgeBaru: { backgroundColor: '#FFE6A3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    badgeTextBaru: { color: '#D4A017', fontSize: 12, fontWeight: 'bold' },
    detailGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    detailItem: { flex: 1, marginRight: 8 },
    detailLabel: { fontSize: 12, color: '#999', fontWeight: 'bold' },
    detailValue: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 4 },
    actionButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    btnAction: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
    btnPrimary: { backgroundColor: '#284B7A' },
    btnSecondary: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD' },
    btnTextWhite: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    btnTextBlue: { color: '#284B7A', fontWeight: 'bold', fontSize: 14 },
    menuGridContainer: { paddingHorizontal: 24, marginTop: 24 },
    menuRow: { flexDirection: 'row', justifyContent: 'space-between' },
    menuItemButton: { alignItems: 'center', width: '22%' },
    iconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E4F0EC', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    menuButtonText: { fontSize: 12, fontWeight: 'bold', color: '#222', textAlign: 'center' },
    divider: { height: 6, backgroundColor: '#F0F2F5', marginTop: 24 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 20, alignItems: 'center' },
    sectionTitleText: { fontSize: 14, fontWeight: 'bold', color: '#888' },
    linkText: { fontSize: 14, fontWeight: 'bold', color: '#3A7BD5' },
    requestCard: { backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 24, padding: 20, marginTop: 12, borderWidth: 1, borderColor: '#ECEFF1' },
    bottomTabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 10 },
    tabItem: { alignItems: 'center', justifyContent: 'center' },
    tabLabel: { fontSize: 11, color: '#666', marginTop: 4 },
    activeTabLabel: { color: '#284B7A', fontWeight: 'bold' },
    centerTabWrapper: { alignItems: 'center', marginTop: -30 },
    centerTabButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', elevation: 4 },
    centerLogoImage: { width: 32, height: 32 },
    centerTabLabel: { fontSize: 11, color: '#666', marginTop: 6 },
    btnDanger: { backgroundColor: '#DC3545' }, // Menambahkan fallback style untuk btnDanger jika belum ada
    loadingText: { fontFamily: 'SF-Pro-Display-Regular', marginTop: 10, color: '#999', fontSize: 12 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    bottomSheet: {
        backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 8, maxHeight: '85%',
        paddingBottom: 100, marginBottom: -60,
    },
    sheetHandleArea: { width: '100%', alignItems: 'center', paddingVertical: 12 },
    sheetHandle: { width: 44, height: 4, backgroundColor: '#DDE2EA', borderRadius: 2 },
    sheetTitle: { fontFamily: 'SF-Pro-Display-Bold', fontSize: 17, color: '#1A1A2E', marginBottom: 16 },
    subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
    subjectItemContainer: { width: '25%', alignItems: 'center', marginBottom: 20 },
    subjectIconBox: {
        width: 58, height: 58, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8, backgroundColor: '#F0F3F8',
    },
    subjectIconImage: { width: 48, height: 48, borderRadius: 10 },
    subjectItemText: { fontFamily: 'SF-Pro-Display-Regular', fontSize: 11, color: '#444', textAlign: 'center' },
    emptyText: { fontFamily: 'SF-Pro-Display-Regular', color: '#999', marginLeft: 10 },
});

export default PageGuru;