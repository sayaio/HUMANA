import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
<<<<<<< HEAD
import { prosesCod, prosesMidtrans } from '../services/bankerService';
=======

import { getSesiDetail } from '../services/bankerService';

import { API_URL } from '../src/config'; // Sesuaikan path config kamu
>>>>>>> fixpembayaranpage

const DetailPembayaranPage = ({ sessionData, onBack, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [displayData, setDetailSesi] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const idSesi = sessionData?.id_sesi || sessionData?.id_pemesanan;

    useEffect(() => {
        const fetchDetail = async () => {
            if (!idSesi) {
                setIsLoadingData(false);
                return;
            }

            try {
                console.log(`📡 Fetching detail sesi untuk ID: ${idSesi}`);
                const response = await getSesiDetail(idSesi);

                // Asumsi backend mengembalikan { success: true, data: {...} } atau langsung objek datanya
                if (response && response.data) {
                    setDetailSesi(response.data);
                } else if (response && !response.success && response.message) {
                    console.log('⚠️ Warning:', response.message);
                } else {
                    // Jika response langsung berupa objek data
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

    // Ambil data dari DB (displayData) atau fallback ke prop dari layar sebelumnya (sessionData)
    const biayaSesi = displayData?.pembayaran?.biaya_sesi ?? sessionData?.biaya_sesi ?? sessionData?.harga ?? 0;
    const biayaJarak = displayData?.pembayaran?.biaya_jarak ?? sessionData?.biaya_jarak ?? sessionData?.biaya_transport ?? 0;
    const totalBayar = displayData?.pembayaran?.nominal ?? sessionData?.nominal ?? sessionData?.total_harga ?? (biayaSesi + biayaJarak);

    // Helper untuk memformat angka ke Rupiah secara otomatis
    const formatRupiah = (angka) => {
        if (angka === undefined || angka === null) return 'Rp 0';
        return `Rp ${Number(angka).toLocaleString('id-ID')}`;
    };

    const handlePaymentPress = async () => {
        const idSesi = sessionData?.id_sesi || sessionData?.id_pemesanan;

        if (!selectedMethod) {
            requestAnimationFrame(() => {
                Alert.alert('Peringatan', 'Mohon pilih metode pembayaran terlebih dahulu.');
            });
            return;
        }

        // --- COD ---
        if (selectedMethod === 'cod') {
            try {
                setIsProcessing(true);
                const result = await prosesCod(idSesi); // ← berubah
                setIsProcessing(false);

                if (result.success) {
                    if (onBack) onBack();
                } else {
                    throw new Error(result.message || 'Gagal memproses COD.');
                }
            } catch (error) {
                setIsProcessing(false);
                Alert.alert('Gagal', error.message || 'Terjadi kesalahan sistem.');
            }
            return;
        }

        // --- VA / EWALLET ---
        if (selectedMethod === 'va' || selectedMethod === 'ewallet') {
            try {
                setIsProcessing(true);
                const result = await prosesMidtrans(idSesi, selectedMethod); // ← berubah
                setIsProcessing(false);

                if (result.success && (result.snap_url || result.data?.snap_url)) {
                    const url = result.snap_url || result.data?.snap_url;
                    requestAnimationFrame(() => {
                        if (onPaymentSuccess) onPaymentSuccess(url);
                    });
                } else {
                    throw new Error(result.message || 'Gagal mendapatkan URL pembayaran.');
                }
            } catch (error) {
                setIsProcessing(false);
                requestAnimationFrame(() => {
                    Alert.alert('Gagal Transaksi', error.message || 'Gagal terhubung ke sistem pembayaran.');
                });
            }
        }
    };

    const getMethodLabel = () => {
        if (selectedMethod === 'va') return 'Virtual Account';
        if (selectedMethod === 'ewallet') return 'E-Wallet / QRIS';
        if (selectedMethod === 'cod') return 'Bayar di Tempat (COD)';
        return 'Belum Dipilih';
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backText}>❮ Kembali</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail Pembayaran</Text>
                    <View style={{ width: 50 }} />
                </View>

                {/* INFO MATERI */}
                <View style={styles.materiSection}>
                    <Text style={styles.subjectTitle}>{sessionData?.nama_mapel || 'Mata Pelajaran'}</Text>
                    <Text style={styles.chapterText}>{sessionData?.nama_materi || 'Materi Pembahasan'}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.gradeText}>
                        {sessionData?.jenjang || 'Jenjang'} - Kelas {sessionData?.kelas || '-'}
                    </Text>
                </View>

                {/* CARD UTAMA */}
                <View style={styles.mainCard}>
                    <Text style={styles.inputLabel}>Lokasi Belajar</Text>
                    <TextInput style={styles.disabledInput} value={sessionData?.tipe_lokasi || "Alamat Tujuan"} editable={false} />
                    <View style={styles.locationWrapper}>
                        <Text style={styles.pinIcon}>📍</Text>
                        <TextInput style={[styles.disabledInput, { flex: 1, borderWidth: 0, paddingLeft: 30 }]} value={sessionData?.lokasi || "Koordinat tidak ditemukan"} editable={false} />
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

<<<<<<< HEAD
                    {/* 1. BIAYA SESI */}
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Biaya Sesi</Text>
                        <Text style={styles.priceValue}>: {formatRupiah(sessionData?.biaya_sesi || sessionData?.biaya_belajar || sessionData?.harga)}</Text>
=======
                    {/* ✅ MENGAMBIL DARI OBJEK PEMBAYARAN API, DENGAN FALLBACK KE PROPS */}
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Biaya Pembelajaran</Text>
                        <Text style={styles.priceValue}>: {formatRupiah(biayaSesi)}</Text>
>>>>>>> fixpembayaranpage
                    </View>

                    {/* 2. BIAYA JARAK */}
                    <View style={styles.priceRow}>
<<<<<<< HEAD
                        <Text style={styles.priceLabel}>Biaya Jarak (Transportasi)</Text>
                        <Text style={styles.priceValue}>: {formatRupiah(sessionData?.biaya_jarak || sessionData?.biaya_transport)}</Text>
=======
                        <Text style={styles.priceLabel}>Biaya Transportasi Guru</Text>
                        <Text style={styles.priceValue}>: {formatRupiah(biayaJarak)}</Text>
>>>>>>> fixpembayaranpage
                    </View>

                    <View style={[styles.divider, { marginVertical: 12 }]} />

                    {/* TOTAL */}
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

            {/* PORTAL BOTTOM SHEET */}
            {showMethodModal && (
                <View style={styles.customModalOverlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        activeOpacity={1}
                        onPress={() => setShowMethodModal(false)}
                    />

                    <View style={styles.bottomSheetContainer}>
                        <View style={styles.notchIndicator} />

                        <TouchableOpacity
                            style={[styles.imageOptionBox, selectedMethod === 'va' && styles.selectedOptionBox]}
                            onPress={() => {
                                setShowMethodModal(false);
                                setTimeout(() => { setSelectedMethod('va'); }, 100);
                            }}
                        >
                            <Text style={styles.imageOptionIcon}>🏛️</Text>
                            <Text style={styles.imageOptionText}>Virtual Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.imageOptionBox, selectedMethod === 'ewallet' && styles.selectedOptionBox]}
                            onPress={() => {
                                setShowMethodModal(false);
                                setTimeout(() => { setSelectedMethod('ewallet'); }, 100);
                            }}
                        >
                            <Text style={styles.imageOptionIcon}>💼</Text>
                            <Text style={styles.imageOptionText}>E-Wallet / QR Code</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.imageOptionBox, selectedMethod === 'cod' && styles.selectedOptionBox]}
                            onPress={() => {
                                setShowMethodModal(false);
                                setTimeout(() => { setSelectedMethod('cod'); }, 100);
                            }}
                        >
                            <Text style={styles.imageOptionIcon}>💵</Text>
                            <Text style={styles.imageOptionText}>Bayar di Tempat (COD)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', paddingTop: 40 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginVertical: 15 },
    backText: { fontSize: 15, color: '#666', marginRight: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    materiSection: { paddingHorizontal: 20, marginBottom: 15 },
    subjectTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    chapterText: { fontSize: 15, color: '#666', marginTop: 2 },
    gradeText: { fontSize: 14, color: '#888' },
    divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 8 },
    mainCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginHorizontal: 20,
        borderWidth: 1, borderColor: '#EFEFEF', elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
    },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#000', marginBottom: 6, marginTop: 10 },
    disabledInput: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#A0A0A0' },
    locationWrapper: { marginTop: 8, justifyContent: 'center' },
    pinIcon: { position: 'absolute', left: 12, zIndex: 1, fontSize: 14 },
    paymentCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginHorizontal: 20, marginTop: 15,
        borderWidth: 1, borderColor: '#EFEFEF', elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
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
    bottomActionContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 },
    payButton: { borderRadius: 25, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
    payButtonActive: { backgroundColor: '#3A7D6B', borderColor: '#3A7D6B' },
    payButtonDisabled: { backgroundColor: '#FFF', borderColor: '#E0E0E0' },
    payButtonText: { fontSize: 15, fontWeight: 'bold' },
    customModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 9999, elevation: 999 },
    bottomSheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 15, paddingBottom: 50, zIndex: 10000, elevation: 1000 },
    notchIndicator: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 2.5, alignSelf: 'center', marginBottom: 25 },
    imageOptionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 20, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3 },
    selectedOptionBox: { borderColor: '#3A7D6B', borderWidth: 1.5, backgroundColor: '#F4FAF8' },
    imageOptionIcon: { fontSize: 20, marginRight: 18, color: '#2C4373' },
    imageOptionText: { fontSize: 16, fontWeight: 'bold', color: '#000' }
});

export default DetailPembayaranPage;