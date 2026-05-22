import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, Image, TouchableOpacity,
    StatusBar, ScrollView, Dimensions, Modal, ActivityIndicator
} from 'react-native';

import CustomAlert from '../components/CustomAlert';
import { fetchAllMapel } from '../services/MateriService';
import { getActiveSchedule } from '../services/historyService';

// Import Ikon Lucide untuk kebutuhan UI Menu Kotak & Bottom Nav baru
import { Calendar, BookOpen, Wallet, FileText, Search, MessageSquare, User, Home } from 'lucide-react-native';

// Ambil dimensi layar untuk kalkulasi responsive
const { width, height } = Dimensions.get('window');
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

const formatRupiah = (angka) => {
    if (!angka) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
};

const HomePage = ({ namaLengkap, email, onLogout, onSelectSubject, onNavigate, showSuccessAlert, onAlertClose, userId, userRole }) => {
    const role = userRole ? userRole.toLowerCase() : 'murid';
    const firstName = namaLengkap ? namaLengkap.split(' ')[0] : (role === 'guru' ? 'Guru' : 'Murid');
    
    const [isMateriVisible, setIsMateriVisible] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const [loadingMapel, setLoadingMapel] = useState(false);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false, type: 'success', title: '', message: ''
    });

    // Load Mapel
    useEffect(() => {
        if (isMateriVisible) {
            const loadMapel = async () => {
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
            loadMapel();
        }
    }, [isMateriVisible]);

    // Load Jadwal Aktif
    useEffect(() => {
        const fetchActiveSessions = async () => {
            if (!userId || !userRole || userRole === '-') return;
            setLoadingSessions(true);
            try {
                const result = await getActiveSchedule(userRole, userId);
                if (result && result.success) {
                    const rawData = result.data;
                    setActiveSessions(Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []));
                } else {
                    setActiveSessions([]);
                }
            } catch (error) {
                console.log("Error fetch active sessions di Home:", error);
                setActiveSessions([]);
            } finally {
                setLoadingSessions(false);
            }
        };
        fetchActiveSessions();
    }, [userId, userRole]);

    // Alert Login Sukses
    useEffect(() => {
        if (showSuccessAlert) {
            setAlertConfig({
                visible: true, type: 'success', title: 'Sukses!', message: 'Berhasil masuk ke akun kamu.'
            });
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
                    setIsMateriVisible(false);
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
        <View style={styles.homeContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
                {/* Header Background */}
                <View style={styles.headerBackground}>
                    <Image source={LOGO_SOURCE} style={styles.headerWatermark} resizeMode="contain" />
                </View>

                {/* Greeting */}
                <View style={styles.greetingContainer}>
                    {role === 'guru' ? (
                        <Text style={styles.homeGreetingText}>Halo,{"\n"}{namaLengkap}!</Text>
                    ) : (
                        <Text style={styles.homeGreetingText}>Selamat datang,{"\n"}{firstName} !</Text>
                    )}
                </View>

                {/* ========================================================= */}
                {/* CARD UTAMA / CARD SESI HARI INI */}
                {/* ========================================================= */}
                <View style={styles.scheduleContainer}>
                    {loadingSessions ? (
                        <View style={[styles.mainSessionCard, { justifyContent: 'center', alignItems: 'center', height: 160 }]}>
                            <ActivityIndicator size="small" color="#284B7A" />
                            <Text style={{ marginTop: 10, color: '#888', fontSize: 12 }}>Mencari sesi hari ini...</Text>
                        </View>
                    ) : activeSessions.length > 0 ? (
                        (() => {
                            const currentSession = activeSessions[0];
                            
                            const waktuSesi = currentSession.jam_mulai && currentSession.jam_selesai 
                                ? `${currentSession.jam_mulai.substring(0, 5)} – ${currentSession.jam_selesai.substring(0, 5)}`
                                : '06.30 – 09.30';
                                
                            const lokasiSesi = currentSession.lokasi || currentSession.alamat || 'Alamat tidak tersedia';
                            const bayaranSesi = formatRupiah(currentSession.tarif || currentSession.bayaran || currentSession.total_harga || 34000);

                            // Mengatur jumlah kolom grid detail secara dinamis berdasarkan role
                            const gridItemStyle = role === 'guru' ? styles.gridDetailItemTigaKolom : styles.gridDetailItemDuaKolom;

                            return (
                                <View style={styles.mainSessionCard}>
                                    <Text style={styles.scheduleSubHeader}>SESI HARI INI</Text>
                                    
                                    {role === 'guru' ? (
                                        <View style={styles.guruUserHeaderRow}>
                                            <View style={styles.avatarCircle}>
                                                <Text style={styles.avatarText}>
                                                    {(currentSession.nama_murid || 'Murid').substring(0, 2).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={styles.sessionTargetName} numberOfLines={1}>{currentSession.nama_murid || 'Nama Murid'}</Text>
                                                <Text style={styles.sessionSubjectSub} numberOfLines={1}>{currentSession.mata_pelajaran?.nama_mapel || currentSession.nama_mapel || 'Matematika'} — {currentSession.materi?.nama_materi || currentSession.nama_materi || 'Relasi & Fungsi'}</Text>
                                            </View>
                                            <View style={styles.badgeSegera}><Text style={styles.badgeSegeraText}>• Segera</Text></View>
                                        </View>
                                    ) : (
                                        <Text style={styles.scheduleTitle} numberOfLines={2}>
                                            <Text style={{ fontWeight: 'bold' }}>
                                                {currentSession.mata_pelajaran?.nama_mapel || currentSession.nama_mapel || 'Matematika'}
                                            </Text> - {currentSession.materi?.nama_materi || currentSession.nama_materi || 'Relasi & Fungsi'}
                                        </Text>
                                    )}

                                    {/* RESPONSIVE DETAIL GRID */}
                                    <View style={styles.scheduleDetailsGrid}>
                                        <View style={gridItemStyle}>
                                            <Text style={styles.scheduleLabel}>Waktu</Text>
                                            <Text style={styles.scheduleValue} numberOfLines={1} adjustsFontSizeToFit>{waktuSesi}</Text>
                                        </View>
                                        <View style={gridItemStyle}>
                                            <Text style={styles.scheduleLabel}>{role === 'guru' ? 'Lokasi' : 'Guru'}</Text>
                                            <Text style={styles.scheduleValue} numberOfLines={2} adjustsFontSizeToFit>
                                                {role === 'guru' ? lokasiSesi : (currentSession.nama_guru || 'Ahmad Pambudi, S.Pd.')}
                                            </Text>
                                        </View>
                                        {role === 'guru' && (
                                            <View style={gridItemStyle}>
                                                <Text style={styles.scheduleLabel}>Bayaran</Text>
                                                <Text style={styles.scheduleValue} numberOfLines={1} adjustsFontSizeToFit>{bayaranSesi}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {role === 'guru' && (
                                        <View style={styles.guruActionCardButtons}>
                                            <TouchableOpacity style={styles.btnLihatRute}><Text style={styles.btnLihatRuteText}>Lihat Rute</Text></TouchableOpacity>
                                            <TouchableOpacity style={styles.btnChatTarget}><Text style={styles.btnChatTargetText}>Chat Murid</Text></TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        })()
                    ) : (
                        <View style={[styles.mainSessionCard, { justifyContent: 'center', alignItems: 'center', paddingVertical: 30 }]}>
                            <Text style={{ fontSize: 35, marginBottom: 5 }}>🏖️</Text>
                            <Text style={{ color: '#888', fontSize: 13, fontWeight: 'bold' }}>Tidak ada sesi hari ini.</Text>
                        </View>
                    )}
                </View>

                {/* ========================================================= */}
                {/* GRID MENU KOTAK */}
                {/* ========================================================= */}
                <View style={styles.emeraldMenuGrid}>
                    {role === 'guru' ? (
                        <>
                            <TouchableOpacity style={styles.emeraldMenuItem} onPress={() => onNavigate && onNavigate('Activity', 'aktif')}>
                                <View style={styles.emeraldIconBox}><Calendar color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Jadwal Saya</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emeraldMenuItem} onPress={() => setIsMateriVisible(true)}>
                                <View style={styles.emeraldIconBox}><BookOpen color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Materi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emeraldMenuItem}>
                                <View style={styles.emeraldIconBox}><Wallet color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Pendapatan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emeraldMenuItem}>
                                <View style={styles.emeraldIconBox}><FileText color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Permintaan</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.emeraldMenuItem} onPress={() => onNavigate && onNavigate('PesanSesi')}>
                                <View style={styles.emeraldIconBox}><Search color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Pesan Sesi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emeraldMenuItem} onPress={() => setIsMateriVisible(true)}>
                                <View style={styles.emeraldIconBox}><BookOpen color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Materi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.emeraldMenuItem} onPress={() => onNavigate && onNavigate('Activity', 'aktif')}>
                                <View style={styles.emeraldIconBox}><Calendar color="#FFF" size={24} /></View>
                                <Text style={styles.emeraldMenuText} numberOfLines={1}>Jadwal Saya</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.horizontalDivider} />

                {/* ========================================================= */}
                {/* AREA BAWAH COMPONENT (PERMINTAAN GURU / REKOMENDASI MURID) */}
                {/* ========================================================= */}
                {role === 'guru' ? (
                    <View style={styles.bottomSectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitleHeader}>PERMINTAAN BARU</Text>
                            <TouchableOpacity><Text style={styles.linkLihatSemua}>Lihat Semua</Text></TouchableOpacity>
                        </View>

                        <View style={styles.requestCard}>
                            <View style={styles.guruUserHeaderRow}>
                                <View style={[styles.avatarCircle, { backgroundColor: '#1E3A8A' }]}>
                                    <Text style={styles.avatarText}>SN</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.sessionTargetName} numberOfLines={1}>Sandres Naufal</Text>
                                    <Text style={styles.sessionSubjectSub} numberOfLines={1}>Matematika — Relasi & Fungsi</Text>
                                </View>
                                <View style={styles.badgeBaru}><Text style={styles.badgeBaruText}>• Baru</Text></View>
                            </View>
                            
                            {/* RESPONSIVE GRID UNTUK REQUEST CARD */}
                            <View style={styles.scheduleDetailsGrid}>
                                <View style={styles.gridDetailItemTigaKolom}>
                                    <Text style={styles.scheduleLabel}>Waktu</Text>
                                    <Text style={styles.scheduleValue} numberOfLines={1} adjustsFontSizeToFit>13.00 – 15.00</Text>
                                </View>
                                <View style={styles.gridDetailItemTigaKolom}>
                                    <Text style={styles.scheduleLabel}>Lokasi</Text>
                                    <Text style={styles.scheduleValue} numberOfLines={2} adjustsFontSizeToFit>Jl. Cihampelas No.12</Text>
                                </View>
                                <View style={styles.gridDetailItemTigaKolom}>
                                    <Text style={styles.scheduleLabel}>Bayaran</Text>
                                    <Text style={styles.scheduleValue} numberOfLines={1} adjustsFontSizeToFit>{formatRupiah(34000)}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.requestActionButtonsRow}>
                                <TouchableOpacity style={styles.btnTolak}><Text style={styles.btnTolakText}>Tolak</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.btnTerima}><Text style={styles.btnTerimaText}>Terima</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.bottomSectionContainer}>
                        <Text style={styles.sectionTitleHeader}>PESAN LAGI</Text>
                        <View style={styles.pesanLagiCard}>
                            <View style={styles.pesanLagiContent}>
                                <Text style={styles.pesanLagiSubtitle}>Lanjutkan sesi favoritmu</Text>
                                <Text style={styles.pesanLagiTitle} numberOfLines={2}><Text style={{ fontWeight: 'bold' }}>Matematika</Text> - Relasi & Fungsi</Text>
                                <TouchableOpacity style={styles.pesanSesiBtn} onPress={() => onNavigate && onNavigate('PesanSesi')}><Text style={styles.pesanSesiBtnText}>Pesan Sesi →</Text></TouchableOpacity>
                            </View>
                            <View style={styles.pesanLagiGraphic}><Text style={styles.mathSymbols}>+ ={"\n"}- x</Text></View>
                        </View>

                        <View style={[styles.sectionHeaderRow, { marginTop: 25 }]}>
                            <Text style={styles.sectionTitleHeader}>REKOMENDASI MATERI</Text>
                            <TouchableOpacity><Text style={styles.linkLihatSemua}>Lihat Semua</Text></TouchableOpacity>
                        </View>

                        <View style={styles.rekomendasiCard}>
                            <View style={styles.rekomendasiIconWrapper}>
                                <BookOpen color="#333" size={24} />
                            </View>
                            <View style={styles.rekomendasiTextContainer}>
                                <Text style={styles.rekomendasiCardTitle} numberOfLines={1}>Aljabar Linear</Text>
                                <Text style={styles.rekomendasiCardSubtitle} numberOfLines={1}>Sekolah Menengah Atas</Text>
                            </View>
                            <TouchableOpacity style={styles.lihatMateriBtn} onPress={() => setIsMateriVisible(true)}>
                                <Text style={styles.lihatMateriBtnText}>Lihat Materi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* ========================================================= */}
            {/* BOTTOM NAVBAR */}
            {/* ========================================================= */}
            <View style={styles.customBottomNavbar}>
                <TouchableOpacity style={styles.navBarItem}>
                    <Home color="#284B7A" size={22} />
                    <Text style={[styles.navBarLabel, { color: '#284B7A', fontWeight: 'bold' }]}>
                        {role === 'guru' ? 'Home' : 'Beranda'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Activity', 'aktif')}>
                    <Calendar color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>
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

            <CustomAlert visible={alertConfig.visible} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onClose={handleCloseAlert} />

            {/* Modal Bottom Sheet */}
            <Modal visible={isMateriVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMateriVisible(false)} />
                    <View style={styles.bottomSheetContainer}>
                        <View style={styles.sheetHandle} />
                        {loadingMapel ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#284B7A" />
                                <Text style={styles.loadingText}>Memuat pelajaran...</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.sheetSectionTitle}>Semua Pelajaran</Text>
                                <View style={styles.subjectGrid}>
                                    {allSubjects.length > 0 ? allSubjects.map(renderSubjectItem) : (
                                        <Text style={{color: '#888', marginLeft: 10}}>Tidak ada data mata pelajaran.</Text>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    homeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
    headerBackground: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: 280, 
    backgroundColor: '#284B7A', 
    borderBottomLeftRadius: 50,  
    borderBottomRightRadius: 50, 
    overflow: 'hidden' 
},
    headerWatermark: { position: 'absolute', right: -30, top: -10, width: 260, height: 260, tintColor: '#FFFFFF', opacity: 0.05 },
    greetingContainer: { marginTop: 65, paddingHorizontal: 25 },
    homeGreetingText: { fontSize: 30, fontWeight: 'bold', color: '#FFF', lineHeight: 38 },
    
    scheduleContainer: { marginTop: 25, paddingHorizontal: 20 },
    mainSessionCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    scheduleSubHeader: { fontSize: 11, color: '#A9A9A9', fontWeight: 'bold', marginBottom: 12, letterSpacing: 0.5 },
    scheduleTitle: { fontSize: 18, color: '#222', marginBottom: 15, fontWeight: '500' },
    
    guruUserHeaderRow: { flexDirection: 'row', alignItems: 'center' },
    avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    sessionTargetName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    sessionSubjectSub: { fontSize: 12, color: '#666', marginTop: 2 },
    
    badgeSegera: { backgroundColor: '#E8F5E9', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    badgeSegeraText: { color: '#4CAF50', fontSize: 11, fontWeight: 'bold' },
    badgeBaru: { backgroundColor: '#FFF9C4', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    badgeBaruText: { color: '#FBC02D', fontSize: 11, fontWeight: 'bold' },

    scheduleDetailsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginTop: 15, 
        width: '100%' 
    },
    gridDetailItemTigaKolom: { 
        width: '30%', 
        minWidth: 80 
    },
    gridDetailItemDuaKolom: { 
        width: '45%' 
    },
    scheduleLabel: { fontSize: 11, color: '#A9A9A9', marginBottom: 4 },
    scheduleValue: { fontSize: 13, color: '#222', fontWeight: 'bold', lineHeight: 16 },

    guruActionCardButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    btnLihatRute: { flex: 1, backgroundColor: '#284B7A', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnLihatRuteText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
    btnChatTarget: { flex: 1, backgroundColor: '#FFF', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
    btnChatTargetText: { color: '#284B7A', fontSize: 13, fontWeight: 'bold' },

    emeraldMenuGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 5, marginTop: 30 },
    emeraldMenuItem: { alignItems: 'center', width: '22%' },
    emeraldIconBox: { width: 50, height: 50, backgroundColor: '#2D6A4F', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    emeraldMenuText: { fontSize: 11, color: '#222', fontWeight: 'bold', textAlign: 'center' },

    horizontalDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 20, marginTop: 25, marginBottom: 20 },

    bottomSectionContainer: { paddingHorizontal: 20, marginBottom: 15 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitleHeader: { fontSize: 12, color: '#777', fontWeight: 'bold', letterSpacing: 0.5 },
    linkLihatSemua: { fontSize: 12, color: '#284B7A', fontWeight: 'bold' },

    requestCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    requestActionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
    btnTolak: { flex: 1, backgroundColor: '#FF8A8A', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnTolakText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
    btnTerima: { flex: 1, backgroundColor: '#284B7A', height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnTerimaText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    pesanLagiCard: { backgroundColor: '#284B7A', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
    pesanLagiContent: { flex: 1 },
    pesanLagiSubtitle: { color: '#D0E1F9', fontSize: 12, marginBottom: 5 },
    pesanLagiTitle: { color: '#FFF', fontSize: 15, marginBottom: 15 },
    pesanSesiBtn: { backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignSelf: 'flex-start' },
    pesanSesiBtnText: { color: '#284B7A', fontSize: 12, fontWeight: 'bold' },
    pesanLagiGraphic: { position: 'absolute', right: -10, bottom: -10 },
    mathSymbols: { fontSize: 45, fontWeight: 'bold', color: 'rgba(255,255,255,0.1)', lineHeight: 45 },

    rekomendasiCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
    rekomendasiIconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rekomendasiTextContainer: { flex: 1 },
    rekomendasiCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    rekomendasiCardSubtitle: { fontSize: 12, color: '#888' },
    lihatMateriBtn: { backgroundColor: '#284B7A', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 10 },
    lihatMateriBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    customBottomNavbar: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEF0F2', paddingHorizontal: 10 },
    navBarItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
    centerFabContainer: { alignItems: 'center', width: 75, height: 80, top: -16 },
    centerFabButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#284B7A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
    centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
    centerFabLabelText: { fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    bottomSheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 15, maxHeight: '85%' },
    sheetHandle: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    sheetSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
    subjectItemContainer: { width: '25%', alignItems: 'center', marginBottom: 20 },
    subjectIconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8, backgroundColor: '#F5F5F5' },
    subjectIconImage: { width: 50, height: 50, borderRadius: 12 },
    subjectItemText: { fontSize: 11, color: '#333', fontWeight: '500', textAlign: 'center' },
    loadingContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    loadingText: { fontSize: 13, color: '#888' },
});

export default HomePage;