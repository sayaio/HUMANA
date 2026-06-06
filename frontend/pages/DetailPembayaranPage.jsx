import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { prosesCod, prosesMidtrans } from '../services/bankerService';
import { getSesiDetail } from '../services/bankerService';
import DimmedModal from '../components/DimmedModal';
import { useAppAlert } from '../components/AppAlertProvider';
import { batalkanSesi } from '../services/batalSesiService';
import { pemesananService } from '../services/pemesananService';
import PageHeader from '../components/PageHeader';
import { fetchGuruRating } from '../services/feedbackService';
import PoinSVG from '../components/mapsPoint';

const DetailPembayaranPage = ({ sessionData, onBack, onPaymentSuccess, onSesiDilepas, onCodSuccess }) => {
    const { showInfo, showConfirm } = useAppAlert();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [displayData, setDetailSesi] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const idSesi = sessionData?.id_sesi || sessionData?.id_pemesanan;
    const [guruRating, setGuruRating] = useState(null);

    useEffect(() => {
        const fetchRating = async () => {
            const idGuru = displayData?.guru?.id_guru;
            if (!idGuru) return;
            const res = await fetchGuruRating(idGuru);
            console.log('🔍 fetchGuruRating res:', JSON.stringify(res));
            if (res?.success) setGuruRating(res.data?.rating ?? null);
        };
        fetchRating();
    }, [displayData?.guru?.id_guru]);

    // Deteksi jika GURU melepas sesi sebelum dibayar (kasus 2) -> murid cari guru lain.
    useEffect(() => {
        if (!idSesi) return;
        const interval = setInterval(async () => {
            try {
                const res = await pemesananService.cekStatusPemesanan(idSesi);
                if (res?.success && res.status_pemesanan === 'menunggu konfirmasi') {
                    clearInterval(interval);
                    showInfo(
                        'Mencari Guru Lain',
                        'Guru berhalangan. Kami carikan guru lain untuk sesimu.',
                        {
                            type: 'gagal',
                            onClose: () => onSesiDilepas?.(),
                        },
                    );
                }
            } catch (e) {
                // Diamkan error polling.
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [idSesi]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!idSesi) {
                setIsLoadingData(false);
                return;
            }

            try {
                const response = await getSesiDetail(idSesi);
                if (response && response.data) {
                    setDetailSesi(response.data);
                    console.log('sessionData:', JSON.stringify(sessionData));
                    console.log('displayData:', JSON.stringify(response.data));
                } else if (response && !response.success && response.message) {
                    console.log('⚠️ Warning:', response.message);
                } else {
                    setDetailSesi(response);
                }
            } catch (error) {
                console.log('❌ Error di useEffect fetchDetail:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchDetail();
    }, [idSesi]);

    const biayaSesi = displayData?.pembayaran?.biaya_sesi ?? sessionData?.biaya_sesi ?? sessionData?.harga ?? 0;
    const biayaJarak = displayData?.pembayaran?.biaya_jarak ?? sessionData?.biaya_jarak ?? sessionData?.biaya_transport ?? 0;
    const totalBayar = displayData?.pembayaran?.nominal ?? sessionData?.nominal ?? sessionData?.total_harga ?? (biayaSesi + biayaJarak);

    const formatRupiah = (angka) => {
        if (angka === undefined || angka === null) return 'Rp 0';
        return `Rp ${Number(angka).toLocaleString('id-ID')}`;
    };

    const handleBackWithConfirmation = () => {
        showConfirm(
            'Batalkan sesi?',
            'Pesanan akan dibatalkan dan kamu kembali ke halaman pemesanan.',
            prosesBatalMurid,
        );
    };

    const prosesBatalMurid = async () => {
        const id = sessionData?.id_sesi || sessionData?.id_pemesanan;
        if (!id) { onBack && onBack(); return; }
        await batalkanSesi(id, 'murid');
        onBack && onBack();
    };

    const handlePaymentPress = async () => {
        const idSesi = sessionData?.id_sesi || sessionData?.id_pemesanan;

        if (!selectedMethod) {
            showInfo('Peringatan', 'Mohon pilih metode pembayaran terlebih dahulu.');
            return;
        }

        if (selectedMethod === 'cod') {
            try {
                setIsProcessing(true);
                const result = await prosesCod(idSesi);
                setIsProcessing(false);

                if (result.success) {
                    if (onCodSuccess) {
                        onCodSuccess();
                    } else if (onBack) {
                        onBack();
                    }
                } else {
                    throw new Error(result.message || 'Gagal memproses COD.');
                }
            } catch (error) {
                setIsProcessing(false);
                showInfo('Gagal', error.message || 'Terjadi kesalahan sistem.');
            }
            return;
        }

        if (selectedMethod === 'va' || selectedMethod === 'ewallet') {
            try {
                setIsProcessing(true);
                const result = await prosesMidtrans(idSesi, selectedMethod);
                setIsProcessing(false);

                if (result.success && (result.snap_url || result.data?.snap_url)) {
                    const url = result.snap_url || result.data?.snap_url;
                    if (onPaymentSuccess) onPaymentSuccess(url);
                } else {
                    throw new Error(result.message || 'Gagal mendapatkan URL pembayaran.');
                }
            } catch (error) {
                setIsProcessing(false);
                showInfo('Gagal Transaksi', error.message || 'Gagal terhubung ke sistem pembayaran.');
            }
        }
    };

    const getMethodLabel = () => {
        if (selectedMethod === 'va') return 'Virtual Account';
        if (selectedMethod === 'ewallet') return 'E-Wallet / QRIS';
        if (selectedMethod === 'cod') return 'Bayar di Tempat (COD)';
        return 'Belum Dipilih';
    };

    // Helper: ambil 2 inisial dari nama guru
    const getInitials = (nama) => {
        if (!nama) return '?';
        return nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <View style={styles.container}>
            <PageHeader title="Detail Pembayaran" onBack={handleBackWithConfirmation} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* CARD INFO MATERI & GURU */}
                <View style={styles.infoCard}>
                    {/* Baris atas: Subject info */}
                    <Text style={styles.subjectTitle}>
                        {sessionData?.nama_mapel || displayData?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran'}
                    </Text>
                    <Text style={styles.chapterText}>
                        {sessionData?.nama_materi || displayData?.materi?.nama_materi || 'Materi Pembahasan'}
                    </Text>
                    <View style={styles.gradeBadge}>
                        <Text style={styles.gradeBadgeText}>
                            {sessionData?.jenjang || 'Jenjang'} · Kelas {sessionData?.kelas || '-'}
                        </Text>
                    </View>

                    {/* Divider + Info Guru (hanya jika ada data guru) */}
                    {displayData?.guru && (
                        <>
                            <View style={styles.infoCardDivider} />
                            <View style={styles.guruRow}>
                                {/* Avatar */}
                                <View style={styles.guruAvatar}>
                                    <Text style={styles.guruAvatarText}>
                                        {getInitials(displayData.guru.nama_guru)}
                                    </Text>
                                </View>
                                {/* Info */}
                                <View style={styles.guruInfo}>
                                    <Text style={styles.guruName}>{displayData.guru.nama_guru}</Text>
                                    <Text style={styles.guruMapel}>
                                        {sessionData?.nama_mapel || displayData?.mata_pelajaran?.nama_mapel || ''}
                                        {(sessionData?.nama_materi || displayData?.materi?.nama_materi)
                                            ? ` — ${sessionData?.nama_materi || displayData?.materi?.nama_materi}`
                                            : ''}
                                    </Text>
                                    {guruRating !== null && guruRating !== undefined && (
                                        <Text style={Number(guruRating) > 0 ? styles.guruRating : styles.guruNoRating}>
                                            {Number(guruRating) > 0
                                                ? `★ ${Number(guruRating).toFixed(1)}`
                                                : 'Belum ada rating'}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* CARD UTAMA */}
                <View style={styles.mainCard}>
                    <Text style={styles.inputLabel}>Lokasi Belajar</Text>

                    {/* Bar Alamat Tunggal yang Lebih Besar */}
                    <View style={styles.largeLocationContainer}>
                        <PoinSVG size={25} color="#284B7A" />
                        <View style={styles.addressTextWrapper}>
                            {sessionData?.tipe_lokasi && (
                                <Text style={styles.locationTypeText}>{sessionData.tipe_lokasi}</Text>
                            )}
                            <Text style={styles.fullAddressText}>
                                {sessionData?.lokasi || "Alamat lengkap tidak ditemukan"}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Jadwal Pemesanan</Text>
                    <TextInput style={styles.disabledInput} value={sessionData?.tanggal} editable={false} />

                    <Text style={styles.inputLabel}>Durasi Sesi</Text>
                    <TextInput style={styles.disabledInput} value={sessionData?.waktu_sesi} editable={false} />
                </View>

                {/* CARD RINCIAN PEMBAYARAN */}
                <View style={styles.paymentCard}>
                    <View style={styles.methodContainer}>
                        <View style={styles.methodLeftColumn}>
                            <Text style={styles.methodLabel}>
                                Metode Pembayaran : {'\n'}
                                <Text style={[
                                    styles.methodValue,
                                    { color: selectedMethod ? '#3A7D6B' : '#D3D3D3', fontWeight: selectedMethod ? 'bold' : 'normal' }
                                ]}>
                                    {getMethodLabel()}
                                </Text>
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.hyperlinkTouchTarget}
                            onPress={() => setShowMethodModal(true)}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.linkText}>
                                {selectedMethod ? 'Ubah Metode' : 'Pilih Pembayaran'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.divider, { marginVertical: 12 }]} />
                    <Text style={styles.rincianTitle}>Rincian Pembayaran :</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Biaya Pembelajaran</Text>
                        <Text style={styles.priceValue}>: {formatRupiah(biayaSesi)}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Biaya Transportasi Guru</Text>
                        <Text style={styles.priceValue}>: {formatRupiah(biayaJarak)}</Text>
                    </View>

                    <View style={[styles.divider, { marginVertical: 12 }]} />

                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>Total Pembayaran</Text>
                        <Text style={styles.totalValue}>: {formatRupiah(totalBayar)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* TOMBOL UTAMA */}
            <View style={styles.bottomActionContainer}>
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        selectedMethod ? styles.payButtonActive : styles.payButtonDisabled
                    ]}
                    onPress={handlePaymentPress}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={selectedMethod ? "#FFF" : "#A0A0A0"} size="small" />
                    ) : (
                        <Text style={[
                            styles.payButtonText,
                            { color: selectedMethod ? '#FFF' : '#A0A0A0' }
                        ]}>
                            {selectedMethod === 'cod' ? 'Selesaikan Pesanan' : 'Lakukan Pembayaran'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* MODAL PILIHAN PEMBAYARAN */}
            <DimmedModal
                visible={showMethodModal}
                onRequestClose={() => setShowMethodModal(false)}
                placement="bottom"
            >
                <View style={styles.bottomSheetContainer}>
                    <View style={styles.notchIndicator} />
                    <TouchableOpacity style={[styles.imageOptionBox, selectedMethod === 'va' && styles.selectedOptionBox]} onPress={() => { setShowMethodModal(false); setTimeout(() => { setSelectedMethod('va'); }, 100); }}>
                        <Text style={styles.imageOptionIcon}>🏛️</Text>
                        <Text style={styles.imageOptionText}>Virtual Account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.imageOptionBox, selectedMethod === 'ewallet' && styles.selectedOptionBox]} onPress={() => { setShowMethodModal(false); setTimeout(() => { setSelectedMethod('ewallet'); }, 100); }}>
                        <Text style={styles.imageOptionIcon}>💼</Text>
                        <Text style={styles.imageOptionText}>E-Wallet / QR Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.imageOptionBox, selectedMethod === 'cod' && styles.selectedOptionBox]} onPress={() => { setShowMethodModal(false); setTimeout(() => { setSelectedMethod('cod'); }, 100); }}>
                        <Text style={styles.imageOptionIcon}>💵</Text>
                        <Text style={styles.imageOptionText}>Bayar di Tempat (COD)</Text>
                    </TouchableOpacity>
                </View>
            </DimmedModal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    subjectTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    chapterText: { fontSize: 15, color: '#666', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 8 },

    // Info Card (Materi + Guru)
    infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        marginHorizontal: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        elevation: 3,
    },
    gradeBadge: {
        marginTop: 8,
        alignSelf: 'flex-start',
        backgroundColor: '#EAF4F1',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    gradeBadgeText: {
        fontSize: 12,
        color: '#3A7D6B',
        fontWeight: '600',
    },
    infoCardDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 14,
    },
    guruRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    guruAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    guruAvatarText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    guruInfo: { flex: 1 },
    guruName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    guruMapel: {
        fontSize: 13,
        color: '#666',
    },
    guruRating: {
        fontSize: 12,
        color: '#F5A623',
        fontWeight: '600',
        marginTop: 3,
    },
    guruNoRating: {
        fontSize: 11,
        color: '#CCC',
        marginTop: 3,
        fontStyle: 'italic',
    },

    // Main Card
    // Bagian Main Card yang di-update
    mainCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        elevation: 3,
    },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#000', marginBottom: 6, marginTop: 14 },
    disabledInput: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#A0A0A0' },

    // Styles Baru untuk Bar Alamat Besar
    largeLocationContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#EBEBEB',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        alignItems: 'flex-start', // Menjaga icon pin tetap di atas saat alamat panjang
        gap: 10,
    },
    largePinIcon: {
        fontSize: 16,
        marginTop: 2, // Menyelaraskan icon dengan baris pertama teks
    },
    addressTextWrapper: {
        flex: 1,
    },
    locationTypeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3A7D6B',
        marginBottom: 4,
    },
    fullAddressText: {
        fontSize: 14,
        color: '#A0A0A0',
        lineHeight: 20, // Memberikan jarak antar baris alamat agar enak dibaca
    },
    // Payment Card
    paymentCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginHorizontal: 20, marginTop: 15,
        borderWidth: 1, borderColor: '#EFEFEF', elevation: 3,
    },
    methodContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    methodLeftColumn: { flex: 1 },
    methodLabel: { fontSize: 14, fontWeight: 'bold', color: '#000', lineHeight: 20 },
    methodValue: { fontSize: 14 },
    hyperlinkTouchTarget: { paddingVertical: 10, paddingHorizontal: 5 },
    linkText: { fontSize: 14, color: '#2D9CDB', textDecorationLine: 'underline', fontWeight: '600' },
    rincianTitle: { fontSize: 14, fontWeight: 'bold', color: '#000', marginBottom: 12 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    priceLabel: { fontSize: 14, color: '#777' },
    priceValue: { fontSize: 14, color: '#333' },
    totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    totalValue: { fontSize: 14, fontWeight: 'bold', color: '#000' },

    // Bottom Button
    bottomActionContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 },
    payButton: { borderRadius: 25, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
    payButtonActive: { backgroundColor: '#3A7D6B', borderColor: '#3A7D6B' },
    payButtonDisabled: { backgroundColor: '#FFF', borderColor: '#E0E0E0' },
    payButtonText: { fontSize: 15, fontWeight: 'bold' },

    // Modal
    bottomSheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 15, paddingBottom: 50, width: '100%' },
    notchIndicator: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 2.5, alignSelf: 'center', marginBottom: 25 },
    imageOptionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20, marginBottom: 12 },
    selectedOptionBox: { borderColor: '#3A7D6B', borderWidth: 1.5, backgroundColor: '#F4FAF8' },
    imageOptionIcon: { fontSize: 20, marginRight: 18, color: '#2C4373' },
    imageOptionText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});

export default DetailPembayaranPage;