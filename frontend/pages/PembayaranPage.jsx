import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const PembayaranPage = ({ snapUrl, onFinish }) => {

  // Handler saat status halaman web Midtrans berubah (deteksi sukses/gagal/close)
  const hasFinished = useRef(false);

  const handleNavigationStateChange = (navState) => {
    const { url, loading } = navState;
    if (loading || hasFinished.current) return; // ← tambah ini

    if (url.includes('status_code=200') || url.includes('success')) {
      hasFinished.current = true; // ← set flag
      setTimeout(() => onFinish('success'), 200);
    } else if (url.includes('status_code=201') || url.includes('pending')) {
      hasFinished.current = true;
      setTimeout(() => onFinish('pending'), 200);
    } else if (url.includes('status_code=202') || url.includes('error') || url.includes('failure')) {
      hasFinished.current = true;
      setTimeout(() => onFinish('failed'), 200);
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
      {/* Header Kecil untuk navigasi keluar manual jika terjebak */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => onFinish('closed')}>
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