import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_URL } from '../src/config';

const PembayaranPage = ({ snapUrl, idPemesanan, onFinish }) => {

  const hasFinished = useRef(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!idPemesanan) return;
    if (hasFinished.current) return;

    console.log('🔄 Memulai polling status pemesanan untuk ID:', idPemesanan);

    const interval = setInterval(async () => {
      if (hasFinished.current) {
        clearInterval(interval);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/pemesanan/cek-status?id_pemesanan=${idPemesanan}`);
        const result = await response.json();
        console.log('📊 Polling status:', result.status_pemesanan);

        // Jika status 'selesai' atau 'dikonfirmasi', anggap sukses
        if (result.success && result.status_pemesanan === 'selesai') {
          console.log('✅ Polling mendeteksi sukses! Redirect ke Home dalam 3 detik...');
          clearInterval(interval);
          hasFinished.current = true;
          setIsSuccess(true);
          setTimeout(() => onFinish('success_close'), 3000);
        }
      } catch (error) {
        console.warn('Polling error:', error);
      }
    }, 3000); // Cek setiap 3 detik

    return () => clearInterval(interval);
  }, [idPemesanan]);

  // Handler tombol Tutup — kembali ke detail pembayaran tanpa membatalkan sesi
  const handleTutup = () => {
    console.log('🔴 Tombol Tutup ditekan, isSuccess:', isSuccess, 'hasFinished:', hasFinished.current);
    if (hasFinished.current) return;
    hasFinished.current = true;

    if (isSuccess) {
      console.log('✅ Sudah sukses, kirim success_close');
      onFinish('success_close');
      return;
    }

    onFinish('closed');
  };

  // Handler saat status halaman web Midtrans berubah (deteksi sukses/gagal)
  const handleNavigationStateChange = (navState) => {
    const { url, loading } = navState;
    if (loading || hasFinished.current) return;

    console.log('🌐 [WebView] URL:', url);

    // Deteksi halaman sukses (termasuk simulator)
    if (
      url.includes('status_code=200') ||
      url.includes('success') ||
      url.includes('finish') ||
      url.includes('gopay-finish') ||
      url.includes('deeplink/finish') ||
      url.includes('transaction/success') ||
      url.includes('gopay-finish-deeplink') ||
      url.includes('simulator') && url.includes('payment') // ← deteksi simulator
    ) {
      console.log('✅ WebView mendeteksi sukses!');
      hasFinished.current = true;
      setIsSuccess(true);
      setTimeout(() => onFinish('success_close'), 2000);
    }
  };

  // Jika snapUrl belum selesai dimuat oleh backend
  if (!snapUrl) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B7A57" />
        <Text style={styles.loadingText}>Menyiapkan gerbang pembayaran...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Kecil untuk navigasi keluar manual */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleTutup}>
          <Text style={styles.closeText}>✕ Tutup</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sistem Pembayaran</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* WebView untuk merender Snap Midtrans */}
      <WebView
        source={{ uri: snapUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            color="#3B7A57"
            size="large"
            style={styles.webViewLoading}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: 50 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 15, fontSize: 14, color: '#666' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  closeButton: { paddingVertical: 5 },
  closeText: { fontSize: 15, color: '#E12525', fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  }
});

export default PembayaranPage;
