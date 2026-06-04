import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Switch,
    Alert,
    Image,
    RefreshControl,
} from 'react-native';
import {
    Settings,
    Edit2,
    Briefcase,
    Plus,
    Trash2,
    Home,
    Activity,
    MessageCircle,
    User,
} from 'lucide-react-native';
import { updateAvailabilityProfile } from '../services/editProfileService';
import { fetchGuruRating } from '../services/feedbackService';
import { portfolioService } from '../services/portfolioService';
import { fetchSesiDikonfirmasi } from '../services/matchingService';
import BottomNavbar from '../components/BottomNavbar';
import { materiGuruService } from '../services/materiGuruService';

// Import asset logo yang sama dengan HomePage.jsx
const LOGO_SOURCE = require('../assets/logo_humana.png');

const ProfileGuruPage = ({ guruData, onNavigate, onLogout, onRefreshData }) => {
    const [isAktif, setIsAktif] = useState(
        guruData?.is_active === 1 ||
        guruData?.is_active === true ||
        guruData?.isActive === 1 ||
        guruData?.isActive === true,
    );

    const idGuru = guruData?.id || guruData?.id_guru;

    // Tambahan: State untuk RefreshControl
    const [refreshing, setRefreshing] = useState(false);

    // Fungsi untuk memuat data profil murni dari database
    const loadLatestProfileData = useCallback(async () => {
        if (!idGuru) return;
        console.log(idGuru);
        const response = await fetchGuruRating(idGuru);
        if (response && response.success) {
            // Sinkronisasikan data ke Parent State/Context utama aplikasi
            if (onRefreshData) {
                onRefreshData(response.data);
            }
        }
    }, [idGuru, onRefreshData]);

    useEffect(() => {
        if (guruData) {
            setIsAktif(guruData.is_active === 1 || guruData.is_active === true);
        }
    }, [guruData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Memuat ulang semua data yang diperlukan
        await Promise.all([
            loadLatestProfileData(),
            loadPortofolios(),
            loadSesiHariIni(),
            loadMateriDiajar()
        ]);
        setRefreshing(false);
    };

    const handleToggleAvailability = async newValue => {
        const idGuruTerpilih = guruData?.id || guruData?.id_guru; 
        if (!idGuruTerpilih) {
            Alert.alert(
                'Data Tidak Valid',
                'Gagal memperbarui database. ID Guru tidak ditemukan.',
            );
            return;
        }

        setIsAktif(newValue);

        const result = await updateAvailabilityProfile(idGuruTerpilih, newValue);

        if (result && result.success) {
            setIsAktif(newValue);

            if (onRefreshData) {
                onRefreshData({
                    ...guruData,
                    is_active: newValue,
                });
            }

            Alert.alert(
                'Sukses',
                `Status Anda kini ${newValue ? 'Aktif menerima murid' : 'Nonaktif'}.`,
            );
        } else {
            console.log('⚠️ Masuk ke blok ELSE (Gagal/Mental Balik)');
            setIsAktif(!newValue);
            Alert.alert('Eror', 'Gagal mengubah status di server. Coba lagi nanti.');
        }
    };

    const [portofolios, setPortofolios] = useState([]);
    const [materiDiajar, setMateriDiajar] = useState([]);

    const [newJudul, setNewJudul] = useState('');
    const [newDeskripsi, setNewDeskripsi] = useState('');
    const [newTipe, setNewTipe] = useState('');
    const [newBukti, setNewBukti] = useState('');
    const [openTipe, setOpenTipe] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newTanggalMulai, setNewTanggalMulai] = useState('');
    const [newTanggalSelesai, setNewTanggalSelesai] = useState('');
    const [sesiHariIni, setSesiHariIni] = useState(0);

    const tipeOptions = [
        'Penghargaan',
        'Pengalaman',
        'Sertifikat',
        'Karya',
        'Pendidikan',
    ];

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

    const handleAddPorto = async () => {
        if (
            !newJudul.trim() ||
            !newDeskripsi.trim() ||
            !newTipe ||
            !newBukti.trim() ||
            !newTanggalMulai.trim() ||
            !newTanggalSelesai.trim()
        ) {
            Alert.alert('Error', 'Semua field wajib diisi!');
            return;
        }
        try {
            await portfolioService.tambahPortfolio({
                id_guru: idGuru,
                judul: newJudul,
                deskripsi: newDeskripsi,
                tipe_portfolio: newTipe,
                bukti: newBukti,
                tanggal_mulai: newTanggalMulai,
                tanggal_selesai: newTanggalSelesai,
            });
            await loadPortofolios();
            setNewJudul('');
            setNewDeskripsi('');
            setNewTipe('');
            setNewBukti('');
            setNewTanggalMulai('');
            setNewTanggalSelesai('');
            setIsAdding(false);
            Alert.alert('Sukses', 'Portofolio berhasil ditambahkan!');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDeletePorto = idPortfolio => {
        Alert.alert('Hapus Portofolio', 'Apakah Anda yakin?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Hapus',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await portfolioService.hapusPortfolio(idPortfolio);
                        await loadPortofolios(); 
                    } catch (error) {
                        Alert.alert('Error', error.message);
                    }
                },
            },
        ]);
    };

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
        if (idGuru) {
            loadLatestProfileData();
            loadPortofolios();
            loadSesiHariIni();
            loadMateriDiajar();
        }
    }, [idGuru, loadLatestProfileData, loadPortofolios, loadSesiHariIni, loadMateriDiajar]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.topHeader}>
                <View style={{ width: 24 }} />
                <TouchableOpacity
                    onPress={() => Alert.alert('Info', 'Fitur Pengaturan Akun')}
                >
                    <Settings size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.profileMainCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {guruData?.name
                                ? guruData.name.substring(0, 2).toUpperCase()
                                : 'RN'}
                        </Text>
                    </View>
                    <View style={styles.profileMetaInfo}>
                        <Text style={styles.guruName}>
                            {guruData?.name || guruData?.nama || 'Nama Guru'}
                        </Text>
                        <Text style={styles.guruEmail}>
                            {guruData?.email || 'email@humana.id'}
                        </Text>
                    </View>
                </View>

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
                            <Text
                                style={[
                                    styles.activeStatusLabel,
                                    { color: isAktif ? '#25A244' : '#666' },
                                ]}
                            >
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

                <View style={styles.dataPribadiHeaderRow}>
                    <Text style={styles.sectionTitleMain}>Data Pribadi</Text>
                    <TouchableOpacity
                        style={styles.editMateriBtn}
                        onPress={() => onNavigate('EditBasicProfile')}
                        activeOpacity={0.7}
                    >
                        <Edit2 size={14} color="#284B7A" />
                        <Text style={styles.editMateriBtnText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dataPribadiContainer}>
                    <View style={styles.dataItemField}>
                        <Text style={styles.fieldLabel}>Nama Pengguna</Text>
                        <Text style={styles.fieldValue}>
                            {guruData?.username && guruData.username !== '-'
                                ? guruData.username
                                : guruData?.name?.toLowerCase().replace(/\s/g, '') || '-'}
                        </Text>
                    </View>
                    <View style={styles.dataItemField}>
                        <Text style={styles.fieldLabel}>No. Telepon</Text>
                        <Text style={styles.fieldValue}>
                            {guruData?.phone || guruData?.no_telepon || '-'}
                        </Text>
                    </View>
                    <View style={styles.dataItemField}>
                        <Text style={styles.fieldLabel}>Jenis Kelamin</Text>
                        <Text style={styles.fieldValue}>
                            {guruData?.gender || guruData?.jenis_kelamin || '-'}
                        </Text>
                    </View>
                    <View style={styles.dataItemField}>
                        <Text style={styles.fieldLabel}>Domisili</Text>
                        <Text style={styles.fieldValue}>
                            {guruData?.domicile || guruData?.alamat || '-'}
                        </Text>
                    </View>
                </View>

                <View style={styles.materiHeaderRow}>
                  <Text style={styles.sectionTitleMain}>Materi yang diajar</Text>
                  <TouchableOpacity
                    style={styles.editMateriBtn}
                    onPress={() => onNavigate('TambahMateri')}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={14} color="#284B7A" />
                    <Text style={styles.editMateriBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.materiChipWrap}>
                  {materiDiajar.length === 0 ? (
                    <Text style={styles.materiEmptyText}>Belum ada materi. Tap Edit untuk menambah.</Text>
                  ) : (
                    materiDiajar.map(item => (
                      <View key={item.id_materi} style={styles.materiChip}>
                        <Text style={styles.materiChipText}>{item.nama_materi}</Text>
                      </View>
                    ))
                  )}
                </View>

                <View style={styles.portoSectionHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.sectionTitleMain}>Portofolio Pengajaran</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addPortoBtn}
                        onPress={() => onNavigate('Portofolio')}
                    >
                        <Plus size={14} color="#FFF" />
                        <Text style={styles.addPortoBtnText}>Tambah</Text>
                    </TouchableOpacity>
                </View>

                {isAdding && (
                    <View style={styles.addPortoForm}>
                        <Text style={styles.formTitle}>🗂️ Portofolio Pengajaran</Text>
                        <Text style={styles.formLabel}>Judul Pengalaman / Sertifikat</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contoh: Mengajar Fisika SMA 2 Tahun"
                            value={newJudul}
                            onChangeText={setNewJudul}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.formLabel}>Deskripsi Singkat</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tuliskan detail pencapaian atau sertifikasi Anda..."
                            value={newDeskripsi}
                            onChangeText={setNewDeskripsi}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.formLabel}>Tipe Portofolio</Text>
                        <TouchableOpacity
                            style={[styles.input, styles.tipeSelector]}
                            onPress={() => setOpenTipe(!openTipe)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={
                                    newTipe ? styles.tipeSelectorText : styles.tipePlaceholder
                                }
                            >
                                {newTipe || 'Pilih tipe portofolio'}
                            </Text>
                            <Text style={styles.chevron}>{openTipe ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {openTipe && (
                            <View style={styles.tipeDropdown}>
                                {tipeOptions.map(item => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[
                                            styles.tipeItem,
                                            newTipe === item && styles.tipeItemActive,
                                        ]}
                                        onPress={() => {
                                            setNewTipe(item);
                                            setOpenTipe(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.tipeItemText,
                                                newTipe === item && styles.tipeItemTextActive,
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                        {newTipe === item && (
                                            <Text style={styles.tipeCheckmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={styles.formLabel}>Link Bukti</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="https://drive.google.com/..."
                            value={newBukti}
                            onChangeText={setNewBukti}
                            keyboardType="url"
                            autoCapitalize="none"
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.formLabel}>Tanggal Mulai</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD  (contoh: 2022-01-15)"
                            value={newTanggalMulai}
                            onChangeText={setNewTanggalMulai}
                            keyboardType="numbers-and-punctuation"
                            placeholderTextColor="#999"
                        />
                        <Text style={styles.formLabel}>Tanggal Selesai</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD  (contoh: 2023-06-30)"
                            value={newTanggalSelesai}
                            onChangeText={setNewTanggalSelesai}
                            keyboardType="numbers-and-punctuation"
                            placeholderTextColor="#999"
                        />

                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => {
                                    setIsAdding(false);
                                    setOpenTipe(false);
                                }}
                            >
                                <Text style={styles.cancelBtnText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddPorto}>
                                <Text style={styles.saveBtnText}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.portoListWrapper}>
                    {portofolios.map(item => (
                        <View key={item.id_portfolio} style={styles.portoCard}>
                            <View style={styles.portoHeader}>
                                <Text style={styles.portoTitle}>{item.judul}</Text>
                                <TouchableOpacity
                                    onPress={() => handleDeletePorto(item.id_portfolio)}
                                >
                                    <Trash2 size={16} color="#FF8A8A" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.portoDesc}>{item.deskripsi}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ paddingHorizontal: 24, marginTop: 10 }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#FFF1F1',
                            borderWidth: 1,
                            borderColor: '#FFAAAA',
                            borderRadius: 15,
                            paddingVertical: 14,
                        }}
                        onPress={onLogout}
                    >
                        <Text
                            style={{ fontSize: 15, color: '#FF4D4D', fontWeight: 'bold' }}
                        >
                            Keluar dari Akun
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 120 }} />
                <View style={{ height: 120 }} />
            </ScrollView>

            <BottomNavbar
                currentScreen="ProfileGuru"
                onNavigate={onNavigate}
                userRole="guru"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
        height: 80,
    },
    scrollContainer: { flex: 1 },
    profileMainCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
        marginBottom: 16,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#9BB1C9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 24 },
    profileMetaInfo: { marginLeft: 20, flex: 1 },
    guruName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    guruEmail: { fontSize: 13, color: '#666', marginTop: 4 },
    statusCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ECEFF1',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        marginBottom: 24,
    },
    statusSectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        letterSpacing: 1,
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusSubBox: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    statusValueBlue: { fontSize: 20, fontWeight: 'bold', color: '#284B7A' },
    statusSubLabel: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
        textAlign: 'center',
    },
    statusDivider: { width: 1, height: 35, backgroundColor: '#E0E0E0' },
    activeStatusLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    dataPribadiHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sectionTitleMain: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    dataPribadiContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ECEFF1',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 5,
    },
    dataItemField: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    fieldLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
    fieldValue: { fontSize: 15, fontWeight: 'bold', color: '#000', marginTop: 4 },
    materiHeaderRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 24, marginTop: 28, marginBottom: 12,
    },
    editMateriBtn: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: '#284B7A',
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    editMateriBtnText: {
      fontSize: 12, fontWeight: 'bold', color: '#284B7A', marginLeft: 4,
    },
    materiChipWrap: {
      flexDirection: 'row', flexWrap: 'wrap',
      paddingHorizontal: 24, gap: 8, marginBottom: 24,
    },
    materiChip: {
      borderWidth: 1.5, borderColor: '#284B7A',
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    },
    materiChipText: {
      fontSize: 13, fontWeight: 'bold', color: '#284B7A',
    },
    materiEmptyText: {
      fontSize: 13, color: '#ABABAB', fontStyle: 'italic',
    },
    portoSectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 28,
        marginBottom: 12,
    },
    addPortoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#284B7A',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addPortoBtnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    portoListWrapper: { paddingHorizontal: 24, marginTop: 4 },
    portoCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ECEFF1',
    },
    portoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    portoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#284B7A',
        flex: 1,
        marginRight: 8,
    },
    portoDesc: { fontSize: 13, color: '#555', marginTop: 6, lineHeight: 18 },
    addPortoForm: {
        backgroundColor: '#F8FAFC',
        marginHorizontal: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4A5568',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        marginBottom: 12,
        color: '#333',
    },
    textArea: { height: 65, textAlignVertical: 'top' },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
    cancelBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },
    saveBtn: {
        backgroundColor: '#284B7A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 14,
    },
    tipeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
    },
    tipeSelectorText: { fontSize: 14, color: '#333' },
    tipePlaceholder: { fontSize: 14, color: '#999' },
    chevron: { fontSize: 11, color: '#999' },
    tipeDropdown: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#284B7A',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
    },
    tipeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
    },
    tipeItemActive: { backgroundColor: '#EBF0F8' },
    tipeItemText: { fontSize: 14, color: '#333' },
    tipeItemTextActive: { fontWeight: 'bold', color: '#284B7A' },
    tipeCheckmark: { fontSize: 13, color: '#284B7A', fontWeight: 'bold' },
});

export default ProfileGuruPage;