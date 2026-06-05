import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch,
    Image,
    RefreshControl,
    Dimensions,
    Platform,
    SafeAreaView,
} from 'react-native';
import {
    Edit2,
    Plus,
    Trash2,
    LogOut,
} from 'lucide-react-native';
import { updateAvailabilityProfile } from '../services/editProfileService';
import { fetchGuruRating } from '../services/feedbackService';
import { portfolioService } from '../services/portfolioService';
import { useAppAlert } from '../components/AppAlertProvider';
import { fetchSesiDikonfirmasi } from '../services/matchingService';
import BottomNavbar from '../components/BottomNavbar';
import { materiGuruService } from '../services/materiGuruService';

const { width } = Dimensions.get('window');
const LOGO_SOURCE = require('../assets/logo_humana.png');

const ProfileGuruPage = ({ guruData, onNavigate, onLogout, onRefreshData }) => {
    const { showInfo, showConfirm } = useAppAlert();
    const [isAktif, setIsAktif] = useState(
        guruData?.is_active === 1 ||
        guruData?.is_active === true ||
        guruData?.isActive === 1 ||
        guruData?.isActive === true,
    );

    const idGuru = guruData?.id || guruData?.id_guru;
    const [refreshing, setRefreshing] = useState(false);
    const [portofolios, setPortofolios] = useState([]);
    const [materiDiajar, setMateriDiajar] = useState([]);
    const [sesiHariIni, setSesiHariIni] = useState(0);

    const loadLatestProfileData = useCallback(async () => {
        if (!idGuru) return;
        const response = await fetchGuruRating(idGuru);
        if (response && response.success) {
            if (onRefreshData) onRefreshData(response.data);
        }
    }, [idGuru, onRefreshData]);

    const loadSesiHariIni = useCallback(async () => {
        if (!idGuru) return;
        try {
            const result = await fetchSesiDikonfirmasi(idGuru);
            if (result && result.success && result.data) {
                const today = new Date();
                const sesiToday = result.data.filter(sesi => {
                    const tanggalRaw = sesi.tanggal_mentah || sesi.waktu_mulai;
                    if (!tanggalRaw) return false;
                    const tanggalSesi = new Date(tanggalRaw);
                    return (
                        tanggalSesi.getDate() === today.getDate() &&
                        tanggalSesi.getMonth() === today.getMonth() &&
                        tanggalSesi.getFullYear() === today.getFullYear()
                    );
                });
                setSesiHariIni(sesiToday.length);
            }
        } catch (error) {
            console.log('Gagal load sesi hari ini:', error.message);
        }
    }, [idGuru]);

    const loadPortofolios = useCallback(async () => {
        if (!idGuru) return;
        try {
            const data = await portfolioService.getPortfolioByGuru(idGuru);
            setPortofolios(data);
        } catch (error) {
            console.log('Gagal load portofolio:', error.message);
        }
    }, [idGuru]);

    const loadMateriDiajar = useCallback(async () => {
        if (!idGuru) return;
        try {
            const data = await materiGuruService.getMateriGuru(idGuru);
            setMateriDiajar(data);
        } catch (error) {
            console.log('Gagal load materi diajar:', error.message);
        }
    }, [idGuru]);

    useEffect(() => {
        if (guruData) {
            setIsAktif(guruData.is_active === 1 || guruData.is_active === true);
        }
    }, [guruData]);

    useEffect(() => {
        if (idGuru) {
            loadLatestProfileData();
            loadPortofolios();
            loadSesiHariIni();
            loadMateriDiajar();
        }
    }, [idGuru, loadLatestProfileData, loadPortofolios, loadSesiHariIni, loadMateriDiajar]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadLatestProfileData(),
            loadPortofolios(),
            loadSesiHariIni(),
            loadMateriDiajar(),
        ]);
        setRefreshing(false);
    };

    const handleToggleAvailability = async newValue => {
        const idGuruTerpilih = guruData?.id || guruData?.id_guru;
        if (!idGuruTerpilih) {
            showInfo('Data Tidak Valid', 'ID Guru tidak ditemukan.');
            return;
        }
        setIsAktif(newValue);
        const result = await updateAvailabilityProfile(idGuruTerpilih, newValue);
        if (result && result.success) {
            if (onRefreshData) onRefreshData({ ...guruData, is_active: newValue });
            showInfo('Sukses', `Status Anda kini ${newValue ? 'Aktif menerima murid' : 'Nonaktif'}.`);
        } else {
            setIsAktif(!newValue);
            showInfo('Eror', 'Gagal mengubah status di server.');
        }
    };

    const handleDeletePorto = idPortfolio => {
        showConfirm('Hapus Portofolio', 'Apakah Anda yakin?', async () => {
            try {
                await portfolioService.hapusPortfolio(idPortfolio);
                await loadPortofolios();
            } catch (error) {
                showInfo('Error', error.message);
            }
        });
    };

    const initialLetter = guruData?.name
        ? guruData.name.substring(0, 2).toUpperCase()
        : 'RN';

    const DataRow = ({ label, value }) => (
        <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{label}</Text>
            <Text style={styles.dataValue}>{value || '-'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profil</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#284B7A']} />
                }
            >
                {/* USER CARD — sama seperti ProfilePage murid, dengan watermark logo */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initialLetter}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editAvatarBtn}
                            onPress={() => showInfo('Segera Hadir', 'Fitur ganti profil akan segera hadir!')}
                        >
                            <Text style={{ fontSize: 11, color: '#FFF' }}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>
                            {guruData?.name || guruData?.nama || 'Nama Guru'}
                        </Text>
                        <Text style={styles.userEmail} numberOfLines={1}>
                            {guruData?.email || 'email@humana.id'}
                        </Text>
                    </View>
                    {/* Watermark logo Humana dengan opacity kecil */}
                    <Image
                        source={LOGO_SOURCE}
                        style={styles.cardWatermark}
                        resizeMode="contain"
                    />
                </View>

                {/* STATUS CARD */}
                <View style={styles.statusCard}>
                    <Text style={styles.statusSectionLabel}>STATUS</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusSubBox}>
                            <Text style={styles.statusValueBlue}>{sesiHariIni}</Text>
                            <Text style={styles.statusSubLabel}>Sesi hari ini</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusSubBox}>
                            <Text style={styles.statusValueBlue}>
                                {guruData?.rating ? Number(guruData.rating).toFixed(1) : '0.0'}
                            </Text>
                            <Text style={styles.statusSubLabel}>Rating</Text>
                        </View>
                        <View style={styles.statusDivider} />
                        <View style={styles.statusSubBox}>
                            <Text style={[styles.activeStatusLabel, { color: isAktif ? '#25A244' : '#666' }]}>
                                {isAktif ? 'Aktif' : 'Nonaktif'}
                            </Text>
                            <Switch
                                value={isAktif}
                                onValueChange={handleToggleAvailability}
                                trackColor={{ false: '#767577', true: '#C1F4D3' }}
                                thumbColor={isAktif ? '#25A244' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* SECTION DATA PRIBADI */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Data Pribadi</Text>
                        <TouchableOpacity
                            style={styles.editSectionBtn}
                            onPress={() => onNavigate('EditBasicProfile')}
                            activeOpacity={0.7}
                        >
                            <Edit2 size={14} color="#284B7A" />
                            <Text style={styles.editSectionBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardBox}>
                        <DataRow label="Nama Pengguna" value={guruData?.username || guruData?.name?.toLowerCase().replace(/\s/g, '')} />
                        <View style={styles.divider} />
                        <DataRow label="No. Telepon" value={guruData?.phone || guruData?.no_telepon} />
                        <View style={styles.divider} />
                        <DataRow label="Jenis Kelamin" value={guruData?.gender || guruData?.jenis_kelamin} />
                        <View style={styles.divider} />
                        <DataRow label="Domisili" value={guruData?.domicile || guruData?.alamat} />
                    </View>
                </View>

                {/* SECTION MATERI DIAJAR */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Materi yang Diajar</Text>
                        <TouchableOpacity
                            style={styles.editSectionBtn}
                            onPress={() => onNavigate('TambahMateri')}
                            activeOpacity={0.7}
                        >
                            <Edit2 size={14} color="#284B7A" />
                            <Text style={styles.editSectionBtnText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardBox}>
                        {materiDiajar.length === 0 ? (
                            <Text style={styles.emptyText}>Belum ada materi. Tap Edit untuk menambah.</Text>
                        ) : (
                            <View style={styles.chipWrap}>
                                {materiDiajar.map(item => (
                                    <View key={item.id_materi} style={styles.chip}>
                                        <Text style={styles.chipText}>{item.nama_materi}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* SECTION PORTOFOLIO */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Portofolio</Text>
                        <TouchableOpacity
                            style={styles.editSectionBtn}
                            onPress={() => onNavigate('Portfolio')}
                            activeOpacity={0.7}
                        >
                            <Plus size={14} color="#284B7A" />
                            <Text style={styles.editSectionBtnText}>Tambah</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardBox}>
                        {portofolios.length === 0 ? (
                            <Text style={styles.emptyText}>Belum ada portofolio.</Text>
                        ) : (
                            portofolios.map(item => (
                                <View key={item.id_portfolio} style={styles.portoItem}>
                                    <View style={styles.portoHeader}>
                                        <Text style={styles.portoTitle}>{item.judul}</Text>
                                        <TouchableOpacity onPress={() => handleDeletePorto(item.id_portfolio)}>
                                            <Trash2 size={16} color="#FF8A8A" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.portoDesc}>{item.deskripsi}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                {/* TOMBOL LOGOUT */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.6}>
                        <LogOut color="#FF4D4D" size={20} style={{ marginRight: 10 }} />
                        <Text style={styles.logoutText}>Keluar dari Akun</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <BottomNavbar currentScreen="ProfileGuru" onNavigate={onNavigate} userRole="guru" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        // SOLUSI RESPONSIF: Menghitung padding atas berdasarkan platform OS & tinggi StatusBar asli
        paddingTop:
          Platform.OS === 'android'
            ? StatusBar.currentHeight
              ? StatusBar.currentHeight + 10
              : 20
            : 15,
        paddingBottom: 15,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },

    // USER CARD — sama persis dengan ProfilePage murid
    userCard: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FC',
        marginHorizontal: width * 0.05,
        borderRadius: 20,
        padding: width * 0.05,
        alignItems: 'center',
        marginBottom: 25,
        overflow: 'hidden',
    },
    avatarContainer: { position: 'relative', marginRight: 15 },
    avatarCircle: {
        width: width * 0.16,
        height: width * 0.16,
        borderRadius: (width * 0.16) / 2,
        backgroundColor: '#9BB1C9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: width * 0.07, color: '#FFF', fontWeight: 'bold' },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7B61FF',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F8F9FC',
    },
    userInfo: { flex: 1, zIndex: 1, paddingRight: 10 },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 2, textTransform: 'capitalize' },
    userEmail: { fontSize: 12, color: '#666' },
    cardWatermark: {
        position: 'absolute',
        right: -15,
        top: 10,
        width: width * 0.25,
        height: width * 0.25,
        tintColor: '#E0E5EC',
        opacity: 0.4,
        zIndex: 0,
    },

    // STATUS CARD
    statusCard: {
        backgroundColor: '#FFF',
        marginHorizontal: width * 0.05,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ECEFF1',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        marginBottom: 25,
    },
    statusSectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 16 },
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statusSubBox: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    statusValueBlue: { fontSize: 20, fontWeight: 'bold', color: '#284B7A' },
    statusSubLabel: { fontSize: 11, color: '#999', marginTop: 6, textAlign: 'center' },
    statusDivider: { width: 1, height: 35, backgroundColor: '#E0E0E0' },
    activeStatusLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },

    // SECTION — sama persis dengan ProfilePage murid
    sectionContainer: { paddingHorizontal: width * 0.05, marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#000' },
    editSectionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#284B7A',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    editSectionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#284B7A', marginLeft: 4 },

    cardBox: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: width * 0.045,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    dataRow: { marginBottom: 4, marginTop: 4 },
    dataLabel: { fontSize: 11, color: '#888', marginBottom: 3, fontWeight: '600' },
    dataValue: { fontSize: 15, color: '#000', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },

    emptyText: { fontSize: 13, color: '#ABABAB', fontStyle: 'italic' },

    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { borderWidth: 1.5, borderColor: '#284B7A', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    chipText: { fontSize: 13, fontWeight: 'bold', color: '#284B7A' },

    portoItem: { marginBottom: 12 },
    portoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    portoTitle: { fontSize: 14, fontWeight: 'bold', color: '#284B7A', flex: 1, marginRight: 8 },
    portoDesc: { fontSize: 13, color: '#555', marginTop: 6, lineHeight: 18 },

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF1F1',
        borderWidth: 1,
        borderColor: '#FFAAAA',
        borderRadius: 15,
        paddingVertical: 14,
        marginTop: 5,
    },
    logoutText: { fontSize: 15, color: '#FF4D4D', fontWeight: 'bold' },
});

export default ProfileGuruPage;
