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
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeft,
  MapPin,
  ChevronRight,
  MessageCircle,
} from 'lucide-react-native';
import { batalkanSesi } from '../services/batalSesiService';
import { createChatRoom } from '../services/chatService';
import CustomAlert from '../components/CustomAlert';
import { Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadDokumentasi } from '../services/dokumentasiService';
import {
  terimaPermintaanSesiAPI,
  selesaikanSesiAPI,
} from '../services/matchingService';

const DetailPermintaanGuruPage = ({
  permintaanData,
  guruData,
  tipePermintaan = 'Permintaan', // 'Permintaan', 'Aktif', 'Berlangsung'
  onBack,
  onTolak, // untuk tipe Permintaan
  onChat, // untuk tipe Aktif & Berlangsung
  onSelesaikan, // untuk tipe Berlangsung
  onAjukanBatal, // untuk tipe Aktif
}) => {
  const data = permintaanData || {};
  const [loading, setLoading] = useState(false);
  const [showDokModal, setShowDokModal] = useState(false);
  const [fotoUri, setFotoUri] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [navigateOnClose, setNavigateOnClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    isConfirmation: false,
  });

  const namaInisial = data.nama_murid
    ? data.nama_murid.substring(0, 2).toUpperCase()
    : 'SN';

  const formatRupiah = angka => {
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
          Alert.alert('Error', 'Tidak dapat membuka Google Maps.'),
        );
      } else {
        const encoded = encodeURIComponent(lokasi);
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encoded}`,
        ).catch(() => Alert.alert('Error', 'Tidak dapat membuka Google Maps.'));
      }
    } else {
      Alert.alert('Info', 'Lokasi tidak tersedia.');
    }
  };

  // ─── Handler untuk Permintaan ─────────────────────────────────
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
      ],
    );
  };

  const handleTerima = async () => {
    Alert.alert(
      'Konfirmasi Terima',
      `Apakah Anda yakin ingin menerima permintaan mengajar dari ${data.nama_murid}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Terima',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await terimaPermintaanSesiAPI(
                data.id_pemesanan,
                guruData.id,
                data.biaya_sesi,
                data.biaya_jarak,
                data.harga_total,
              );
              if (res && res.success) {
                Alert.alert('Sukses', 'Sesi berhasil dikonfirmasi!', [
                  { text: 'OK', onPress: onBack },
                ]);
              } else {
                Alert.alert(
                  'Gagal',
                  res.message || 'Terjadi kesalahan sistem.',
                );
              }
            } catch (e) {
              Alert.alert('Error', 'Terjadi masalah jaringan.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ─── Handler untuk Aktif ─────────────────────────────────────
  const handleAjukanBatal = () => {
    setAlertConfig({
      type: 'gagal',
      title: 'Batalkan sesi?',
      message: `Sesi dengan ${data.nama_murid || 'murid'} akan dibatalkan.`,
      isConfirmation: true,
    });
    setNavigateOnClose(false);
    setAlertVisible(true);
  };

  const prosesBatalGuru = async () => {
    setAlertVisible(false);
    const id = data.id_pemesanan || data.id;
    if (!id) return;
    setLoading(true);
    const res = await batalkanSesi(id, 'guru');
    setLoading(false);

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

  // ─── Handler untuk Berlangsung ───────────────────────────────
  const handleSelesaikan = () => {
    setShowDokModal(true);
  };
  const [fotoBase64, setFotoBase64] = useState(null);
  const handlePilihFoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
      },
      response => {
        if (!response.didCancel && !response.errorCode) {
          const asset = response.assets[0];
          console.log('Foto dipilih:', asset.uri);
          console.log('Foto type:', asset.type);
          console.log('Foto fileSize:', asset.fileSize);
          setFotoUri(asset.uri);
          setFotoBase64(asset.base64);
        }
      },
    );
  };

  const handleKonfirmasiSelesai = async () => {
    if (!fotoUri) {
      Alert.alert('Perhatian', 'Harap pilih foto dokumentasi terlebih dahulu.');
      return;
    }

    setUploadingFoto(true);
    try {
      const id = data.id_pemesanan || data.id;

      // 1. Upload foto
      const uploadResult = await uploadDokumentasi(id, fotoUri, fotoBase64);
      if (!uploadResult.success) {
        Alert.alert('Gagal', uploadResult.message || 'Gagal mengupload foto.');
        return;
      }

      // 2. Update status jadi selesai
      const selesaiResult = await selesaikanSesiAPI(id);
      if (!selesaiResult.success) {
        Alert.alert(
          'Gagal',
          selesaiResult.message || 'Gagal menyelesaikan sesi.',
        );
        return;
      }

      setShowDokModal(false);
      setFotoUri(null);
      setFotoBase64(null);
      if (onSelesaikan) onSelesaikan(id);
    } catch (err) {
      Alert.alert('Error', 'Terjadi kesalahan.');
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleChat = async () => {
    if (!onChat) return;

    const idGuru = guruData?.id;
    const idMurid = data.id_murid;

    if (!idGuru || !idMurid) {
      Alert.alert(
        'Error',
        'Data guru atau murid tidak lengkap untuk membuka chat.',
      );
      return;
    }

    // Room dijamin sudah ada (otomatis dibuat saat pesanan dikonfirmasi),
    // findOrCreate mengembalikan row Chat beserta id_chat-nya.
    const resp = await createChatRoom(idGuru, idMurid);
    const room = resp?.data?.data || {};

    onChat({
      id_guru: idGuru,
      id_murid: idMurid,
      id_chat: room.id_chat,
      nama_murid: data.nama_murid,
      mapel: data.nama_mapel || data.mata_pelajaran,
    });
  };

  // ─── Render tombol berdasarkan tipe ──────────────────────────
  const renderActionBar = () => {
    if (tipePermintaan === 'Permintaan') {
      return (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.btnTolak}
            onPress={handleTolak}
            disabled={loading}
          >
            <Text style={styles.btnTolakText}>Tolak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnTerima, loading && styles.btnDisabled]}
            onPress={handleTerima}
            disabled={loading}
          >
            <Text style={styles.btnTerimaText}>
              {loading ? 'Memproses...' : 'Terima'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Sesi terkonfirmasi & belum dimulai -> boleh dibatalkan
    if (belumMulai) {
      return (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.btnBatal, loading && styles.btnDisabled]}
            onPress={handleAjukanBatal}
            disabled={loading}
          >
            <Text style={styles.btnBatalText}>Batalkan Sesi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Sesi sedang/sudah berlangsung -> diselesaikan
    return (
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.btnSelesaikan, loading && styles.btnDisabled]}
          onPress={handleSelesaikan}
          disabled={loading}
        >
          <Text style={styles.btnSelesaikanText}>Selesaikan Pesanan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Badge status
  const badgeConfig = {
    Permintaan: {
      label: 'Menunggu Konfirmasi',
      bg: '#FFF3E0',
      text: '#E65100',
    },
    Aktif: { label: 'Terkonfirmasi', bg: '#E3F2FD', text: '#1565C0' },
    Berlangsung: {
      label: 'Sedang Berlangsung',
      bg: '#E8F5E9',
      text: '#2E7D32',
    },
  };
  const badge = badgeConfig[tipePermintaan] || badgeConfig.Permintaan;

  // Data lain
  const biayaSesi = data.biaya_sesi || data.harga_total || 0;
  const biayaTransportasi = data.biaya_jarak || 0;
  const totalBayar = data.harga_total || biayaSesi + biayaTransportasi;

  const formatTanggal = raw => {
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
          hour: '2-digit',
          minute: '2-digit',
        });
        const selesai = new Date(data.waktu_selesai).toLocaleTimeString(
          'id-ID',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        );
        return `${mulai} - ${selesai}`;
      } catch {
        return '-';
      }
    }
    return data.waktu || '-';
  };

  const tanggal = formatTanggal(data.waktu_mulai);
  const waktuSesi = formatWaktu();
  const lokasiAlamat =
    data.lokasi_sesi || data.lokasi || data.alamat || 'Alamat tidak tersedia';

  // Penentu tombol bawah untuk sesi terkonfirmasi:
  // sekarang < waktu_mulai  -> masih bisa dibatalkan
  // sekarang >= waktu_mulai -> sesi sedang/sudah berlangsung -> diselesaikan
  const sekarang = new Date();
  const waktuMulaiObj = data.waktu_mulai ? new Date(data.waktu_mulai) : null;
  const belumMulai =
    waktuMulaiObj && !isNaN(waktuMulaiObj.getTime())
      ? sekarang < waktuMulaiObj
      : true;

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
        {/* Profil Murid + Badge + Chat (sejajar nama) */}
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{namaInisial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.namaMurid}>
              {data.nama_murid || 'Nama Murid'}
            </Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
          </View>
          {tipePermintaan !== 'Permintaan' && (
            <TouchableOpacity style={styles.btnChatHeader} onPress={handleChat}>
              <MessageCircle
                size={16}
                color="#FFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.btnChatHeaderText}>Chat Murid</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tanggal & Waktu */}
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

        {/* Jenjang */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Jenjang</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldValue}>
              {data.jenjang_pendidikan || data.jenjang || '-'}
            </Text>
          </View>
        </View>

        {/* Mata Pelajaran */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Mata Pelajaran</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldValue}>
              {data.nama_mapel || data.mata_pelajaran || '-'}
            </Text>
          </View>
        </View>

        {/* Materi */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Materi</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldValue}>
              {data.nama_materi || data.materi || '-'}
            </Text>
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>📍 Peta Lokasi</Text>
            <Text style={styles.mapPlaceholderSub}>
              Tap tombol lokasi di bawah untuk membuka Google Maps
            </Text>
          </View>
        </View>

        {/* Lokasi Row */}
        <TouchableOpacity
          style={styles.lokasiRow}
          onPress={handleBukaMap}
          activeOpacity={0.7}
        >
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

        {/* Rincian Bayaran */}
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

      {/* Action Bar Dinamis */}
      {renderActionBar()}
      {/* Modal Dokumentasi */}
      {showDokModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Dokumentasi Sesi</Text>
            <Text style={styles.modalSubtitle}>
              Upload foto sebagai bukti sesi telah selesai
            </Text>

            {/* Preview Foto */}
            <TouchableOpacity style={styles.fotoBox} onPress={handlePilihFoto}>
              {fotoUri ? (
                <Image
                  source={{ uri: fotoUri }}
                  style={styles.fotoPreview}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Text style={styles.fotoIcon}>📷</Text>
                  <Text style={styles.fotoHint}>Tap untuk pilih foto</Text>
                </>
              )}
            </TouchableOpacity>

            {fotoUri && (
              <TouchableOpacity onPress={handlePilihFoto}>
                <Text style={styles.gantiText}>Ganti Foto</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalBtnBatal}
                onPress={() => {
                  setShowDokModal(false);
                  setFotoUri(null);
                }}
                disabled={uploadingFoto}
              >
                <Text style={styles.modalBtnBatalText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnSelesai,
                  uploadingFoto && { opacity: 0.6 },
                ]}
                onPress={handleKonfirmasiSelesai}
                disabled={uploadingFoto}
              >
                {uploadingFoto ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnSelesaiText}>Selesaikan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        isConfirmation={alertConfig.isConfirmation}
        onConfirm={prosesBatalGuru}
        onClose={() => {
          setAlertVisible(false);
          if (!alertConfig.isConfirmation && navigateOnClose)
            onBack && onBack();
        }}
      />
    </View>
  );
};

// Styles (sama seperti sebelumnya, ditambah style untuk tombol tambahan)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 80 },
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  namaMurid: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
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
  dtLabel: {
    fontSize: 11,
    color: '#ABABAB',
    marginBottom: 6,
    fontWeight: '500',
  },
  dtValue: { fontSize: 14, fontWeight: 'bold', color: '#284B7A' },
  fieldSection: { marginHorizontal: 24, marginBottom: 14 },
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
  fieldValue: { fontSize: 14, color: '#444', fontWeight: '500' },
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
  mapPlaceholderText: { fontSize: 20, marginBottom: 6 },
  mapPlaceholderSub: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
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
  lokasiTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  lokasiAlamat: { fontSize: 12, color: '#666' },
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
  rincianDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  totalValue: { fontSize: 17, fontWeight: 'bold', color: '#000' },
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
  btnDisabled: { opacity: 0.6 },
  btnBatal: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBatalText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnChat: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#284B7A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnChatText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  btnChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#284B7A',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
  },
  btnChatHeaderText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  btnSelesaikan: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#2A7A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSelesaikanText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  fotoBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  fotoPreview: {
    width: '100%',
    height: '100%',
  },
  fotoIcon: { fontSize: 40, marginBottom: 8 },
  fotoHint: { fontSize: 13, color: '#ABABAB' },
  gantiText: {
    fontSize: 13,
    color: '#284B7A',
    fontWeight: '600',
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalBtnBatal: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnBatalText: { fontSize: 14, color: '#888', fontWeight: '600' },
  modalBtnSelesai: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2A7A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSelesaiText: { fontSize: 14, color: '#FFF', fontWeight: 'bold' },
});

export default DetailPermintaanGuruPage;
