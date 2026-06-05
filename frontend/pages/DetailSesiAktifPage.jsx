import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview'; // 1. Import WebView di sini
import PageHeader from '../components/PageHeader';
import CustomAlert from '../components/CustomAlert';
import { batalkanSesi } from '../services/batalSesiService';
import { pemesananService } from '../services/pemesananService';

const { width, height } = Dimensions.get('window');

const DetailSesiAktifPage = ({ onBack, sessionData }) => {
  console.log('DATA DARI BACKEND:', JSON.stringify(sessionData, null, 2));
  const [isCanceling, setIsCanceling] = useState(false);
  const idPemesanan = sessionData?.id_pemesanan;

  const [alertVisible, setAlertVisible] = useState(false);
  const [navigateOnClose, setNavigateOnClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    isConfirmation: false,
  });
  const [alamatLengkap, setAlamatLengkap] = useState('Memuat alamat...');

  useEffect(() => {
    const fetchAlamat = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitudeSesi}&lon=${longitudeSesi}&format=json`,
          { headers: { 'User-Agent': 'HumanaApp/1.0' } },
        );
        const data = await response.json();
        if (data && data.display_name) {
          setAlamatLengkap(data.display_name);
        } else {
          setAlamatLengkap(`${latitudeSesi}, ${longitudeSesi}`);
        }
      } catch (err) {
        setAlamatLengkap(`${latitudeSesi}, ${longitudeSesi}`);
      }
    };
    fetchAlamat();
  }, [latitudeSesi, longitudeSesi]);

  // Deteksi jika GURU membatalkan sesi
  useEffect(() => {
    if (!idPemesanan) return;
    const interval = setInterval(async () => {
      try {
        const res = await pemesananService.cekStatusPemesanan(idPemesanan);
        if (res?.success && res.status_pemesanan === 'dibatalkan_guru') {
          clearInterval(interval);
          setAlertConfig({
            type: 'gagal',
            title: 'Sesi Dibatalkan Guru',
            message:
              'Guru membatalkan sesi ini. Dana kamu dikembalikan (refund).',
            isConfirmation: false,
          });
          setNavigateOnClose(true);
          setAlertVisible(true);
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [idPemesanan]);

  const prosesPembatalan = async () => {
    setAlertVisible(false);
    if (!idPemesanan) {
      onBack && onBack();
      return;
    }
    setIsCanceling(true);
    const res = await batalkanSesi(idPemesanan, 'murid');
    setIsCanceling(false);

    if (res.success) {
      const detail = res.data || {};
      setAlertConfig({
        type: 'success',
        title: 'Sesi Dibatalkan',
        message: detail.message || 'Sesi berhasil dibatalkan.',
        isConfirmation: false,
      });
      setNavigateOnClose(true);
    } else {
      setAlertConfig({
        type: 'gagal',
        title: 'Gagal',
        message: res.message || 'Gagal membatalkan sesi.',
        isConfirmation: false,
      });
      setNavigateOnClose(false);
    }
    setAlertVisible(true);
  };

  // ==========================================
  // PEMETAAN VARIABEL DATA DARI SESSIONDATA
  // ==========================================
  const namaMapel = sessionData?.nama_mapel || 'Matematika';
  const namaMateri = sessionData?.nama_materi || 'Aljabar Dasar';

  // Menyesuaikan dengan kelas_murid dari backend (contoh hasil: "Kelas 11")
  const jenjangKelas = sessionData?.kelas_murid
    ? `Kelas ${sessionData.kelas_murid}`
    : '12 SMA – IPA';

  const tipeLokasi = 'Lokasi Pertemuan';
  // Karena tidak ada teks alamat jalan dari backend, kita tampilkan koordinatnya sebagai teks
  const lokasiAlamat = sessionData?.lokasi_sesi
    ? `Koordinat Sesi: ${sessionData.lokasi_sesi}`
    : 'Jl. Telekomunikasi No.1, Sukapura.';

  // ─── LOGIKA BARU: MEMECAH STRING KOORDINAT DARI BACKEND ───
  let latitudeSesi = '-6.9744'; // default cadangan
  let longitudeSesi = '107.6303'; // default cadangan

  if (sessionData?.lokasi_sesi) {
    const koordinatArray = sessionData.lokasi_sesi.split(','); // Memisahkan lat dan lng berdasarkan tanda koma
    if (koordinatArray.length === 2) {
      latitudeSesi = koordinatArray[0].trim(); // Mengambil angka depan (-6.97105)
      longitudeSesi = koordinatArray[1].trim(); // Mengambil angka belakang (107.64674)
    }
  }
  // ─────────────────────────────────────────────────────────
  const bukaGoogleMapsEksternal = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitudeSesi},${longitudeSesi}`;
    Linking.openURL(url).catch(err =>
      console.error('Gagal membuka Google Maps:', err),
    );
  };

  // 2. TEMPLATE HTML UNTUK MAPS GRATIS (LEAFLET + OPENSTREETMAP)
  const mapHtmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Inisialisasi map berdasarkan koordinat dinamis dari react native
        var map = L.map('map', { zoomControl: false }).setView([${latitudeSesi}, ${longitudeSesi}], 15);
        
        // Load gambar peta dari server OpenStreetMap gratis
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Tambahkan marker pin merah di lokasi
        L.marker([${latitudeSesi}, ${longitudeSesi}]).addTo(map);
      </script>
    </body>
    </html>
  `;

  const formatTanggalFigma = () => {
    const rawTanggal = sessionData?.tanggal || sessionData?.waktu_mulai;
    if (!rawTanggal) return '12 Juni 2023';
    try {
      const tglOnly = rawTanggal.toString().substring(0, 10);
      const tglParts = tglOnly.split('-');
      if (tglParts.length === 3) {
        const daftarBulan = [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember',
        ];
        return `${parseInt(tglParts[2], 10)} ${
          daftarBulan[parseInt(tglParts[1], 10) - 1] || tglParts[1]
        } ${tglParts[0]}`;
      }
    } catch (e) {}
    return rawTanggal;
  };

  const formatWaktuFigma = () =>
    sessionData?.waktu_string || sessionData?.waktu_sesi || '10:30 - 12:30';

  const handleBatalkanPesanan = () => {
    setAlertConfig({
      type: 'gagal',
      title: 'Batalkan sesi?',
      message: 'Sesi yang sudah dibatalkan tidak dapat dikembalikan.',
      isConfirmation: true,
    });
    setNavigateOnClose(false);
    setAlertVisible(true);
  };

  const cekApakahSudahMulai = () => {
    if (!sessionData?.waktu_mulai) return false;
    try {
      const formatWaktuSesi = sessionData.waktu_mulai
        .toString()
        .replace(' ', 'T');
      return new Date() >= new Date(formatWaktuSesi);
    } catch (error) {
      return false;
    }
  };

  const sudahMulai = cekApakahSudahMulai();
  const tombolDisabled = isCanceling || sudahMulai;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <PageHeader title="Detail Pemesanan" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBodyPadding}
      >
        {/* ROW GRID: TANGGAL & WAKTU SESI */}
        <View style={styles.metaGridRow}>
          <View style={styles.metaGridCard}>
            <Text style={styles.metaInputLabel}>Tanggal</Text>
            <Text style={[styles.metaValueText, { color: '#4F46E5' }]}>
              {formatTanggalFigma()}
            </Text>
          </View>
          <View style={styles.metaGridCard}>
            <Text style={styles.metaInputLabel}>Waktu Sesi</Text>
            <Text style={[styles.metaValueText, { color: '#4F46E5' }]}>
              {formatWaktuFigma()}
            </Text>
          </View>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Jenjang</Text>
          <View style={styles.disabledOutlineBox}>
            <Text style={styles.disabledBoxValueText}>{jenjangKelas}</Text>
          </View>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Mata Pelajaran</Text>
          <View style={styles.disabledOutlineBox}>
            <Text style={styles.disabledBoxValueText}>{namaMapel}</Text>
          </View>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Materi</Text>
          <View style={styles.disabledOutlineBox}>
            <Text style={styles.disabledBoxValueText}>{namaMateri}</Text>
          </View>
        </View>

        {/* 3. AREA MAPS INTERAKTIF TANPA API KEY GOOGLE */}
        <View style={styles.mapsContainerWrapper}>
          <WebView
            originWhitelist={['*']}
            source={{ html: mapHtmlTemplate }}
            style={styles.mapsStaticImageMedia}
            geolocationEnabled={true}
          />
        </View>

        {/* AREA DETAIL ALAMAT (Klik untuk buka rute luar) */}
        <TouchableOpacity
          style={styles.locationCardRow}
          activeOpacity={0.8}
          onPress={bukaGoogleMapsEksternal}
        >
          <View style={styles.locationIconMarkerCircle}>
            <Text style={{ fontSize: 16, color: '#284B7A' }}>📍</Text>
          </View>
          <View style={styles.locationTextMetaColumn}>
            <Text style={styles.locationTipeLabelText}>{tipeLokasi}</Text>
            <Text style={styles.locationFullAlamatText} numberOfLines={3}>
              {alamatLengkap}
            </Text>
          </View>
          <Text style={styles.locationChevronRightIcon}>❯</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PERSISTENT FOOTER */}
      <View style={styles.persistentFooterContainer}>
        <TouchableOpacity
          style={[
            styles.cancelRequestSubmitButton,
            sudahMulai && styles.cancelButtonBlocked,
          ]}
          onPress={handleBatalkanPesanan}
          disabled={tombolDisabled}
          activeOpacity={0.8}
        >
          {isCanceling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.innerButtonFlexRow}>
              {!sudahMulai && <Text style={styles.cancelCrossIconText}>✕</Text>}
              <Text
                style={[
                  styles.cancelButtonMainLabelText,
                  sudahMulai && styles.cancelTextBlocked,
                ]}
              >
                {sudahMulai ? 'Sesi Sudah Dimulai' : 'Batalkan Pesanan'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        isConfirmation={alertConfig.isConfirmation}
        onConfirm={prosesPembatalan}
        onClose={() => {
          setAlertVisible(false);
          if (!alertConfig.isConfirmation && navigateOnClose)
            onBack && onBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollBodyPadding: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  metaGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaGridCard: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaInputLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  metaValueText: { fontSize: 14, fontWeight: 'bold' },
  fieldBlockWrapper: { marginBottom: 16 },
  fieldSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  disabledOutlineBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabledBoxValueText: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  mapsContainerWrapper: {
    width: '100%',
    height: height * 0.22,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden', // Biar ujung-ujung WebView-nya ikut melengkung (border-radius)
  },
  mapsStaticImageMedia: { width: '100%', height: '100%' },

  locationCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  locationIconMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextMetaColumn: { flex: 1, marginRight: 8 },
  locationTipeLabelText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  locationFullAlamatText: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  locationChevronRightIcon: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  persistentFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  cancelRequestSubmitButton: {
    backgroundColor: '#E11D48',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerButtonFlexRow: { flexDirection: 'row', alignItems: 'center' },
  cancelCrossIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cancelButtonMainLabelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelButtonBlocked: { backgroundColor: '#E0E0E0' },
  cancelTextBlocked: { color: '#9E9E9E' },
});

export default DetailSesiAktifPage;
