import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, Image } from 'react-native';
import CustomAlert from '../components/CustomAlert';
import axios from 'axios';
import { API_URL } from '../src/config';
import { pemesananService } from '../services/pemesananService';

const { width, height } = Dimensions.get('window');

const MencariPengajarPage = ({ sessionData, onCancel, onMatchSuccess, onMatchFailed }) => {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const spinValue = useRef(new Animated.Value(0)).current;
    const radarValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animasi Ikon Berputar
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Animasi Radar Peta
        Animated.loop(
            Animated.timing(radarValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ).start();

        const id_pemesanan_aktif = sessionData?.id_pemesanan; // Pastikan id_pemesanan dikirim dari page sebelumnya setelah commit db

        if (!id_pemesanan_aktif) {
            console.warn("ID Pemesanan tidak ditemukan di sessionData");
            return;
        }
        console.log(`=== Memulai Polling untuk ID Pemesanan: ${id_pemesanan_aktif} ===`);

        const intervalCekStatus = setInterval(async () => {
            try {
                const result = await pemesananService.cekStatusPemesanan(id_pemesanan_aktif);
                console.log("=== [DEBUG POLLING] Hasil dari DB ===", result);

                if (result.success) {
                    // SAKLEK: Hanya sukses jika statusnya DIKONFIRMASI
                    if (result.status_pemesanan === 'dikonfirmasi' || result.status_pemesanan === 'Dikonfirmasi') {
                        clearInterval(intervalCekStatus);
                        clearTimeout(timeoutMaksimal); // Amankan timeout agar tidak tabrakan

                        console.log('DATA GURU:', JSON.stringify(result.data_guru));
                        console.log('ID MURID dari sessionData:', sessionData?.id_murid);
                        
                        try {
                            await axios.post(`${API_URL}/chats/create`, {
                                id_guru: result.data_guru?.id_guru,
                                id_murid: sessionData?.id_murid
                            });
                            console.log('✅ Room chat berhasil dibuat');
                        } catch (e) {
                            console.warn('⚠️ Gagal buat room chat:', e.message);
                        }

                        setAlertType('success');
                        setAlertTitle('Guru Ditemukan!');
                        setAlertMessage(`Sesi Anda diterima oleh ${result.data_guru?.nama_guru || 'Pengajar'}. Mengalihkan ke halaman pembayaran...`);
                        setAlertVisible(true);
                    }
                    // Jika status diubah oleh sistem/guru menjadi dibatalkan atau ditolak
                    else if (
                        result.status_pemesanan === 'dibatalkan' ||
                        result.status_pemesanan === 'ditolak'
                    ) {
                        clearInterval(intervalCekStatus);
                        clearTimeout(timeoutMaksimal);

                        setAlertType('error');
                        setAlertTitle('Pencarian Dihentikan');
                        setAlertMessage('Permintaan sesi ini telah dibatalkan atau tidak tersedia.');
                        setAlertVisible(true);
                    }
                    // Jika statusnya masih 'menunggu konfirmasi', diamkan saja agar radar tetap berputar
                    else {
                        console.log(`Status saat ini: ${result.status_pemesanan}. Masih mencari...`);
                    }
                }
            } catch (error) {
                console.error("Gagal melakukan polling status pemesanan melalui service:", error);
            }
        }, 3000); // Cek setiap 3 detik

        // WAKTU TESTING: Diperlama menjadi 5 Menit (300.000 ms) agar kamu sempat pindah ke akun guru
        const timeoutMaksimal = setTimeout(() => {
            clearInterval(intervalCekStatus);
            console.log("=== Polling dihentikan karena mencapai batas waktu maksimal (Timeout) ===");

            setAlertType('error');
            setAlertTitle('Belum ada guru tersedia');
            setAlertMessage('Coba ubah waktu mengajar atau perluas lokasi pencarian Anda.');
            setAlertVisible(true);
        }, 300000); // 5 menit

        // Cleanup handler
        return () => {
            clearInterval(intervalCekStatus);
            clearTimeout(timeoutMaksimal);
        };

        // Gunakan id_pemesanan spesifik sebagai dependency, jangan seluruh objek sessionData 
        // Ini mencegah useEffect ke-trigger ulang secara tidak sengaja saat state lain di parent berubah
    }, [sessionData?.id_pemesanan]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const radarScale = radarValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 3],
    });

    const radarOpacity = radarValue.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0.4, 0.1, 0],
    });

    const handleBatalkan = async () => {
        console.log('=== handleBatalkan dipanggil ===');
        const id_pemesanan = sessionData?.id_pemesanan;
        if (!id_pemesanan) {
            onCancel();
            return;
        }
        try {
            const result = await pemesananService.batalPemesanan(id_pemesanan);
            console.log('[MencariPengajar] Batal pemesanan:', result);
        } catch (error) {
            console.warn('[MencariPengajar] Gagal batal pemesanan:', error.message);
        } finally {
            onCancel(); // Tetap balik ke halaman sebelumnya
        }
    };

    return (
        <View style={styles.container}>
            {/* ================= AREA PETA (DIPERBESAR) ================= */}
            <View style={styles.mapSection}>
                <Image
                    source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-86.8025,33.5207,14,0/800x800?access_token=pk.eyJ1IjoibWFyaW8iLCJhIjoiY200In0' }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Radar Tetap Ada */}
                <View style={styles.markerContainer}>
                    <Animated.View style={[styles.radar, { transform: [{ scale: radarScale }], opacity: radarOpacity }]} />
                    <View style={styles.userDot} />
                </View>

                {/* Header Tetap Di Atas */}
                <View style={styles.header}>
                    <View style={{ width: 60 }} />
                    <Text style={styles.headerTitle}>Mencari Pengajar</Text>
                    <View style={{ width: 60 }} />
                </View>
            </View>

            {/* ================= AREA DETAIL (DIBUAT PAS DI BAWAH) ================= */}
            <View style={styles.detailSection}>

                {/* Kartu Floating */}
                <View style={styles.floatingCard}>
                    <Animated.Image
                        source={require('../assets/mencari_icon.png')}
                        style={[styles.searchIcon, { transform: [{ rotate: spin }] }]}
                    />
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusTitle}>Mencari Pengajar Terbaik untukmu...</Text>
                        <Text style={styles.statusSubtitle}>Biasanya kurang dari 30 detik</Text>
                    </View>
                </View>

                {/* Pembungkus Konten Bawah */}
                <View style={styles.contentWrapper}>
                    <Text style={styles.sectionTitle}>DETAIL PERMINTAAN</Text>

                    {/* MATA PELAJARAN DINAMIS */}
                    <View style={styles.subjectBox}>
                        <View style={styles.subjectRow}>
                            <View>
                                <Text style={styles.label}>Mata Pelajaran</Text>
                                <Text style={styles.valueText}>
                                    {sessionData?.mata_pelajaran || sessionData?.nama_mapel || 'Mata Pelajaran'}
                                </Text>
                            </View>
                            <Text style={styles.mathSymbol}>∑</Text>
                        </View>
                    </View>

                    <View style={styles.rowContainer}>
                        {/* TINGKATAN DINAMIS */}
                        <View style={[styles.smallBox, { marginRight: 15 }]}>
                            <Text style={styles.label}>Tingkatan</Text>
                            <Text style={styles.smallValueText}>
                                {sessionData?.jenjang ? `${sessionData.jenjang} - Kelas ${sessionData?.kelas || ''}` : (sessionData?.tingkatan || '-')}
                            </Text>
                        </View>

                        {/* WAKTU SESI DINAMIS */}
                        <View style={styles.smallBox}>
                            <Text style={styles.label}>Waktu Sesi</Text>
                            <Text style={styles.smallValueText}>
                                {sessionData?.waktu_mulai && sessionData?.waktu_selesai
                                    ? `${sessionData.waktu_mulai} - ${sessionData.waktu_selesai}`
                                    : (sessionData?.waktu_sesi || '-')}
                            </Text>
                        </View>
                    </View>

                    {/* Tombol diposisikan paling bawah */}
                    <TouchableOpacity style={styles.cancelButton} onPress={handleBatalkan}>
                        <Text style={styles.cancelButtonText}>✕ Batalkan Pesanan</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <CustomAlert
                visible={alertVisible}
                type={alertType}
                title={alertTitle}
                message={alertMessage}
                onClose={() => {
                    setAlertVisible(false);
                    alertType === 'success' ? onMatchSuccess() : onMatchFailed();
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },

    // Menambah porsi peta agar elemen di bawahnya terdorong ke bottom
    mapSection: { height: height * 0.58, justifyContent: 'center', alignItems: 'center' },
    markerContainer: { justifyContent: 'center', alignItems: 'center' },
    userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF', borderWidth: 2, borderColor: '#FFF' },
    radar: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF' },

    header: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    backText: { fontSize: 16, color: '#333', fontWeight: '500' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },

    detailSection: { flex: 1, paddingHorizontal: 20, backgroundColor: '#FFF' },

    floatingCard: {
        position: 'absolute',
        top: -35, // Mengatur kartu agar overlap pas di garis peta & putih
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 15,
        flexDirection: 'row',
        padding: 18,
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    searchIcon: { width: 42, height: 42, resizeMode: 'contain' },
    statusTextContainer: { marginLeft: 15, flex: 1 },
    statusTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
    statusSubtitle: { fontSize: 11, color: '#888' },

    // Wrapper untuk mendorong elemen ke arah bawah layar
    contentWrapper: {
        flex: 1,
        justifyContent: 'flex-end', // Memastikan elemen berkumpul di bawah
        paddingBottom: 60, // Jarak aman dari navigasi bar HP
        marginTop: 60,
    },

    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#7A7A7A', marginBottom: 12 },

    subjectBox: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        borderLeftWidth: 5,
        borderLeftColor: '#0A4DA2',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 10, color: '#999', marginBottom: 2 },
    valueText: { fontSize: 16, fontWeight: 'bold', color: '#0A4DA2' },
    mathSymbol: { fontSize: 18, color: '#DDD' },

    rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    smallBox: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    smallValueText: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    cancelButton: {
        backgroundColor: '#F43F5E',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10
    },
    cancelButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default MencariPengajarPage;