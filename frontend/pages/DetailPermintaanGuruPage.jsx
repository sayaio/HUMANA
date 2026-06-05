import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  MapPin,
  ChevronRight,
  MessageCircle,
} from 'lucide-react-native';
import { batalkanSesi } from '../services/batalSesiService';
import { createChatRoom } from '../services/chatService';
import PageHeader from '../components/PageHeader';
import { useAppAlert } from '../components/AppAlertProvider';
import DimmedModal from '../components/DimmedModal';
import { centerModalCardBase, MODAL_CARD_WIDTH } from '../components/modalTheme';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadDokumentasi } from '../services/dokumentasiService';
import {
  terimaPermintaanSesiAPI,
  selesaikanSesiAPI,
} from '../services/matchingService';
import { getStatusPembayaran } from '../services/bankerService';
import { WebView } from 'react-native-webview';

const NOMINATIM_HEADERS = {
  'User-Agent': 'HumanaApp/1.0 (Aplikasi Bimbingan Belajar)',
};

const parseKoordinatDariString = str => {
  if (!str) return null;
  const parts = String(str).split(',').map(s => s.trim());
  if (parts.length !== 2) return null;
  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
};

const buildMapHtml = (latitude, longitude) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #E2E8F0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    function initMap() {
      if (typeof L === 'undefined') return;
      var map = L.map('map', { zoomControl: false, attributionControl: false })
        .setView([${latitude}, ${longitude}], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      L.marker([${latitude}, ${longitude}]).addTo(map);
    }
    if (document.readyState === 'complete') {
      initMap();
    } else {
      window.addEventListener('load', initMap);
    }
  </script>
</body>
</html>`;

const DetailPermintaanGuruPage = ({
  permintaanData,
  guruData,
  tipePermintaan = 'Permintaan',
  onBack,
  onTolak,
  onChat,
  onSelesaikan,
}) => {
  const data = permintaanData || {};
  const { showInfo, showConfirm } = useAppAlert();

  const [loading, setLoading] = useState(false);
  const [sudahLunas, setSudahLunas] = useState(false);
  const [loadingStatusBayar, setLoadingStatusBayar] = useState(true);
  const [showDokModal, setShowDokModal] = useState(false);
  const [fotoUri, setFotoUri] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [displayAddress, setDisplayAddress] = useState('');
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolveLokasiPeta = async () => {
      setLoadingMap(true);
      const alamatMentah =
        data.lokasi_sesi || data.lokasi || data.alamat || '';

      if (data.koordinat?.latitude != null && data.koordinat?.longitude != null) {
        if (!cancelled) {
          setMapCoords({
            latitude: Number(data.koordinat.latitude),
            longitude: Number(data.koordinat.longitude),
          });
          setDisplayAddress(
            alamatMentah ||
              `${data.koordinat.latitude}, ${data.koordinat.longitude}`,
          );
          setLoadingMap(false);
        }
        return;
      }

      const dariString = parseKoordinatDariString(alamatMentah);
      if (dariString) {
        if (!cancelled) {
          setMapCoords(dariString);
          setDisplayAddress(alamatMentah);
          setLoadingMap(false);
        }
        return;
      }

      if (!alamatMentah) {
        if (!cancelled) {
          setMapCoords(null);
          setDisplayAddress('Alamat tidak tersedia');
          setLoadingMap(false);
        }
        return;
      }

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            alamatMentah,
          )}&limit=1`,
          { headers: NOMINATIM_HEADERS },
        );
        const json = await res.json();
        if (!cancelled) {
          if (json?.[0]) {
            setMapCoords({
              latitude: parseFloat(json[0].lat),
              longitude: parseFloat(json[0].lon),
            });
            setDisplayAddress(json[0].display_name || alamatMentah);
          } else {
            setMapCoords(null);
            setDisplayAddress(alamatMentah);
          }
        }
      } catch {
        if (!cancelled) {
          setMapCoords(null);
          setDisplayAddress(alamatMentah);
        }
      } finally {
        if (!cancelled) setLoadingMap(false);
      }
    };

    resolveLokasiPeta();
    return () => {
      cancelled = true;
    };
  }, [data.lokasi_sesi, data.lokasi, data.alamat, data.koordinat]);

  useEffect(() => {
    const cekPembayaran = async () => {
      const id = data.id_pemesanan || data.id;
      if (!id) {
        setLoadingStatusBayar(false);
        return;
      }
      const res = await getStatusPembayaran(id);
      setSudahLunas(res?.status_pembayaran?.toLowerCase() === 'lunas');
      setLoadingStatusBayar(false);
    };
    cekPembayaran();
  }, [data.id_pemesanan, data.id]);

  // ─── Helpers ─────────────────────────────────────────────────
  const namaInisial = data.nama_murid
    ? data.nama_murid.substring(0, 2).toUpperCase()
    : 'SN';

  const formatRupiah = angka => {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
  };

  const handleBukaMap = () => {
    if (mapCoords) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${mapCoords.latitude},${mapCoords.longitude}`,
      ).catch(() => showInfo('Error', 'Tidak dapat membuka Google Maps.'));
      return;
    }

    const lokasi = displayAddress || data.lokasi_sesi || data.lokasi || '';
    if (!lokasi || lokasi === 'Alamat tidak tersedia') {
      showInfo('Info', 'Lokasi tidak tersedia.');
      return;
    }

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lokasi)}`,
    ).catch(() => showInfo('Error', 'Tidak dapat membuka Google Maps.'));
  };

  // ─── Handler: Permintaan ──────────────────────────────────────
  const handleTolak = () => {
    showConfirm(
      'Tolak Permintaan',
      `Yakin ingin menolak permintaan dari ${data.nama_murid}?`,
      () => {
        if (onTolak) onTolak(data.id_pemesanan || data.id);
      },
    );
  };

  const handleTerima = () => {
    showConfirm(
      'Konfirmasi Terima',
      `Apakah Anda yakin ingin menerima permintaan dari ${data.nama_murid}?`,
      async () => {
        setLoading(true);
        try {
          const res = await terimaPermintaanSesiAPI(
            data.id_pemesanan,
            guruData?.id,
            data.biaya_sesi,
            data.biaya_jarak,
            data.harga_total,
          );
          if (res && res.success) {
            showInfo('Sukses', 'Sesi berhasil dikonfirmasi!', { onClose: onBack });
          } else {
            showInfo('Gagal', res.message || 'Terjadi kesalahan sistem.');
          }
        } catch (e) {
          showInfo('Error', 'Terjadi masalah jaringan.');
        } finally {
          setLoading(false);
        }
      },
      { hideIcon: true, swapButtons: true }
    );
  };

  // ─── Handler: Aktif ──────────────────────────────────────────
  const handleAjukanBatal = () => {
    showConfirm(
      'Batalkan sesi?',
      `Sesi dengan ${data.nama_murid || 'murid'} akan dibatalkan.`,
      prosesBatalGuru,
    );
  };

  const prosesBatalGuru = async () => {
    const id = data.id_pemesanan || data.id;
    if (!id) return;
    setLoading(true);
    const res = await batalkanSesi(id, 'guru');
    setLoading(false);

    if (res.success) {
      showInfo('Sesi Dibatalkan', res.data?.message || 'Sesi berhasil dibatalkan.', {
        onClose: () => onBack && onBack(),
      });
    } else {
      showInfo('Gagal', res.message || 'Gagal membatalkan sesi.');
    }
  };

  // ─── Handler: Berlangsung ─────────────────────────────────────
  const handleSelesaikan = () => {
    setShowDokModal(true);
  };

  const handlePilihFoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, includeBase64: true },
      response => {
        if (!response.didCancel && !response.errorCode) {
          const asset = response.assets[0];
          setFotoUri(asset.uri);
          setFotoBase64(asset.base64);
        }
      },
    );
  };

  const handleKonfirmasiSelesai = async () => {
    if (!fotoUri) {
      showInfo('Perhatian', 'Harap pilih foto dokumentasi terlebih dahulu.');
      return;
    }
    setUploadingFoto(true);
    try {
      const id = data.id_pemesanan || data.id;
      const uploadResult = await uploadDokumentasi(id, fotoUri, fotoBase64);
      if (!uploadResult.success) {
        showInfo('Gagal', uploadResult.message || 'Gagal mengupload foto.');
        return;
      }
      const selesaiResult = await selesaikanSesiAPI(id);
      if (!selesaiResult.success) {
        showInfo('Gagal', selesaiResult.message || 'Gagal menyelesaikan sesi.');
        return;
      }
      setShowDokModal(false);
      setFotoUri(null);
      setFotoBase64(null);
      if (onSelesaikan) onSelesaikan(id);
    } catch (err) {
      showInfo('Error', 'Terjadi kesalahan.');
    } finally {
      setUploadingFoto(false);
    }
  };

  // ─── Handler: Chat ────────────────────────────────────────────
  const handleChat = async () => {
    if (!onChat) return;
    const idGuru = guruData?.id;
    const idMurid = data.id_murid;
    if (!idGuru || !idMurid) {
      showInfo('Error', 'Data guru atau murid tidak lengkap.');
      return;
    }
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

  // ─── Kalkulasi data tampilan ──────────────────────────────────
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

  const sekarang = new Date();
  const waktuMulaiObj = data.waktu_mulai ? new Date(data.waktu_mulai) : null;
  const belumMulai =
    waktuMulaiObj && !isNaN(waktuMulaiObj.getTime())
      ? sekarang < waktuMulaiObj
      : true;

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

  // ─── Action bar dinamis ───────────────────────────────────────
  const renderActionBar = () => {
    if (tipePermintaan === 'Permintaan') {
      return (
        <View style={styles.actionBar}>
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

    // Logika tombol mati: jika sedang loading, sedang cek bayar, ATAU belum lunas
    const tombolDisabled = loading || loadingStatusBayar || !sudahLunas;

    return (
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[
            styles.btnSelesaikan,
            tombolDisabled && styles.btnSelesaikanBlocked, // Kalau mati, otomatis pakai style abu-abu punyamu
          ]}
          onPress={handleSelesaikan}
          disabled={tombolDisabled} // Ini yang bikin tombol gak bisa diklik
        >
          <Text
            style={[
              styles.btnSelesaikanText,
              tombolDisabled && styles.btnSelesaikanBlockedText, // Teks otomatis ikutan abu-abu
            ]}
          >
            Selesaikan Pesanan
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Render utama ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <PageHeader title="Detail Pemesanan" onBack={onBack} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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

        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeBox}>
            <Text style={styles.dtLabel}>Tanggal</Text>
            <Text style={styles.dtValue}>{tanggal}</Text>
          </View>
          <View style={[styles.dateTimeBox, { marginLeft: 12 }]}>
            <Text style={styles.dtLabel}>Waktu Sesi</Text>
            <Text style={styles.dtValue}>{waktuSesi}</Text>
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Jenjang</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldValue}>
              {data.jenjang_pendidikan || data.jenjang || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Mata Pelajaran</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldValue}>
              {data.nama_mapel || data.mata_pelajaran || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Materi</Text>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldValue}>
              {data.nama_materi || data.materi || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapsContainerWrapper}>
            {loadingMap ? (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#284B7A" />
                <Text style={styles.mapLoadingText}>Memuat peta lokasi...</Text>
              </View>
            ) : mapCoords ? (
              <WebView
                key={`${mapCoords.latitude}-${mapCoords.longitude}`}
                originWhitelist={['*']}
                source={{
                  html: buildMapHtml(
                    mapCoords.latitude,
                    mapCoords.longitude,
                  ),
                }}
                style={styles.mapsStaticImageMedia}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled
              />
            ) : (
              <View style={styles.mapPreviewFallback}>
                <Text style={styles.mapPinEmoji}>📍</Text>
                <Text style={styles.mapTapText}>
                  Peta tidak dapat dimuat
                </Text>
                <Text style={styles.mapTapSub}>
                  Ketuk baris lokasi di bawah untuk buka Google Maps
                </Text>
              </View>
            )}
          </View>

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
                {data.tipe_lokasi || 'Lokasi Sesi (Ketuk untuk Buka Rute)'}
              </Text>
              <Text style={styles.lokasiAlamat} numberOfLines={3}>
                {displayAddress || 'Alamat tidak tersedia'}
              </Text>
            </View>
            <ChevronRight size={18} color="#ABABAB" />
          </TouchableOpacity>
        </View>

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

      {renderActionBar()}

      <DimmedModal
        visible={showDokModal}
        onRequestClose={() => {
          setShowDokModal(false);
          setFotoUri(null);
        }}
        placement="center"
        dismissOnBackdropPress={!uploadingFoto}
      >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Dokumentasi Sesi</Text>
            <Text style={styles.modalSubtitle}>
              Upload foto sebagai bukti sesi telah selesai
            </Text>

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
      </DimmedModal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  dateTimeRow: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 20 },
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
  mapSection: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EEF6',
    backgroundColor: '#FFF',
  },
  mapsContainerWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapsStaticImageMedia: { width: '100%', height: '100%' },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  mapLoadingText: { marginTop: 10, fontSize: 13, color: '#666' },
  mapPreviewFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  mapPinEmoji: { fontSize: 32, marginBottom: 6 },
  mapTapText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  mapTapSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  lokasiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    borderRadius: 25,
    backgroundColor: '#2A7A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTerimaText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnBatal: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnBatalText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnSelesaikan: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A7A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSelesaikanText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  btnSelesaikanBlocked: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0', // <-- Ubah background jadi abu-abu solid (hapus border)
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSelesaikanBlockedText: {
    color: '#9E9E9E', // Warna teks abu-abu gelap
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalCard: {
    ...centerModalCardBase,
    width: MODAL_CARD_WIDTH,
    borderRadius: 20,
    padding: 24,
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
  fotoPreview: { width: '100%', height: '100%' },
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
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnBatalText: { fontSize: 14, color: '#888', fontWeight: '600' },
  modalBtnSelesai: {
    flex: 1,
    height: 48,
    borderRadius: 25,
    backgroundColor: '#387C65',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSelesaiText: { fontSize: 14, color: '#FFF', fontWeight: 'bold' },
});

export default DetailPermintaanGuruPage;
