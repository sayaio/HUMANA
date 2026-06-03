import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator, // Tambahan untuk loading indicator yang rapi
} from 'react-native';
import {
  Star,
  X,
  Clock,
  DollarSign,
} from 'lucide-react-native';

// IMPORT SERVICE YANG SUDAH DIBUAT
import {
  fetchPermintaanBaru,
  terimaPermintaanSesiAPI,
  fetchSesiDikonfirmasi,
} from '../services/matchingService'; // Sesuaikan path jika berbeda
import { getHistory } from '../services/historyService'; // Tambahkan ini
import BottomNavbar from '../components/BottomNavbar';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const ActivityGuruPage = ({ guruData, onNavigate }) => {
  const idGuru = guruData?.id; // Fallback jika guruData belum ter-inject sempurna

  const [activeTab, setActiveTab] = useState('Permintaan');
  const [selectedSesi, setSelectedSesi] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // State untuk menampung data riil dari database
  const [permintaanData, setPermintaanData] = useState([]);
  const [jadwalAktifData, setJadwalAktifData] = useState([]);
  // Ubah bagian ini di dalam komponen
  const [riwayatData, setRiwayatData] = useState([]); // Awalnya kosong

  // State pendukung untuk loading dan koordinat GPS
  const [loading, setLoading] = useState(true);
  const [koordinat, setKoordinat] = useState({
    lat: -6.973416,
    lng: 107.630406,
  }); // Default koordinat (Surabaya) jika GPS mati

  // 1. Ambil lokasi terkini Guru sewaktu halaman dibuka
  useEffect(() => {
    // Menggunakan navigator.geolocation bawaan React Native/Web Sandbox
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setKoordinat({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error =>
          console.log(
            'Gagal mendapatkan GPS, menggunakan default koordinat.',
            error,
          ),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    }
  }, []);

  // 2. Fungsi Utama untuk menarik data dari API Backend
  const muatUlangDataAktivitas = async () => {
    setLoading(true);
    try {
      // Mengambil Permintaan Baru (GET) & Sesi Dikonfirmasi (GET) secara paralel
      const [resPermintaan, resKonfirmasi, resRiwayat] = await Promise.all([
        fetchPermintaanBaru(idGuru, koordinat.lat, koordinat.lng),
        fetchSesiDikonfirmasi(idGuru),
        getHistory('guru', idGuru), // Panggil service history
      ]);

      // Map data dari backend agar strukturnya sesuai dengan UI card yang kamu buat
      if (resPermintaan.success && resPermintaan.data) {
        const mappedPermintaan = resPermintaan.data.map(item => ({
          id: item.id_pemesanan, // Mapping id_pemesanan ke id
          nama_murid: item.nama_murid,
          materi: item.nama_materi,
          waktu:
            item.waktu_string ||
            `${new Date(item.waktu_mulai).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })} - Selesai`,
          harga: item.harga_total, // Tarif flat contoh dari Figma kamu
          tipe: 'Permintaan',
        }));
        setPermintaanData(mappedPermintaan);
      }

      // SESUDAHNYA (BENAR)
      if (resKonfirmasi.success && resKonfirmasi.data) {
        // Karena backend mengembalikan Array, kita proses pakai .map()
        const mappedAktif = resKonfirmasi.data.map(item => ({
          id: item.id_pemesanan,
          nama_murid: item.nama_murid,
          materi: item.nama_materi,
          waktu: item.waktu_string || 'Jam Terjadwal',
          harga: item.harga_total || 34000,
          tipe: 'Aktif',
        }));
        setJadwalAktifData(mappedAktif);
      } else {
        setJadwalAktifData([]);
      }

      if (resRiwayat.success && resRiwayat.data) {
        const mappedRiwayat = resRiwayat.data.map(item => ({
          id: item.id_pemesanan,
          nama_murid: item.murid.nama_murid,
          materi: item.mata_pelajaran.nama_mapel + ' — ' + item.nama_materi,
          // Di dalam map riwayatData
          waktu: item.waktu_mulai
            ? new Date(item.waktu_mulai).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Tanggal tidak tersedia',
          harga: item.pembayaran?.total_bayar || 0, // Sesuaikan dengan struktur data backend Anda
          tipe: 'Riwayat',
          status_pemesanan: item.status_pemesanan,
          rating: item.feedback?.rating || 0, // Jika ada data feedback
          ulasan: item.feedback?.komentar || 'Tidak ada ulasan.',
        }));
        setRiwayatData(mappedRiwayat);
      } else {
        setRiwayatData([]);
      }
    } catch (err) {
      console.error('Gagal menarik data aktivitas guru:', err);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetch data setiap kali idGuru atau koordinat GPS berubah
  useEffect(() => {
    muatUlangDataAktivitas();
  }, [idGuru, koordinat]);

  const openDetailModal = sesi => {
    setSelectedSesi(sesi);
    setModalVisible(true);
  };

  // 3. INTEGRASI TOMBOL TERIMA DENGAN API POST
  const handleTerimaPermintaan = async id => {
    try {
      const totalPembayaranFinal = selectedSesi?.harga;
      const result = await terimaPermintaanSesiAPI(
        id,
        idGuru,
        totalPembayaranFinal,
      );

      if (result.success) {
        Alert.alert('Sukses', 'Anda telah menerima permintaan mengajar ini!');
        setModalVisible(false);
        muatUlangDataAktivitas(); // Auto-refresh data biar UI langsung sinkron dengan DB
      } else {
        Alert.alert('Gagal', result.message || 'Gagal menerima permintaan.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi masalah jaringan saat menyetujui sesi.');
    }
  };

  const handleTolakPermintaan = id => {
    Alert.alert('Ditolak', 'Permintaan mengajar berhasil diabaikan.');
    setPermintaanData(prev => prev.filter(item => item.id !== id));
    setModalVisible(false);
  };

  const renderCardItem = item => {
    return (
      <View key={item.id} style={styles.sesiCard}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {item.nama_murid.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardMainMeta}>
            <Text style={styles.studentName}>{item.nama_murid}</Text>
            <Text style={styles.materiText} numberOfLines={1}>
              {item.materi}
            </Text>
          </View>
        </View>

        <View style={styles.cardGridInfo}>
          <View style={styles.gridInfoBox}>
            <Text style={styles.infoLabel}>Waktu</Text>
            <Text style={styles.infoValue}>{item.waktu}</Text>
          </View>
          <View style={styles.gridInfoBox}>
            <Text style={styles.infoLabel}>Bayaran</Text>
            <Text style={styles.infoValue}>
              Rp {item.harga.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        <View style={styles.cardActionRow}>
          {item.tipe === 'Riwayat' && (
              <View style={[
                  styles.ratingBadgeRow,
                  item.status_pemesanan === 'selesai' ? styles.ratingBadgeSelesai : styles.ratingBadgeDibatalkan
              ]}>
                  <Text style={[
                      styles.ratingTextOnly,
                      item.status_pemesanan === 'selesai' ? styles.ratingTextSelesai : styles.ratingTextDibatalkan
                  ]}>
                      {item.status_pemesanan === 'selesai' ? 'Selesai' : 'Dibatalkan'}
                  </Text>
              </View>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.btnLihatDetailKecil}
            onPress={() => openDetailModal(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnTextLihatDetail}>Lihat Detail</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header Title */}
      <View style={styles.topHeaderTitleArea}>
        <Text style={styles.pageMainTitle}>Aktivitas</Text>
      </View>

      {/* Tab Slider 3 Kategori */}
      <View style={styles.tabSliderContainer}>
        {['Permintaan', 'Jadwal Aktif', 'Riwayat Sesi'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButtonElement,
              activeTab === tab && styles.tabButtonElementActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List Body Konten dengan loading status */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#284B7A" />
          <Text style={{ marginTop: 10, color: '#666' }}>
            Sinkronisasi data...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScrollBody}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
            {activeTab === 'Permintaan' &&
              (permintaanData.length > 0 ? (
                permintaanData.map(renderCardItem)
              ) : (
                <Text style={styles.emptyTextState}>
                  Belum ada permintaan masuk.
                </Text>
              ))}

            {activeTab === 'Jadwal Aktif' &&
              (jadwalAktifData.length > 0 ? (
                jadwalAktifData.map(renderCardItem)
              ) : (
                <Text style={styles.emptyTextState}>
                  Tidak ada jadwal kelas aktif terdekat.
                </Text>
              ))}

            {activeTab === 'Riwayat Sesi' &&
              (riwayatData.length > 0 ? (
                riwayatData.map(renderCardItem)
              ) : (
                <Text style={styles.emptyTextState}>
                  Belum ada riwayat sesi yang diselesaikan.
                </Text>
              ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* POP-UP MODAL DI TENGAH LAYAR */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlayBackground}>
          <View style={styles.modalContentSheet}>
            <View style={styles.modalHeaderTitleRow}>
              <Text style={styles.modalTitleLabel}>Detail Sesi Kelas</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ padding: 4 }}
              >
                <X size={22} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedSesi && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalIdentityBox}>
                  <View style={styles.modalAvatarBig}>
                    <Text style={styles.modalAvatarBigText}>
                      {selectedSesi.nama_murid.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.modalStudentName}>
                    {selectedSesi.nama_murid}
                  </Text>
                  <Text style={styles.modalMateriName}>
                    {selectedSesi.materi}
                  </Text>
                </View>

                <View style={styles.modalSpecWrapper}>
                  <View style={styles.specItemRow}>
                    <Clock
                      size={18}
                      color="#284B7A"
                      style={{ marginRight: 10 }}
                    />
                    <View>
                      <Text style={styles.specLabel}>Waktu Kelas</Text>
                      <Text style={styles.specValue}>{selectedSesi.waktu}</Text>
                    </View>
                  </View>
                  <View style={styles.specItemRow}>
                    <DollarSign
                      size={18}
                      color="#284B7A"
                      style={{ marginRight: 10 }}
                    />
                    <View>
                      <Text style={styles.specLabel}>Total Bayaran</Text>
                      <Text style={styles.specValue}>
                        Rp {selectedSesi.harga.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedSesi.tipe === 'Riwayat' && (
                  <View style={styles.reviewSectionCard}>
                    <Text style={styles.reviewCardTitle}>
                      Ulasan & Rating Siswa
                    </Text>
                    <View style={styles.modalStarsRow}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          color="#FFB800"
                          fill={
                            i < selectedSesi.rating ? '#FFB800' : 'transparent'
                          }
                          style={{ marginRight: 4 }}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewCommentBody}>
                      "{selectedSesi.ulasan}"
                    </Text>
                  </View>
                )}

                {selectedSesi.tipe === 'Permintaan' && (
                  <View style={styles.modalActionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.modalBtnBase, styles.modalBtnReject]}
                      onPress={() => handleTolakPermintaan(selectedSesi.id)}
                    >
                      <Text style={styles.modalBtnTextReject}>Tolak</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtnBase, styles.modalBtnAccept]}
                      onPress={() => handleTerimaPermintaan(selectedSesi.id)}
                    >
                      <Text style={styles.modalBtnTextAccept}>Terima</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedSesi.tipe === 'Aktif' && (
                  <TouchableOpacity
                    style={styles.modalBtnSingleRoute}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalBtnSingleRouteText}>
                      Tutup Detail Sesi
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Tab Bar */}
      <BottomNavbar
        currentScreen="ActivityGuru"
        onNavigate={onNavigate}
        userRole="guru"
      />
    </View>
  );
};

// ... Gaya (Styles) tetap utuh di bawah sesuai file asli Anda
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topHeaderTitleArea: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  pageMainTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },

  tabSliderContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#F0F2F5',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButtonElement: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonElementActive: {
    backgroundColor: '#FFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#284B7A',
    fontWeight: 'bold',
  },

  listScrollBody: { flex: 1 },
  emptyTextState: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 13,
  },

  sesiCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  cardMainMeta: { flex: 1, marginLeft: 14 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  materiText: { fontSize: 12, color: '#777', marginTop: 2 },

  cardGridInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    paddingLeft: 2,
  },
  gridInfoBox: { width: '45%' },
  infoLabel: { fontSize: 11, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#333' },

  cardActionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  btnLihatDetailKecil: {
    backgroundColor: '#284B7A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnTextLihatDetail: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingTextBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFB800',
    marginLeft: 4,
  },

  modalOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentSheet: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    width: '85%',
    maxHeight: '75%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  modalIdentityBox: { alignItems: 'center', marginBottom: 20 },
  modalAvatarBig: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#284B7A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAvatarBigText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalStudentName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  modalMateriName: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  modalSpecWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  specItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  specLabel: { fontSize: 11, color: '#999' },
  specValue: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 2 },
  reviewSectionCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE6A3',
  },
  reviewCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D4A017',
    marginBottom: 6,
  },
  modalStarsRow: { flexDirection: 'row', marginBottom: 6 },
  reviewCommentBody: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  modalActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtnBase: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalBtnReject: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF8A8A',
  },
  modalBtnAccept: { backgroundColor: '#284B7A' },
  modalBtnTextReject: { color: '#FF8A8A', fontWeight: 'bold' },
  modalBtnTextAccept: { color: '#FFF', fontWeight: 'bold' },
  modalBtnSingleRoute: {
    backgroundColor: '#284B7A',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSingleRouteText: { color: '#FFF', fontWeight: 'bold' },
  ratingBadgeSelesai: {
      backgroundColor: '#E8F5E9',
      borderWidth: 1,
      borderColor: '#4CAF50',
  },
  ratingBadgeDibatalkan: {
      backgroundColor: '#FFEBEE',
      borderWidth: 1,
      borderColor: '#F44336',
  },
  ratingTextSelesai: {
      color: '#4CAF50',
      fontWeight: 'bold',
  },
  ratingTextDibatalkan: {
      color: '#F44336',
      fontWeight: 'bold',
  },
  ratingTextOnly: {
      fontSize: 12,
      fontWeight: 'bold',
  },
});

export default ActivityGuruPage;
