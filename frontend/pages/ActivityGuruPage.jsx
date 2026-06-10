import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    useWindowDimensions,
} from 'react-native';
import { Star, X, Clock, DollarSign } from 'lucide-react-native';
import DimmedModal from '../components/DimmedModal';
import { MODAL_WIDE_WIDTH, wideModalCardBase } from '../components/modalTheme';

import {
    fetchPermintaanBaru,
    terimaPermintaanSesiAPI,
    fetchSesiDikonfirmasi,
} from '../services/matchingService';
import { getHistory } from '../services/historyService';
import BottomNavbar from '../components/BottomNavbar';

const ActivityGuruPage = ({
    guruData,
    initialTab = 'Permintaan',
    onTabChange,
    onNavigate,
    onDetailPermintaan,
    onDetailRiwayat,
}) => {
    const idGuru = guruData?.id;

    const [activeTab, setActiveTab] = useState(initialTab || 'Permintaan');
    const [selectedSesi, setSelectedSesi] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [permintaanData, setPermintaanData] = useState([]);
    const [jadwalAktifData, setJadwalAktifData] = useState([]);
    const [riwayatData, setRiwayatData] = useState([]);

    useEffect(() => {
        if (initialTab && initialTab !== activeTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Limits and Offset for History
    const LIMIT = 10;
    const [loadingMore, setLoadingMore] = useState(false);
    const [riwayatOffset, setRiwayatOffset] = useState(0);
    const [hasMoreRiwayat, setHasMoreRiwayat] = useState(true);

    const [koordinat, setKoordinat] = useState({
        lat: -6.973416,
        lng: 107.630406,
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    setKoordinat({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                error => console.log('Gagal mendapatkan GPS, menggunakan default.', error),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
        }
    }, []);

    const muatUlangDataAktivitas = async (isPullRefresh = false) => {
        if (!isPullRefresh) setLoading(true);
        try {
            const [resPermintaan, resKonfirmasi] = await Promise.all([
                fetchPermintaanBaru(idGuru, koordinat.lat, koordinat.lng),
                fetchSesiDikonfirmasi(idGuru)
            ]);
            
            await fetchRiwayatData(isPullRefresh, false);

            // 1. PERMINTAAN
            if (resPermintaan.success && resPermintaan.data) {
                const mappedPermintaan = resPermintaan.data.map(item => ({
                    id: item.id_pemesanan,
                    id_murid: item.id_murid,
                    nama_murid: item.nama_murid,
                    materi: item.nama_materi,
                    tanggal: formatTanggalCard(item.waktu_mulai),
                    waktu: item.waktu_string ||
                        (() => {
                            const d = new Date(item.waktu_mulai instanceof Date ? item.waktu_mulai : (item.waktu_mulai?.toString() || '').replace(' ', 'T'));
                            if (isNaN(d.getTime())) return 'Jam Terjadwal';
                            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - Selesai`;
                        })(),
                    harga: item.harga_total,
                    tipe: 'Permintaan',
                    id_pemesanan: item.id_pemesanan,
                    nama_materi: item.nama_materi,
                    nama_mapel: item.nama_mapel,
                    jenjang_pendidikan: item.jenjang_pendidikan,
                    waktu_string: item.waktu_string,
                    waktu_mulai: item.waktu_mulai,
                    waktu_selesai: item.waktu_selesai,
                    harga_total: item.harga_total,
                    biaya_sesi: item.biaya_sesi,
                    biaya_jarak: item.biaya_jarak,
                    lokasi_sesi: item.lokasi_sesi,
                }));
                setPermintaanData(mappedPermintaan);
            } else {
                setPermintaanData([]);
            }

            // 2. JADWAL AKTIF & BERLANGSUNG
            if (resKonfirmasi.success && resKonfirmasi.data) {
                const mappedAktif = resKonfirmasi.data.map(item => ({
                    id: item.id_pemesanan,
                    id_murid: item.id_murid,
                    nama_murid: item.nama_murid,
                    materi: item.nama_materi,
                    tanggal: formatTanggalCard(item.waktu_mulai),
                    waktu: item.waktu_string || 'Jam Terjadwal',
                    harga: item.harga_total || ((item.biaya_sesi || 0) + (item.biaya_jarak || 0)),
                    tipe: item.status_pemesanan === 'berlangsung' ? 'Berlangsung' : 'Aktif',
                    id_pemesanan: item.id_pemesanan,
                    nama_materi: item.nama_materi,
                    nama_mapel: item.nama_mapel,
                    jenjang_pendidikan: item.jenjang_pendidikan,
                    waktu_string: item.waktu_string,
                    waktu_mulai: item.waktu_mulai,
                    waktu_selesai: item.waktu_selesai,
                    harga_total: item.harga_total,
                    biaya_sesi: item.biaya_sesi,
                    biaya_jarak: item.biaya_jarak,
                    lokasi_sesi: item.lokasi_sesi,
                    status_pemesanan: item.status_pemesanan,
                }));
                setJadwalAktifData(mappedAktif);
            } else {
                setJadwalAktifData([]);
            }
        } catch (err) {
            console.error('Gagal menarik data aktivitas guru:', err);
        } finally {
            if (!isPullRefresh) setLoading(false);
        }
    };

    const fetchRiwayatData = async (isPullRefresh = false, isLoadMore = false) => {
        if (!idGuru) return;
        if (isLoadMore && !hasMoreRiwayat) return;

        if (isLoadMore) setLoadingMore(true);
        
        const currentOffset = isLoadMore ? riwayatOffset : 0;
        try {
            const resRiwayat = await getHistory('guru', idGuru, LIMIT, currentOffset);
            if (resRiwayat.success && resRiwayat.data) {
                const mappedRiwayat = resRiwayat.data.map(item => {
                    return {
                        id: item.id_pemesanan,
                        nama_murid: item.murid.nama_murid,
                        materi: item.mata_pelajaran.nama_mapel + ' — ' + item.nama_materi,
                        waktu: item.waktu_mulai
                            ? (() => {
                                const d = new Date(item.waktu_mulai instanceof Date ? item.waktu_mulai : item.waktu_mulai.toString().replace(' ', 'T'));
                                if (isNaN(d.getTime())) return 'Tanggal tidak tersedia';
                                const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                                return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                            })()
                            : 'Tanggal tidak tersedia',
                        harga: item.nominal ?? item.pembayaran?.nominal ?? item.pembayaran?.total_bayar ?? item.harga_total ?? item.harga ?? 0,
                        tipe: 'Riwayat',
                        status_pemesanan: item.status_pemesanan,
                        rating: Number(item.feedback?.rating) || 0,
                        ulasan: item.feedback?.komentar || 'Tidak ada ulasan.',
                        rawData: item,
                    };
                });

                if (mappedRiwayat.length < LIMIT) setHasMoreRiwayat(false);
                else setHasMoreRiwayat(true);

                if (isLoadMore) {
                    setRiwayatData(prev => {
                        const existingIds = new Set(prev.map(item => item.id).filter(Boolean));
                        const uniqueNew = mappedRiwayat.filter(item => !item.id || !existingIds.has(item.id));
                        return [...prev, ...uniqueNew];
                    });
                } else {
                    setRiwayatData(mappedRiwayat);
                }

                setRiwayatOffset(currentOffset + LIMIT);
            } else {
                if (!isLoadMore) setRiwayatData([]);
                setHasMoreRiwayat(false);
            }
        } catch (error) {
            console.error('Error fetch history:', error);
            if (!isLoadMore) setRiwayatData([]);
        } finally {
            if (isLoadMore) setLoadingMore(false);
        }
    };

    useEffect(() => {
        muatUlangDataAktivitas();
    }, [idGuru, koordinat]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setRiwayatOffset(0);
        setHasMoreRiwayat(true);
        await muatUlangDataAktivitas(true);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (loading || loadingMore || activeTab !== 'Riwayat Sesi') return;
        fetchRiwayatData(false, true);
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#284B7A" />
            </View>
        );
    };

    const openDetailModal = sesi => {
        setSelectedSesi(sesi);
        setModalVisible(true);
    };

    const formatTanggalCard = raw => {
        if (!raw) return '';
        const d = new Date(raw instanceof Date ? raw : raw.toString().replace(' ', 'T'));
        if (isNaN(d.getTime())) return '';
        const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const renderCardList = (item) => {
        return (
            <View key={item.id} style={styles.sesiCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {item.nama_murid.substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.cardMainMeta}>
                        <Text style={styles.studentName}>{item.nama_murid}</Text>
                        <Text style={styles.materiText} numberOfLines={1}>
                            {item.materi}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardGridInfo}>
                    {item.tanggal ? (
                        <>
                            <View style={[styles.gridInfoBox, { paddingLeft: 0 }]}>
                                <Text style={styles.infoLabel}>Tanggal</Text>
                                <Text style={styles.infoValue}>{item.tanggal}</Text>
                            </View>
                            <View style={styles.statusDivider} />
                        </>
                    ) : null}
                    <View style={[styles.gridInfoBox, !item.tanggal && { paddingLeft: 0 }]}>
                        <Text style={styles.infoLabel}>Waktu</Text>
                        <Text style={styles.infoValue}>{item.waktu}</Text>
                    </View>
                    <View style={styles.statusDivider} />
                    <View style={styles.gridInfoBox}>
                        <Text style={styles.infoLabel}>Bayaran</Text>
                        <Text style={styles.infoValue}>
                            Rp {item.harga.toLocaleString('id-ID')}
                        </Text>
                    </View>
                    {item.tipe === 'Riwayat' && (
                        <>
                            <View style={styles.statusDivider} />
                            <View style={styles.gridInfoBox}>
                                <Text style={styles.infoLabel}>Rating</Text>
                                {item.rating > 0 ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                        <Text style={styles.ratingStarIcon}>★</Text>
                                        <Text style={styles.ratingStarValue}>{item.rating}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.infoValue}>-</Text>
                                )}
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.cardActionRow}>
                    {item.tipe === 'Riwayat' && (
                        <View
                            style={[
                                styles.ratingBadgeRow,
                                item.status_pemesanan === 'selesai'
                                    ? styles.ratingBadgeSelesai
                                    : styles.ratingBadgeDibatalkan,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.ratingTextOnly,
                                    item.status_pemesanan === 'selesai'
                                        ? styles.ratingTextSelesai
                                        : styles.ratingTextDibatalkan,
                                ]}
                            >
                                {item.status_pemesanan === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                            </Text>
                        </View>
                    )}
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                        style={styles.btnLihatDetailKecil}
                        onPress={() => {
                            if (item.tipe === 'Riwayat' && onDetailRiwayat) {
                                onDetailRiwayat(item.rawData);
                            } else if (item.tipe !== 'Riwayat' && onDetailPermintaan) {
                                onDetailPermintaan(item, item.tipe);
                            } else {
                                openDetailModal(item);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.btnTextLihatDetail}>Lihat Detail</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const scrollViewRef = useRef(null);
    const { width } = useWindowDimensions();

    const tabMapping = {
        'Permintaan': 0,
        'Jadwal Aktif': 1,
        'Riwayat Sesi': 2,
    };

    // Memastikan ScrollView bergeser saat tab berubah
    useEffect(() => {
        if (width > 0) {
            const index = tabMapping[activeTab] || 0;
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: index * width, animated: false });
            }, 50);
        }
    }, [activeTab, width]);

    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / width);
        let newTab = 'Permintaan';
        if (page === 1) newTab = 'Jadwal Aktif';
        if (page === 2) newTab = 'Riwayat Sesi';
        if (activeTab !== newTab) {
            setActiveTab(newTab);
            if (onTabChange) onTabChange(newTab);
        }
    };

    const renderList = (listData, emptyIcon, emptyText) => {
        return (
            <View style={{ width, flex: 1 }}>
                <FlatList
                    data={listData}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={({ item }) => renderCardList(item)}
                    contentContainerStyle={{ padding: 20, paddingBottom: 110, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#284B7A']} tintColor="#284B7A" />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>{emptyIcon}</Text>
                            <Text style={styles.emptyTextState}>{emptyText}</Text>
                        </View>
                    }
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.topHeaderTitleArea}>
                <Text style={styles.pageMainTitle}>Aktivitas</Text>
            </View>

            <View style={styles.tabSliderContainer}>
                {['Permintaan', 'Jadwal Aktif', 'Riwayat Sesi'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabButtonElement,
                            activeTab === tab && styles.tabButtonElementActive,
                        ]}
                        onPress={() => {
                            setActiveTab(tab);
                            if (onTabChange) onTabChange(tab);
                        }}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === tab && styles.tabButtonTextActive,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#284B7A" />
                    <Text style={{ marginTop: 10, color: '#666' }}>
                        Sinkronisasi data...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    contentOffset={{ x: (tabMapping[initialTab] || 0) * width, y: 0 }}
                >
                    {renderList(permintaanData, '📬', (guruData?.is_active === 1 || guruData?.is_active === true) ? 'Belum ada permintaan mengajar saat ini.' : 'Aktifkan ketersediaan di halaman profil')}
                    {renderList(jadwalAktifData, '📅', 'Tidak ada jadwal aktif.')}
                    {renderList(riwayatData, '📜', 'Belum ada riwayat sesi.')}
                </ScrollView>
            )}

            <DimmedModal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                placement="center"
                size="wide"
            >
                <View style={styles.modalContentSheet}>
                    <View style={styles.modalHeaderTitleRow}>
                        <Text style={styles.modalTitleLabel}>Detail Sesi Kelas</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{ padding: 4 }}
                        >
                            <X size={22} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {selectedSesi && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalIdentityBox}>
                                <View style={styles.modalAvatarBig}>
                                    <Text style={styles.modalAvatarBigText}>
                                        {selectedSesi.nama_murid.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.modalStudentName}>
                                    {selectedSesi.nama_murid}
                                </Text>
                                <Text style={styles.modalMateriName}>
                                    {selectedSesi.materi}
                                </Text>
                            </View>

                            <View style={styles.modalSpecWrapper}>
                                <View style={styles.specItemRow}>
                                    <Clock size={18} color="#284B7A" style={{ marginRight: 10 }} />
                                    <View>
                                        <Text style={styles.specLabel}>Waktu Kelas</Text>
                                        <Text style={styles.specValue}>{selectedSesi.waktu}</Text>
                                    </View>
                                </View>
                                <View style={styles.specItemRow}>
                                    <DollarSign size={18} color="#284B7A" style={{ marginRight: 10 }} />
                                    <View>
                                        <Text style={styles.specLabel}>Total Bayaran</Text>
                                        <Text style={styles.specValue}>
                                            Rp {selectedSesi.harga.toLocaleString('id-ID')}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {selectedSesi.tipe === 'Riwayat' && (
                                <View style={styles.reviewSectionCard}>
                                    <Text style={styles.reviewCardTitle}>
                                        Ulasan & Rating Siswa
                                    </Text>
                                    <View style={styles.modalStarsRow}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                color="#FFB800"
                                                fill={i < selectedSesi.rating ? '#FFB800' : 'transparent'}
                                                style={{ marginRight: 4 }}
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewCommentBody}>
                                        "{selectedSesi.ulasan}"
                                    </Text>
                                </View>
                            )}

                            {selectedSesi.tipe === 'Aktif' && (
                                <TouchableOpacity
                                    style={styles.modalBtnSingleRoute}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalBtnSingleRouteText}>
                                        Tutup Detail Sesi
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    )}
                </View>
            </DimmedModal>

            <BottomNavbar
                currentScreen="ActivityGuru"
                onNavigate={onNavigate}
                userRole="guru"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    topHeaderTitleArea: {
        paddingTop: 50,
        paddingHorizontal: 24,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageMainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },

    tabSliderContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        backgroundColor: '#F0F2F5',
        borderRadius: 14,
        padding: 4,
        marginBottom: 16,
    },
    tabButtonElement: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabButtonElementActive: {
        backgroundColor: '#FFF',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    tabButtonText: { fontSize: 13, color: '#666', fontWeight: '500' },
    tabButtonTextActive: { color: '#284B7A', fontWeight: 'bold' },
    listScrollBody: { flex: 1 },
    emptyTextState: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
        fontSize: 13,
    },
    sesiCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ECEFF1',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#284B7A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    cardMainMeta: { flex: 1, marginLeft: 14 },
    studentName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    materiText: { fontSize: 12, color: '#777', marginTop: 2 },
    cardGridInfo: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 16,
        paddingLeft: 2,
    },
    gridInfoBox: { flex: 1, paddingHorizontal: 8 },
    statusDivider: { width: 1, height: 35, backgroundColor: '#E0E0E0' },
    infoLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
    infoValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },
    cardActionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    btnLihatDetailKecil: {
        backgroundColor: '#284B7A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    btnTextLihatDetail: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    ratingBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    ratingTextBadge: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFB800',
        marginLeft: 4,
    },
    modalContentSheet: {
        ...wideModalCardBase,
        width: MODAL_WIDE_WIDTH,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        maxHeight: '75%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalHeaderTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitleLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    modalIdentityBox: { alignItems: 'center', marginBottom: 20 },
    modalAvatarBig: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#284B7A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalAvatarBigText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    modalStudentName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    modalMateriName: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
        textAlign: 'center',
    },
    modalSpecWrapper: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    specItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    specLabel: { fontSize: 11, color: '#999' },
    specValue: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 2 },
    reviewSectionCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE6A3',
    },
    reviewCardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#D4A017',
        marginBottom: 6,
    },
    modalStarsRow: { flexDirection: 'row', marginBottom: 6 },
    reviewCommentBody: { fontSize: 13, color: '#555', fontStyle: 'italic' },
    modalActionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalBtnBase: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 6,
    },
    modalBtnReject: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EE2737',
    },
    modalBtnAccept: { backgroundColor: '#284B7A' },
    modalBtnTextReject: { color: '#EE2737', fontWeight: 'bold' },
    modalBtnTextAccept: { color: '#FFF', fontWeight: 'bold' },
    modalBtnSingleRoute: {
        backgroundColor: '#284B7A',
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnSingleRouteText: { color: '#FFF', fontWeight: 'bold' },
    ratingBadgeSelesai: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#387C65',
    },
    ratingBadgeDibatalkan: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#EE2737',
    },
    ratingTextSelesai: { color: '#387C65', fontWeight: 'bold' },
    ratingTextDibatalkan: { color: '#EE2737', fontWeight: 'bold' },
    ratingTextOnly: { fontSize: 12, fontWeight: 'bold' },
    ratingStarIcon: { fontSize: 14, color: '#FFB800', marginRight: 3 },
    ratingStarValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },
});

export default ActivityGuruPage;