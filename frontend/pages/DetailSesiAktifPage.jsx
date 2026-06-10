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
import { RefreshControl } from 'react-native';
import PageHeader from '../components/PageHeader';
import { useAppAlert } from '../components/AppAlertProvider';
import { batalkanSesi } from '../services/batalSesiService';
import { authService } from '../services/authService';
import { mapService } from '../services/mapService';
import { pemesananService } from '../services/pemesananService';
import { fetchGuruRating } from '../services/feedbackService';
import { createChatRoom } from '../services/chatService';
import { formatRupiah } from '../utils/formatters';
import { MessageCircle, MapPin } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const DetailSesiAktifPage = ({ onBack, sessionData, onChat }) => {
  console.log('DATA DARI BACKEND:', JSON.stringify(sessionData, null, 2));
  const { showInfo, showConfirm } = useAppAlert();
  const [isCanceling, setIsCanceling] = useState(false);
  const idPemesanan = sessionData?.id_pemesanan;
  const [alamatLengkap, setAlamatLengkap] = useState('Memuat alamat...');
  const [guruRating, setGuruRating] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const idGuru = sessionData?.id_guru;
  const namaGuru = sessionData?.nama_guru || 'Guru';

  const getInitials = nama => {
    if (!nama) return '?';
    return nama.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchRating = async () => {
      if (!idGuru) return;
      const res = await fetchGuruRating(idGuru);
      if (res?.success) setGuruRating(res.data?.rating ?? null);
    };
    fetchRating();
  }, [idGuru]);

  let initialLat = '-6.9744';
  let initialLng = '107.6303';
  let initialAddress = '';

  if (sessionData?.lokasi_sesi) {
    const parts = sessionData.lokasi_sesi.split('|');
    const coordsStr = parts[0];
    if (parts.length > 1) {
      initialAddress = parts[1];
    }
    const koordinatArray = coordsStr.split(',');
    if (koordinatArray.length >= 2) {
      initialLat = parseFloat(koordinatArray[0].trim()).toString();
      initialLng = parseFloat(koordinatArray[1].trim()).toString();
    }
  }

  const latitudeSesi = initialLat;
  const longitudeSesi = initialLng;

  useEffect(() => {
    if (initialAddress) {
      setAlamatLengkap(initialAddress);
      return;
    }
    const fetchAlamat = async () => {
      const result = await mapService.getAlamatByKoordinat(initialLat, initialLng);
      setAlamatLengkap(result.alamat);
    };
    fetchAlamat();
  }, [initialLat, initialLng, initialAddress]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh for UI, actual refresh is handled by the parent
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Deteksi jika GURU membatalkan sesi
  useEffect(() => {
    if (!idPemesanan) return;
    const interval = setInterval(async () => {
      try {
        const res = await pemesananService.cekStatusPemesanan(idPemesanan);
        if (res?.success && res.status_pemesanan === 'dibatalkan_guru') {
          clearInterval(interval);
          showInfo(
            'Sesi Dibatalkan Guru',
            'Guru membatalkan sesi ini. Dana kamu dikembalikan (refund).',
            { type: 'gagal', onClose: () => onBack && onBack() },
          );
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [idPemesanan, onBack, showInfo]);

  const prosesPembatalan = async () => {
    if (!idPemesanan) {
      onBack && onBack();
      return;
    }
    setIsCanceling(true);
    const res = await batalkanSesi(idPemesanan, 'murid');
    setIsCanceling(false);

    if (res.success) {
      const detail = res.data || {};
      showInfo('Sesi Dibatalkan', detail.message || 'Sesi berhasil dibatalkan.', {
        onClose: () => onBack && onBack(),
      });
    } else {
      showInfo('Gagal', res.message || 'Gagal membatalkan sesi.');
    }
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
  // Sudah dipindahkan ke atas dengan use state
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

  const safeParseDate = (raw) => {
    if (!raw) return null;
    const d = new Date(raw instanceof Date ? raw : raw.toString().replace(' ', 'T'));
    return isNaN(d.getTime()) ? null : d;
  };

  const formatJam = (raw) => {
    const d = safeParseDate(raw);
    if (!d) return '--:--';
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatWaktuFigma = () => {
    if (sessionData?.waktu_string) return sessionData.waktu_string;
    if (sessionData?.waktu_sesi) return sessionData.waktu_sesi;
    const mulai = formatJam(sessionData?.waktu_mulai);
    const selesai = formatJam(sessionData?.waktu_selesai);
    return `${mulai} - ${selesai}`;
  };

  const handleBatalkanPesanan = () => {
    showConfirm(
      'Batalkan sesi?',
      'Sesi yang sudah dibatalkan tidak dapat dikembalikan.',
      prosesPembatalan,
    );
  };

  const cekApakahSudahMulai = () => {
    if (!sessionData?.waktu_mulai) return false;
    try {
      const d = safeParseDate(sessionData.waktu_mulai);
      return d ? new Date() >= d : false;
    } catch (error) {
      return false;
    }
  };

  const sudahMulai = cekApakahSudahMulai();
  const tombolDisabled = isCanceling || sudahMulai;

  const handleChat = async () => {
    if (!onChat) return;
    const idMurid = sessionData?.id_murid || sessionData?.id_user;
    if (!idGuru || !idMurid) {
      showInfo('Error', 'Data guru atau murid tidak lengkap.', { type: 'gagal' });
      return;
    }
    try {
      const resp = await createChatRoom(idGuru, idMurid);
      const room = resp?.data?.data || {};
      onChat({
        id_guru: idGuru,
        id_murid: idMurid,
        id_chat: room.id_chat,
        nama_guru: namaGuru,
        mapel: sessionData?.nama_mapel || sessionData?.mata_pelajaran,
      });
    } catch (err) {
      console.log('Error chat:', err);
      showInfo('Error', 'Gagal memuat chat.', { type: 'gagal' });
    }
  };



  const biayaSesi = sessionData?.biaya_sesi || 0;
  const biayaTransportasi = sessionData?.biaya_jarak || 0;
  const totalBayar = sessionData?.nominal || sessionData?.harga_total || (biayaSesi + biayaTransportasi);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <PageHeader title="Detail Pemesanan" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBodyPadding}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#284B7A']} />
        }
      >
        {/* KARTU PROFIL GURU */}
        <View style={styles.guruCard}>
          <View style={styles.guruAvatar}>
            <Text style={styles.guruAvatarText}>{getInitials(namaGuru)}</Text>
          </View>
          <View style={styles.guruInfo}>
            <Text style={styles.guruName}>{namaGuru}</Text>
            {guruRating !== null && guruRating !== undefined && (
              <Text style={Number(guruRating) > 0 ? styles.guruRating : styles.guruNoRating}>
                {Number(guruRating) > 0
                  ? `★ ${Number(guruRating).toFixed(1)}`
                  : 'Belum ada rating'}
              </Text>
            )}
          </View>
          {onChat && (
            <TouchableOpacity style={styles.btnChatHeader} onPress={handleChat}>
              <MessageCircle size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.btnChatHeaderText}>Chat Guru</Text>
            </TouchableOpacity>
          )}
        </View>

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
            <MapPin size={18} color="#284B7A" />
          </View>
          <View style={styles.locationTextMetaColumn}>
            <Text style={styles.locationTipeLabelText}>{tipeLokasi}</Text>
            <Text style={styles.locationFullAlamatText} numberOfLines={3}>
              {alamatLengkap}
            </Text>
          </View>
          <Text style={styles.locationChevronRightIcon}>❯</Text>
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
            <Text style={styles.rincianValue}>
              : {formatRupiah(biayaTransportasi)}
            </Text>
          </View>
          <View style={styles.rincianDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bayaran</Text>
            <Text style={styles.totalValue}>: {formatRupiah(totalBayar)}</Text>
          </View>
        </View>

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
  guruCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  guruAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#284B7A',
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
  guruInfo: { flex: 1, paddingRight: 8 },
  guruName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  guruRating: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '600',
    marginTop: 3,
  },
  guruNoRating: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  btnChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#284B7A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  btnChatHeaderText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
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
  rincianCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  rincianDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  totalValue: { fontSize: 17, fontWeight: 'bold', color: '#000' },
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
