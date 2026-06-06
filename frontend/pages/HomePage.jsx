import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, Image, TouchableOpacity,
    StatusBar, ScrollView, Dimensions, Modal, ActivityIndicator, Animated, PanResponder, RefreshControl,
} from 'react-native';

import DimmedModal from '../components/DimmedModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';
import { useAppAlert } from '../components/AppAlertProvider';
import BottomNavbar from '../components/BottomNavbar';
import { fetchMapelByJenjang } from '../services/MateriService';
import { getActiveSchedule } from '../services/historyService';
import {
    getMateriTerfavoritMurid,
    getRekomendasiMateriAcakList,
    formatJenjangTampilan,
    jenjangDariKelasMurid,
} from '../services/homeService';


import { fetchNotifikasi } from '../services/notifikasiService';
import { Calendar, BookOpen, Wallet, FileText, Search, MessageSquare, User, Home, Bell } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const LOGO_SOURCE = require('../assets/logo_humana.png');

const JENJANG_OPTIONS = ['SD', 'SMP', 'SMA'];

const SUBJECT_ICONS = {
    'Matematika': require('../assets/matematika.png'),
    'Informatika': require('../assets/informatika.png'),
    'Biologi': require('../assets/biologi.png'),
    'Kimia': require('../assets/kimia.png'),
    'Fisika': require('../assets/fisika.png'),
    'Sejarah': require('../assets/sejarah.png'),
    'Sosiologi': require('../assets/sosiologi.png'),
    'Bahasa Inggris': require('../assets/inggris.png'),
    'Bahasa Indonesia': require('../assets/indonesia.png'),
    'IPA': require('../assets/ipa.png'),
    'IPS': require('../assets/ips.png'),
};

const FONTS = {
    bold: 'SF-Pro-Display-Bold',
    regular: 'SF-Pro-Display-Regular',
};

const formatRupiah = (angka) => {
    if (!angka) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
};

/** Pemetaan sesi header guru — sama tab Jadwal Aktif di ActivityGuruPage (bukan Permintaan). */
const mapSesiKeJadwalAktifGuru = raw => {
    const status = (raw.status_pemesanan || 'dikonfirmasi').toLowerCase();
    const tipe = status === 'berlangsung' ? 'Berlangsung' : 'Aktif';
    const harga =
        raw.harga_total ||
        raw.tarif ||
        raw.bayaran ||
        ((raw.biaya_sesi || 0) + (raw.biaya_jarak || 0));
    return {
        item: {
            id: raw.id_pemesanan,
            id_pemesanan: raw.id_pemesanan,
            id_murid: raw.id_murid,
            nama_murid: raw.nama_murid,
            materi: raw.nama_materi || raw.materi?.nama_materi,
            nama_materi: raw.nama_materi || raw.materi?.nama_materi,
            nama_mapel: raw.nama_mapel || raw.mata_pelajaran?.nama_mapel,
            jenjang_pendidikan: raw.jenjang_pendidikan,
            waktu_mulai: raw.waktu_mulai,
            waktu_selesai: raw.waktu_selesai,
            waktu_string: raw.waktu_string,
            harga_total: harga,
            biaya_sesi: raw.biaya_sesi,
            biaya_jarak: raw.biaya_jarak,
            harga,
            lokasi_sesi: raw.lokasi_sesi || raw.lokasi || raw.alamat,
            status_pemesanan:
                status === 'berlangsung' ? 'berlangsung' : 'dikonfirmasi',
            tipe,
        },
        tipe,
    };
};

const HomePage = ({
    namaLengkap, email, onLogout, onSelectSubject,
    onNavigate, onPesanSesiPrefill, onLihatDetailMateri, onDetailPermintaan, onDetailSesiAktif,
    jenjangMurid, showSuccessAlert, onAlertClose, userId, userRole, kelasMurid
}) => {
    const { showInfo } = useAppAlert();
    const role = userRole ? userRole.toLowerCase() : 'murid';

    const [isMateriVisible, setIsMateriVisible] = useState(false);
    const [selectedJenjang, setSelectedJenjang] = useState(null);
    const [mapelCacheByJenjang, setMapelCacheByJenjang] = useState({});
    const [slideAnim] = useState(new Animated.Value(height));
    const [allSubjects, setAllSubjects] = useState([]);
    const [loadingMapel, setLoadingMapel] = useState(false);
    const [pendingAutoJenjang, setPendingAutoJenjang] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [materiFavorit, setMateriFavorit] = useState(null);
    const [rekomendasiList, setRekomendasiList] = useState([]);
    const [loadingMateriRekom, setLoadingMateriRekom] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false, type: 'success', title: '', message: ''
    });
    const [unreadNotif, setUnreadNotif] = useState(false);

    useEffect(() => {
        if (isMateriVisible) {
            Animated.timing(slideAnim, {
                toValue: 0, duration: 300, useNativeDriver: true,
            }).start();
        }
    }, [isMateriVisible]);

    const resetMateriSheetState = () => {
        setSelectedJenjang(null);
        setMapelCacheByJenjang({});
        setAllSubjects([]);
        setLoadingMapel(false);
        setPendingAutoJenjang(null);
    };

    const openMateriSheet = () => {
        resetMateriSheetState();
        setIsMateriVisible(true);

        if (role === 'murid') {
            const jenjang = jenjangMurid || jenjangDariKelasMurid(kelasMurid) || 'SD';
            setPendingAutoJenjang(jenjang);
        } else {
            setPendingAutoJenjang('SD');
        }
    };

    const closeMateriSheet = () => {
        Animated.timing(slideAnim, {
            toValue: height, duration: 250, useNativeDriver: true,
        }).start(() => {
            setIsMateriVisible(false);
            resetMateriSheetState();
        });
    };

    const handleSelectJenjang = async (jenjang) => {
        setSelectedJenjang(jenjang);

        if (jenjang in mapelCacheByJenjang) {
            setAllSubjects(mapelCacheByJenjang[jenjang]);
            return;
        }

        setLoadingMapel(true);
        setAllSubjects([]);
        try {
            const data = await fetchMapelByJenjang(jenjang);
            setMapelCacheByJenjang(prev => ({ ...prev, [jenjang]: data }));
            setAllSubjects(data);
        } catch (err) {
            showInfo('Error', err.message);
            setSelectedJenjang(null);
            setAllSubjects([]);
        } finally {
            setLoadingMapel(false);
        }
    };

    useEffect(() => {
        if (!isMateriVisible || !pendingAutoJenjang) return;
        handleSelectJenjang(pendingAutoJenjang);
        setPendingAutoJenjang(null);
    }, [isMateriVisible, pendingAutoJenjang]);

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

    const loadActiveSessions = useCallback(async () => {
        if (!userId || !userRole || userRole === '-') return;
        setLoadingSessions(true);
        try {
            const result = await getActiveSchedule(userRole, userId);
            if (result?.success) {
                let raw = result.data;
                if (!Array.isArray(raw)) raw = [raw];
                
                const today = new Date();
                raw = raw.filter(sesi => {
                    const tglRaw = sesi.waktu_mulai || sesi.jam_mulai;
                    if (!tglRaw) return false;
                    const tgl = new Date(tglRaw);
                    return (
                        tgl.getDate() === today.getDate() &&
                        tgl.getMonth() === today.getMonth() &&
                        tgl.getFullYear() === today.getFullYear()
                    );
                });

                setActiveSessions(raw);
            } else {
                setActiveSessions([]);
            }
        } catch {
            setActiveSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    }, [userId, userRole]);

    const loadMateriRekom = useCallback(async () => {
        if (role !== 'murid' || !userId) return;
        setLoadingMateriRekom(true);
        try {
            const [favorit, rekomendasi] = await Promise.all([
                getMateriTerfavoritMurid(userId),
                getRekomendasiMateriAcakList(5, jenjangMurid),
            ]);
            setMateriFavorit(favorit);
            setRekomendasiList(Array.isArray(rekomendasi) ? rekomendasi : []);
        } catch (err) {
            console.error('[HomePage] Gagal muat materi rekom:', err);
            setMateriFavorit(null);
            setRekomendasiList([]);
        } finally {
            setLoadingMateriRekom(false);
        }
    }, [userId, role, jenjangMurid]);

    useEffect(() => {
        loadActiveSessions();
    }, [loadActiveSessions]);

    const loadNotif = useCallback(async () => {
        if (!userId || !userRole) return;
        try {
            const resNotif = await fetchNotifikasi(role, userId);
            if (resNotif && resNotif.success && Array.isArray(resNotif.data) && resNotif.data.length > 0) {
                const maxId = Math.max(...resNotif.data.map(n => n.id_notifikasi));
                const lastRead = await AsyncStorage.getItem(`last_read_notif_${userId}`);
                if (!lastRead || maxId > parseInt(lastRead)) {
                    setUnreadNotif(true);
                } else {
                    setUnreadNotif(false);
                }
            } else {
                setUnreadNotif(false);
            }
        } catch (error) {
            setUnreadNotif(false);
        }
    }, [userId, role]);

    useEffect(() => {
        loadNotif();
    }, [loadNotif]);

    useEffect(() => {
        loadMateriRekom();
    }, [loadMateriRekom]);

    const handleRefresh = async () => {
        setRefreshing(true);
        const tasks = [loadActiveSessions(), loadNotif()];
        if (role === 'murid') tasks.push(loadMateriRekom());
        await Promise.all(tasks);
        setRefreshing(false);
    };

    useEffect(() => {
        if (showSuccessAlert) {
            setAlertConfig({ visible: true, type: 'success', title: 'Sukses!', message: 'Berhasil masuk ke akun kamu.' });
        }
    }, [showSuccessAlert]);

    const handleCloseAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        if (onAlertClose) onAlertClose();
    };


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

    // ── Render card sesi ─────────────────────────────────────────────────────
    // ── 1. RENDER ITEM UNTUK TIAP CARD SESI ───────────────────────────────────
    const renderSessionItem = ({ item: s }) => {
        const rawMulai = s.waktu_mulai || s.jam_mulai;
        const rawSelesai = s.waktu_selesai || s.jam_selesai;

        let waktu = '–';

        if (rawMulai && rawSelesai) {
            try {
                const formatTimeStr = (rawStr) => {
                    if (typeof rawStr !== 'string') return '–';
                    if (rawStr.includes('-') || rawStr.includes('T')) {
                        const dateObj = new Date(rawStr);
                        const formatZero = (num) => String(num).padStart(2, '0');
                        return `${formatZero(dateObj.getHours())}:${formatZero(dateObj.getMinutes())}`;
                    } else {
                        return rawStr.substring(0, 5).replace('.', ':');
                    }
                };
                waktu = `${formatTimeStr(rawMulai)} – ${formatTimeStr(rawSelesai)}`;
            } catch (error) {
                console.error("Gagal parsing waktu:", error);
                waktu = '–';
            }
        }

        const lokasi = s.lokasi || s.alamat || 'Alamat tidak tersedia';
        const bayaran = formatRupiah(s.tarif || s.bayaran || s.total_harga || 0);
        const gridStyle = role === 'guru' ? styles.gridCol3 : styles.gridCol2;

        // Lebar card murni dihitung dinamis agar card kedua sedikit mengintip secara estetis
        const cardWidth = width - 40;

        const bukaDetailSesi = () => {
            if (role === 'murid') {
                if (onDetailSesiAktif) onDetailSesiAktif(s);
                return;
            }
            if (role === 'guru' && onDetailPermintaan) {
                const { item, tipe } = mapSesiKeJadwalAktifGuru(s);
                onDetailPermintaan(item, tipe);
            }
        };

        const cardDapatDiklik =
            (role === 'murid' && onDetailSesiAktif) ||
            (role === 'guru' && onDetailPermintaan);

        const cardInner = (
            <View style={[styles.sessionCard, { marginBottom: 0, marginRight: 0, width: '100%' }]}>
                <Text style={styles.cardLabel}>SESI HARI INI</Text>

                    {role === 'guru' ? (
                        <View style={styles.rowCenter}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {(s.nama_murid || 'M').substring(0, 2).toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.sessionName} numberOfLines={1}>
                                    {s.nama_murid || 'Nama Murid'}
                                </Text>
                                <Text style={styles.sessionSub} numberOfLines={1}>
                                    {s.mata_pelajaran?.nama_mapel || s.nama_mapel || 'Mapel'} — {s.materi?.nama_materi || s.nama_materi || 'Materi'}
                                </Text>
                            </View>
                            <View style={styles.badgeGreen}>
                                <Text style={styles.badgeGreenText}>• Segera</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.rowCenter}>
                            {s.status_pembayaran === 'menunggu' && (
                                <View style={[styles.badgeYellow, { marginRight: 10 }]}>
                                    <Text style={styles.badgeYellowText}>Bayar</Text>
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sessionTitle} numberOfLines={2}>
                                    <Text style={{ fontFamily: FONTS.bold }}>
                                        {s.mata_pelajaran?.nama_mapel || s.nama_mapel || 'Mapel'}
                                    </Text>
                                    {' – '}{s.materi?.nama_materi || s.nama_materi || 'Materi'}
                                </Text>
                            </View>
                        </View>
                    )}


                <View style={styles.detailGrid}>
                    <View style={gridStyle}>
                        <Text style={styles.detailLabel}>Waktu</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>{waktu}</Text>
                    </View>
                    <View style={gridStyle}>
                        <Text style={styles.detailLabel}>{role === 'guru' ? 'Lokasi' : 'Guru'}</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>
                            {role === 'guru' ? lokasi : (s.nama_guru || '–')}
                        </Text>
                    </View>
                    {role === 'guru' && (
                        <View style={gridStyle}>
                            <Text style={styles.detailLabel}>Bayaran</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{bayaran}</Text>
                        </View>
                    )}
                </View>

                {role === 'guru' && (
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.btnPrimary}>
                            <Text style={styles.btnPrimaryText}>Lihat Rute</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnOutline}>
                            <Text style={styles.btnOutlineText}>Chat Murid</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );

        return (
            <View style={{ width: cardWidth, marginRight: 16 }}>
                {cardDapatDiklik ? (
                    <TouchableOpacity activeOpacity={1} onPress={bukaDetailSesi}>
                        {cardInner}
                    </TouchableOpacity>
                ) : (
                    cardInner
                )}
            </View>
        );
    };

    // ── 2. WRAPPER UTAMA FLATLIST CAROUSEL SLIDER (EFEK CENTER STANDBY) ──
    const renderSessionCard = () => {
        if (loadingSessions) {
            return (
                <View style={[styles.sessionCard, styles.centerContent, { height: 160, marginHorizontal: 20 }]}>
                    <ActivityIndicator size="small" color="#284B7A" />
                    <Text style={styles.loadingText}>Mencari sesi hari ini...</Text>
                </View>
            );
        }

        if (activeSessions.length === 0) {
            return (
                <View style={[styles.sessionCard, styles.centerContent, { paddingVertical: 36, marginHorizontal: 20 }]}>
                    <Text style={{ fontSize: 36, marginBottom: 8 }}>🏖️</Text>
                    <Text style={[styles.detailValue, { color: '#999' }]}>Tidak ada sesi hari ini.</Text>
                </View>
            );
        }

        // Berdasarkan gambar image_baea26.png, jarak kanan-kiri card ke tepi layar adalah 20px
        const SIDE_PADDING = 20;
        const cardWidth = width - 40; // Lebar card pas mengikuti sisa ruang screen
        const gapSize = 12; // Jarak renggang antar card saat di-swipe

        return (
            <Animated.FlatList
                nestedScrollEnabled
                data={activeSessions}
                renderItem={({ item }) => (
                    <View style={{ width: cardWidth, marginRight: gapSize }}>

                        {renderSessionItem({ item })}
                    </View>
                )}
                keyExtractor={(item, index) =>
                    item.id_pemesanan?.toString() || item.id_jadwal?.toString() || index.toString()
                }
                horizontal

                pagingEnabled={false}
                snapToInterval={cardWidth + gapSize}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                showsHorizontalScrollIndicator={false}

                contentContainerStyle={{
                    paddingLeft: SIDE_PADDING,
                    paddingRight: SIDE_PADDING,
                    paddingVertical: 4
                }}
            />
        );
    };
    return (
        <View style={styles.homeContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                style={styles.mainScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#284B7A']}
                        tintColor="#284B7A"
                        progressViewOffset={60}
                    />
                }
            >
                <View style={styles.headerSection}>
                    <View style={styles.headerBackground}>
                        <Image source={LOGO_SOURCE} style={styles.headerWatermark} resizeMode="contain" />
                    </View>

                    <View style={[styles.greetingContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                        <View>
                            <Text style={styles.greetingLabel}>
                                {role === 'guru' ? 'Halo,' : 'Selamat datang,'}
                            </Text>
                            <Text style={styles.greetingName}>{namaLengkap}</Text>
                        </View>
                        <TouchableOpacity onPress={() => onNavigate && onNavigate('Notifikasi')} style={{ position: 'relative', padding: 4, marginTop: 10 }}>
                            <Bell size={24} color="#FFF" />
                            {unreadNotif && <View style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', borderWidth: 1, borderColor: '#FFF' }} />}
                        </TouchableOpacity>
                    </View>

                    <View>{renderSessionCard()}</View>

                    <View style={styles.menuGrid}>
                        {role === 'guru' ? (
                            <>
                                <MenuItem icon={<Calendar color="#FFF" size={22} />} label="Jadwal Saya" onPress={() => onNavigate?.('Activity', 'aktif')} />
                                <MenuItem icon={<BookOpen color="#FFF" size={22} />} label="Materi" onPress={() => setIsMateriVisible(true)} />
                                <MenuItem icon={<Wallet color="#FFF" size={22} />} label="Pendapatan" />
                                <MenuItem icon={<FileText color="#FFF" size={22} />} label="Permintaan" />
                            </>
                        ) : (
                            <>
                                <MenuItem icon={<Image source={require('../assets/pesansesi.png')} style={{ width: 37, height: 40, tintColor: '#FFF' }} />} label="Pesan Sesi" onPress={() => onNavigate?.('PesanSesi')} />
                                <MenuItem icon={<Image source={require('../assets/materi.png')} style={{ width: 35, height: 35, tintColor: '#FFF' }} />} label="Materi" onPress={openMateriSheet} />
                                <MenuItem icon={<Image source={require('../assets/kalender.png')} style={{ width: 35, height: 35, tintColor: '#FFF' }} />} label="Jadwal Saya" onPress={() => onNavigate?.('Activity', 'aktif')} />
                            </>
                        )}
                    </View>

                    <View style={styles.divider} />
                </View>

                {role === 'guru' ? (
                    <View style={styles.sectionPadding}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>PERMINTAAN BARU</Text>
                            <TouchableOpacity><Text style={styles.linkText}>Lihat Semua</Text></TouchableOpacity>
                        </View>
                        <View style={styles.sessionCard}>
                            <View style={styles.rowCenter}>
                                <View style={[styles.avatar, { backgroundColor: '#1E3A8A' }]}>
                                    <Text style={styles.avatarText}>SN</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.sessionName} numberOfLines={1}>Sandres Naufal</Text>
                                    <Text style={styles.sessionSub} numberOfLines={1}>Matematika — Relasi & Fungsi</Text>
                                </View>
                                <View style={styles.badgeYellow}>
                                    <Text style={styles.badgeYellowText}>• Baru</Text>
                                </View>
                            </View>
                            <View style={styles.detailGrid}>
                                <View style={styles.gridCol3}>
                                    <Text style={styles.detailLabel}>Waktu</Text>
                                    <Text style={styles.detailValue}>13.00 – 15.00</Text>
                                </View>
                                <View style={styles.gridCol3}>
                                    <Text style={styles.detailLabel}>Lokasi</Text>
                                    <Text style={styles.detailValue}>Jl. Cihampelas No.12</Text>
                                </View>
                                <View style={styles.gridCol3}>
                                    <Text style={styles.detailLabel}>Bayaran</Text>
                                    <Text style={styles.detailValue}>{formatRupiah(34000)}</Text>
                                </View>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.btnDanger}>
                                    <Text style={styles.btnDangerText}>Tolak</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnPrimary}>
                                    <Text style={styles.btnPrimaryText}>Terima</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.sectionPadding}>
                        {loadingMateriRekom ? (
                            <View style={[styles.centerContent, { paddingVertical: 32 }]}>
                                <ActivityIndicator size="small" color="#284B7A" />
                                <Text style={styles.loadingText}>Memuat rekomendasi...</Text>
                            </View>
                        ) : (
                            <>
                                {materiFavorit ? (
                                    <>
                                        <Text style={styles.sectionTitle}>PESAN LAGI</Text>
                                        <View style={styles.pesanLagiCard}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.pesanLagiSub}>Lanjutkan sesi favoritmu</Text>
                                                <Text style={styles.pesanLagiTitle} numberOfLines={2}>
                                                    <Text style={{ fontFamily: FONTS.bold }}>
                                                        {materiFavorit.nama_mapel}
                                                    </Text>
                                                    {' - '}{materiFavorit.nama_materi}
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.pesanBtn}
                                                    onPress={() => {
                                                        if (materiFavorit.prefill && onPesanSesiPrefill) {
                                                            onPesanSesiPrefill(materiFavorit.prefill);
                                                        } else {
                                                            onNavigate?.('PesanSesi');
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.pesanBtnText}>Pesan Sesi →</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.pesanDecor}>
                                                <Text style={styles.mathSymbols}>+ ={'\n'}- x</Text>
                                            </View>
                                        </View>
                                    </>
                                ) : null}

                                <View style={[styles.sectionHeader, styles.sectionHeaderRekom, { marginTop: materiFavorit ? 28 : 0 }]}>
                                    <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>REKOMENDASI MATERI</Text>
                                    <TouchableOpacity onPress={() => setIsMateriVisible(true)}>
                                        <Text style={styles.linkText}>Lihat Semua</Text>
                                    </TouchableOpacity>
                                </View>

                                {rekomendasiList.length > 0 ? (
                                    rekomendasiList.map(item => (
                                        <View key={item.id_materi} style={styles.rekomendasiCard}>
                                            <View style={styles.rekomendasiIcon}>
                                                {/* ✅ DIUBAH: Menggunakan Image langsung dan ukurannya diperbesar sesuai mockup gambar image_a5d046.png */}
                                                <Image
                                                    source={require('../assets/daftarmateri.png')}
                                                    style={{ width: 44, height: 44, resizeMode: 'contain' }}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.rekomendasiTitle} numberOfLines={1}>
                                                    {item.nama_materi}
                                                </Text>
                                                <Text style={styles.rekomendasiSub} numberOfLines={1}>
                                                    {formatJenjangTampilan(item.jenjang, item.jurusan) || item.nama_mapel}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.btnLihatDetail}
                                                onPress={() => {
                                                    if (item.chapterData && onLihatDetailMateri) {
                                                        onLihatDetailMateri(
                                                            { ...item.chapterData, kelas_formatted: item.kelas, jenjang: item.jenjang },
                                                            { id_mapel: item.id_mapel, subjectName: item.nama_mapel, nama_mapel: item.nama_mapel }
                                                        );
                                                    }
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.btnLihatDetailText}>Lihat Detail</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyRekomText}>Belum ada materi untuk ditampilkan.</Text>
                                )}
                            </>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navbar */}
            <BottomNavbar
                currentScreen="Home"
                onNavigate={onNavigate}
                userRole={userRole}
            />

            <CustomAlert
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={handleCloseAlert}
            />

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
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.jenjangChipRow}>
                                {JENJANG_OPTIONS.map(jenjang => (
                                    <TouchableOpacity
                                        key={jenjang}
                                        style={[
                                            styles.jenjangChip,
                                            selectedJenjang === jenjang && styles.jenjangChipActive,
                                        ]}
                                        onPress={() => handleSelectJenjang(jenjang)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.jenjangChipText,
                                                selectedJenjang === jenjang && styles.jenjangChipTextActive,
                                            ]}
                                        >
                                            {jenjang}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {!selectedJenjang ? (
                                <Text style={styles.emptyText}>
                                    Pilih jenjang untuk melihat mata pelajaran.
                                </Text>
                            ) : loadingMapel ? (
                                <View style={[styles.centerContent, { paddingVertical: 40 }]}>
                                    <ActivityIndicator size="large" color="#284B7A" />
                                    <Text style={styles.loadingText}>Memuat pelajaran...</Text>
                                </View>
                            ) : (
                                <View style={styles.subjectGrid}>
                                    {allSubjects.length > 0
                                        ? allSubjects.map(renderSubjectItem)
                                        : (
                                            <Text style={styles.emptyText}>
                                                {`Tidak ada mata pelajaran untuk jenjang ${selectedJenjang}.`}
                                            </Text>
                                        )
                                    }
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const MenuItem = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconBox}>{icon}</View>
        <Text style={styles.menuLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    homeContainer: { flex: 1, backgroundColor: '#F5F7FA' },
    mainScroll: { flex: 1 },
    scrollContent: { paddingBottom: 110 },
    headerSection: { position: 'relative', zIndex: 1 },
    sectionPadding: { paddingHorizontal: 20, marginBottom: 4 },
    centerContent: { justifyContent: 'center', alignItems: 'center' },

    headerBackground: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 290, backgroundColor: '#284B7A',
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden',
    },
    headerWatermark: {
        position: 'absolute', right: -20, top: -10,
        width: 240, height: 240, tintColor: '#FFF', opacity: 0.06,
    },

    greetingContainer: { marginTop: 100, paddingHorizontal: 35, marginBottom: 24 },
    greetingLabel: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 2,
    },
    greetingName: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 32, color: '#FFF', lineHeight: 38,
    },

    sessionCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 14, paddingLeft: 20,
        elevation: 1, shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        marginBottom: 8,
    },
    cardLabel: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 10, color: '#A9A9A9', letterSpacing: 1.2, marginBottom: 8,
    },
    sessionTitle: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 17, color: '#1A1A2E', marginBottom: 8, lineHeight: 22,
    },
    sessionName: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 15, color: '#1A1A2E',
    },
    sessionSub: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 12, color: '#777', marginTop: 1,
    },

    rowCenter: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },

    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontFamily: 'SF-Pro-Display-Bold', color: '#FFF', fontSize: 13 },

    badgeGreen: { backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#4CAF50' },
    badgeGreenText: { fontFamily: 'SF-Pro-Display-Bold', color: '#4CAF50', fontSize: 11 },
    badgeRed: { backgroundColor: '#FFEEEE', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E53935' },
    badgeRedText: { fontFamily: 'SF-Pro-Display-Bold', color: '#E53935', fontSize: 11 },
    badgeYellow: { backgroundColor: '#FFFDE7', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
    badgeYellowText: { fontFamily: 'SF-Pro-Display-Bold', color: '#F9A825', fontSize: 11 },

    detailGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', marginTop: 16,
    },
    gridCol3: { width: '30%', minWidth: 76 },
    gridCol2: { width: '45%' },
    detailLabel: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 12, color: '#ABABAB', marginBottom: 4,
    },
    detailValue: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 15, color: '#1A1A2E', lineHeight: 19,
    },

    cardActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
    btnPrimary: {
        flex: 1, backgroundColor: '#284B7A', height: 42,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    },
    btnPrimaryText: { fontFamily: 'SF-Pro-Display-Bold', color: '#FFF', fontSize: 13 },
    btnOutline: {
        flex: 1, backgroundColor: '#FFF', height: 42,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E0E5ED',
    },
    btnOutlineText: { fontFamily: 'SF-Pro-Display-Bold', color: '#284B7A', fontSize: 13 },
    btnDanger: {
        flex: 1, backgroundColor: '#FFEEEE', height: 42,
        borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    },
    btnDangerText: { fontFamily: 'SF-Pro-Display-Bold', color: '#E53935', fontSize: 13 },

    menuGrid: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingHorizontal: 25, marginTop: 28, marginBottom: 0,
    },
    menuItem: { alignItems: 'center', width: '22%' },
    menuIconBox: {
        width: 65, height: 65, backgroundColor: '#3A7D6B',
        borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    menuLabel: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 11, color: '#333', textAlign: 'center',
    },

    divider: {
        height: 1,
        backgroundColor: '#EAEEF3',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
    },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionHeaderRekom: { marginBottom: 4 },
    sectionTitle: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 11, color: '#ABABAB', letterSpacing: 1, marginBottom: 10,
    },
    sectionTitleCompact: { marginBottom: 0 },
    linkText: { fontFamily: 'SF-Pro-Display-Bold', fontSize: 12, color: '#284B7A' },

    pesanLagiCard: {
        backgroundColor: '#284B7A', borderRadius: 20, padding: 22,
        flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    },
    pesanLagiSub: {
        fontFamily: 'SF-Pro-Display-Regular',
        color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 6,
    },
    pesanLagiTitle: {
        fontFamily: 'SF-Pro-Display-Regular',
        color: '#FFF', fontSize: 17, marginBottom: 16, lineHeight: 23,
    },
    pesanBtn: {
        backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, alignSelf: 'flex-start',
    },
    pesanBtnText: { fontFamily: 'SF-Pro-Display-Bold', color: '#284B7A', fontSize: 12 },
    pesanDecor: { position: 'absolute', right: -8, bottom: -8 },
    mathSymbols: {
        fontSize: 48, fontFamily: 'SF-Pro-Display-Bold',
        color: 'rgba(255,255,255,0.08)', lineHeight: 48,
    },

    rekomendasiCard: {
        marginTop: 4,
        marginBottom: 2,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEEF3',
    },
    btnLihatDetail: {
        backgroundColor: '#284B7A',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginLeft: 8,
    },
    btnLihatDetailText: {
        fontFamily: 'SF-Pro-Display-Bold',
        color: '#FFF',
        fontSize: 11,
    },
    // ✅ DIUBAH: Latar belakang warna biru/abu-abu kotak pembungkus ditiadakan (transparan murni) sesuai mockup
    rekomendasiIcon: {
        width: 44, height: 44,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    rekomendasiTitle: { fontFamily: 'SF-Pro-Display-Bold', fontSize: 14, color: '#1A1A2E', marginBottom: 2 },
    rekomendasiSub: { fontFamily: 'SF-Pro-Display-Regular', fontSize: 12, color: '#999' },
    emptyRekomText: {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 13,
        color: '#ABABAB',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },

    navbar: {
        position: 'absolute', bottom: 0, width: '100%', height: 72,
        backgroundColor: '#FFF', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderColor: '#EAEEF3', paddingHorizontal: 10,
    },
    navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navLabel: { fontFamily: 'SF-Pro-Display-Regular', fontSize: 10, color: '#A9A9A9', marginTop: 4 },
    navLabelActive: { fontFamily: 'SF-Pro-Display-Bold', color: '#284B7A' },
    fabContainer: { alignItems: 'center', width: 72, height: 78, top: -14 },
    fab: {
        width: 52, height: 52, borderRadius: 26, backgroundColor: '#284B7A',
        justifyContent: 'center', alignItems: 'center',
        elevation: 6, shadowColor: '#284B7A',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 6,
    },
    fabIcon: { width: 24, height: 24, tintColor: '#FFF' },
    fabLabel: { fontFamily: 'SF-Pro-Display-Bold', fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4 },

    loadingText: { fontFamily: 'SF-Pro-Display-Regular', marginTop: 10, color: '#999', fontSize: 12 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    bottomSheet: {
        backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 8, maxHeight: '85%',
        paddingBottom: 100, marginBottom: -60,
    },
    sheetHandleArea: { width: '100%', alignItems: 'center', paddingVertical: 12 },
    sheetHandle: { width: 44, height: 4, backgroundColor: '#DDE2EA', borderRadius: 2 },
    jenjangChipRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 8,
    },
    jenjangChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F3F8',
    },
    jenjangChipActive: { backgroundColor: '#284B7A' },
    jenjangChipText: {
        fontFamily: 'SF-Pro-Display-Bold',
        fontSize: 13,
        color: '#666',
    },
    jenjangChipTextActive: { color: '#FFF' },
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

export default HomePage;