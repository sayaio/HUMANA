import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Linking,
} from 'react-native';
import { ChevronLeft, MapPin, ChevronRight } from 'lucide-react-native';

import { terimaPermintaanSesiAPI } from '../services/matchingService';

const DetailPermintaanGuruPage = ({ permintaanData, guruData, onBack }) => {
    const data = permintaanData || {};

    const [sesiDikonfirmasi, setSesiDikonfirmasi] = useState([]);
    const [loading, setLoading] = useState(true);

    const namaInisial = data.nama_murid
        ? data.nama_murid.substring(0, 2).toUpperCase()
        : 'SN';

    const formatRupiah = (angka) => {
        if (!angka && angka !== 0) return 'Rp 0';
        return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
    };

    const handleBukaMap = () => {
        const lokasi = data.lokasi_sesi || data.lokasi || '';
        if (lokasi) {
            const parts = lokasi.split(',');
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const url = `https://www.google.com/maps?q=${parts[0].trim()},${parts[1].trim()}`;
                Linking.openURL(url).catch(() =>
                    Alert.alert('Error', 'Tidak dapat membuka Google Maps.')
                );
            } else {
                const encoded = encodeURIComponent(lokasi);
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`).catch(() =>
                    Alert.alert('Error', 'Tidak dapat membuka Google Maps.')
                );
            }
        } else {
            Alert.alert('Info', 'Lokasi tidak tersedia.');
        }
    };

    const handleTolak = () => {
        Alert.alert(
            'Tolak Permintaan',
            `Yakin ingin menolak permintaan dari ${data.nama_murid}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Tolak',
                    style: 'destructive',
                    onPress: () => {
                        if (onTolak) onTolak(data.id_pemesanan || data.id);
                    },
                },
            ]
        );
    };

    // FUNGSI DIPERBAIKI: Hanya memunculkan alert, logika API ditangani oleh prop onTerima
    const handleTerimaSesi = async item => {
        Alert.alert(
            'Konfirmasi Terima',
            `Apakah Anda yakin ingin menerima permintaan mengajar dari ${item.nama_murid}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Terima',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const res = await terimaPermintaanSesiAPI(
                                item.id_pemesanan,
                                guruData.id,
                                item.biaya_sesi,
                                item.biaya_jarak,
                                item.harga_total,
                            );
                            if (res && res.success) {
                                requestAnimationFrame(() => {
                                    Alert.alert('Sukses', 'Sesi berhasil dikonfirmasi!');
                                });
                                loadPermintaan();
                            } else {
                                requestAnimationFrame(() => {
                                    Alert.alert('Gagal', res.message || 'Terjadi kesalahan sistem.');
                                });
                            }
                        } catch (e) {
                            requestAnimationFrame(() => {
                                Alert.alert('Error', 'Terjadi masalah jaringan.');
                            });
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const biayaSesi = data.biaya_sesi || data.harga_total || 0;
    const biayaTransportasi = data.biaya_jarak || data.biaya_transportasi || 0;
    const totalBayar = data.harga_total || (biayaSesi + biayaTransportasi);

    const formatTanggal = (raw) => {
        if (!raw) return data.tanggal || '-';
        try {
            return new Date(raw).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '-';
        }
    };

    const formatWaktu = () => {
        if (data.waktu_string) return data.waktu_string;
        if (data.waktu_mulai && data.waktu_selesai) {
            try {
                const mulai = new Date(data.waktu_mulai).toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit',
                });
                const selesai = new Date(data.waktu_selesai).toLocaleTimeString('id-ID', {
                    hour: '2-digit', minute: '2-digit',
                });
                return `${mulai} - ${selesai}`;
            } catch {
                return '-';
            }
        }
        return data.waktu || '-';
    };

    const tanggal = formatTanggal(data.waktu_mulai);
    const waktuSesi = formatWaktu();
    const lokasiAlamat = data.lokasi_sesi || data.lokasi || data.alamat || 'Alamat tidak tersedia';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <ChevronLeft size={20} color="#284B7A" />
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Pemesanan</Text>
                <View style={{ width: 80 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Bagian Profil, dll (Sama seperti sebelumnya) */}
                <View style={styles.profileRow}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{namaInisial}</Text>
                    </View>
                    <Text style={styles.namaMurid}>{data.nama_murid || 'Nama Murid'}</Text>
                </View>

                {/* TANGGAL & WAKTU SESI */}
                <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeBox}>
                        <Text style={styles.dtLabel}>Tanggal</Text>
                        <Text style={styles.dtValue}>{tanggal}</Text>
                    </View>
                    <View style={[styles.dateTimeBox, styles.dateTimeBoxRight]}>
                        <Text style={styles.dtLabel}>Waktu Sesi</Text>
                        <Text style={styles.dtValue}>{waktuSesi}</Text>
                    </View>
                </View>

                {/* JENJANG */}
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>Jenjang</Text>
                    <View style={styles.fieldBox}>
                        <Text style={styles.fieldValue}>
                            {data.jenjang_pendidikan || data.jenjang || '-'}
                        </Text>
                    </View>
                </View>

                {/* MATA PELAJARAN */}
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>Mata Pelajaran</Text>
                    <View style={styles.fieldBox}>
                        <Text style={styles.fieldValue}>
                            {data.nama_mapel || data.mata_pelajaran || '-'}
                        </Text>
                    </View>
                </View>

                {/* MATERI */}
                <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>Materi</Text>
                    <View style={styles.fieldBox}>
                        <Text style={styles.fieldValue}>
                            {data.nama_materi || data.materi || '-'}
                        </Text>
                    </View>
                </View>

                {/* PETA / MAP PLACEHOLDER */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <Text style={styles.mapPlaceholderText}>📍 Peta Lokasi</Text>
                        <Text style={styles.mapPlaceholderSub}>
                            Tap tombol lokasi di bawah untuk membuka di Google Maps
                        </Text>
                    </View>
                </View>

                {/* LOKASI ROW — BISA DI-TAP */}
                <TouchableOpacity style={styles.lokasiRow} onPress={handleBukaMap} activeOpacity={0.7}>
                    <View style={styles.lokasiIconWrap}>
                        <MapPin size={18} color="#284B7A" />
                    </View>
                    <View style={styles.lokasiInfo}>
                        <Text style={styles.lokasiTitle}>
                            {data.tipe_lokasi || 'Lokasi Sesi'}
                        </Text>
                        <Text style={styles.lokasiAlamat} numberOfLines={2}>
                            {lokasiAlamat}
                        </Text>
                    </View>
                    <ChevronRight size={18} color="#ABABAB" />
                </TouchableOpacity>

                {/* RINCIAN BAYARAN */}
                <View style={styles.rincianCard}>
                    <Text style={styles.rincianTitle}>Rincian Bayaran</Text>

                    <View style={styles.rincianRow}>
                        <Text style={styles.rincianLabel}>Biaya Sesi</Text>
                        <Text style={styles.rincianValue}>: {formatRupiah(biayaSesi)}</Text>
                    </View>

                    <View style={styles.rincianRow}>
                        <Text style={styles.rincianLabel}>Biaya Transportasi</Text>
                        <Text style={styles.rincianValue}>: {formatRupiah(biayaTransportasi)}</Text>
                    </View>

                    <View style={styles.rincianDivider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Bayaran</Text>
                        <Text style={styles.totalValue}>: {formatRupiah(totalBayar)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* TOMBOL TOLAK & TERIMA */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.btnTolak} onPress={handleTolak} activeOpacity={0.8}>
                    <Text style={styles.btnTolakText}>Tolak</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnTerima} onPress={()=>handleTerimaSesi(permintaanData)} activeOpacity={0.8}>
                    <Text style={styles.btnTerimaText}>Terima</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },

    // HEADER
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
    },
    backText: {
        fontSize: 14,
        color: '#284B7A',
        fontWeight: '600',
        marginLeft: 2,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },

    scrollView: { flex: 1 },

    // PROFIL MURID
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
    },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#284B7A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    namaMurid: { fontSize: 20, fontWeight: 'bold', color: '#000' },

    // TANGGAL & WAKTU
    dateTimeRow: {
        flexDirection: 'row',
        marginHorizontal: 24,
        marginBottom: 20,
        gap: 12,
    },
    dateTimeBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E8EEF6',
        borderRadius: 12,
        padding: 14,
        backgroundColor: '#F8FAFC',
    },
    dateTimeBoxRight: {},
    dtLabel: {
        fontSize: 11,
        color: '#ABABAB',
        marginBottom: 6,
        fontWeight: '500',
    },
    dtValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#284B7A',
    },

    // FIELD SECTIONS (Jenjang, Mapel, Materi)
    fieldSection: {
        marginHorizontal: 24,
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
        marginBottom: 8,
    },
    fieldBox: {
        borderWidth: 1,
        borderColor: '#E8EEF6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FAFBFD',
        alignItems: 'center',
    },
    fieldValue: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },

    // MAP
    mapContainer: {
        marginHorizontal: 24,
        marginBottom: 0,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8EEF6',
    },
    mapPlaceholder: {
        height: 160,
        backgroundColor: '#E8F0E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        fontSize: 20,
        marginBottom: 6,
    },
    mapPlaceholderSub: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },

    // LOKASI ROW
    lokasiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 0,
        marginBottom: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#E8EEF6',
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
    },
    lokasiIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EBF0F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    lokasiInfo: { flex: 1 },
    lokasiTitle: { fontSize: 13, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    lokasiAlamat: { fontSize: 12, color: '#666' },

    // RINCIAN BAYARAN
    rincianCard: {
        marginHorizontal: 24,
        marginBottom: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8EEF6',
        padding: 18,
        backgroundColor: '#FFF',
    },
    rincianTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 14,
    },
    rincianRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rincianLabel: { fontSize: 13, color: '#555' },
    rincianValue: { fontSize: 13, color: '#333', fontWeight: '500' },
    rincianDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    totalValue: { fontSize: 17, fontWeight: 'bold', color: '#000' },

    // ACTION BAR BAWAH
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 12,
    },
    btnTolak: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTolakText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    btnTerima: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#2A7A5E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTerimaText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});

export default DetailPermintaanGuruPage;