import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';

// Import SafeAreaView yang dari library khusus tetap biarkan di bawahnya:
import { SafeAreaView } from 'react-native-safe-area-context';
import { postFeedback, fetchFeedbackBySesi } from '../services/feedbackService';
import BackIconSvg from '../components/BackIconSvg';
import { getDokumentasi } from '../services/dokumentasiService';
import { API_URL } from '../src/config';

const resolveFotoUri = fotoPath => {
  if (!fotoPath) return null;
  if (fotoPath.startsWith('http')) return fotoPath;
  return `${API_URL.replace('/api', '')}${fotoPath}`;
};

const SessionDetailPage = ({ onBack, sessionData, userId, userRole = 'murid' }) => {
  const { width, height } = useWindowDimensions();
  const isGuru = userRole === 'guru';

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(true);
  const [fotoDokumentasi, setFotoDokumentasi] = useState(
    sessionData?.foto_dokumentasi || null,
  );
  const [fotoFullscreen, setFotoFullscreen] = useState(false);

  useEffect(() => {
    const fetchFoto = async () => {
      try {
        const id = sessionData?.id_pemesanan;
        if (!id) return;
        const resDok = await getDokumentasi(id);
        if (resDok?.foto_dokumentasi) {
          setFotoDokumentasi(resDok.foto_dokumentasi);
        }
      } catch (err) {
        console.log('Gagal fetch foto dokumentasi:', err);
      }
    };
    fetchFoto();
  }, [sessionData?.id_pemesanan]);

  // Muat feedback yang sudah tersimpan agar saat dibuka lagi tampil & terkunci.
  useEffect(() => {
    const idPemesanan = sessionData?.id_pemesanan;
    if (!idPemesanan) {
      setCheckingFeedback(false);
      return;
    }

    let aktif = true;
    const muatFeedback = async () => {
      const res = await fetchFeedbackBySesi(idPemesanan);
      if (!aktif) return;

      if (res.success && res.data) {
        setFeedback(res.data.komentar || '');
        setRating(Number(res.data.rating) || 0);
        setIsSubmitted(true);
      }
      setCheckingFeedback(false);
    };

    muatFeedback();
    return () => {
      aktif = false;
    };
  }, [sessionData?.id_pemesanan]);

  // --- FUNGSI FORMAT WAKTU (MENYESUAIKAN LOG BACKEND) ---
  // --- FUNGSI FORMAT WAKTU (SUDAH DI-UPGRADE AGAR AMAN DARI FORMAT ISO) ---
  const formatSessionTime = () => {
    const rawTanggal = sessionData?.tanggal || sessionData?.waktu_mulai;
    const waktuString = sessionData?.waktu_string || 'Waktu tidak tersedia';

    if (rawTanggal) {
      try {
        // Ambil 10 karakter pertama saja (YYYY-MM-DD), mengabaikan huruf T dan Z di belakangnya
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

          // tglParts[0] = Tahun, tglParts[1] = Bulan, tglParts[2] = Tanggal
          const namaBulan =
            daftarBulan[parseInt(tglParts[1], 10) - 1] || tglParts[1];
          const tanggalAngka = parseInt(tglParts[2], 10); // Menghilangkan angka 0 di depan (misal: 01 jadi 1)

          const tanggalFormatted = `${tanggalAngka} ${namaBulan} ${tglParts[0]}`;

          return `${tanggalFormatted}, ${waktuString}`;
        }
      } catch (error) {
        // Jika gagal parsing, biarkan fallback ke waktuString di bawah
      }
    }

    // Fallback jika data tanggal tidak valid atau kosong
    return waktuString;
  };
  // -------------------------------------------------------------

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Perhatian', 'Silakan pilih bintang terlebih dahulu.');
      return;
    }

    if (!feedback.trim()) {
      Alert.alert('Perhatian', 'Komentar tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_pemesanan: sessionData?.id_pemesanan,
        komentar: feedback,
        rating: rating,
      };

      const result = await postFeedback(payload);
      if (result.success) {
        setTimeout(() => {
          Alert.alert('Berhasil', 'Terima kasih atas ulasan Anda!');
        }, 100);
        setIsSubmitted(true);
      } else if (
        result.message &&
        result.message.toLowerCase().includes('sudah')
      ) {
        // Sudah pernah dikirim (mis. dari perangkat/sesi lain) -> kunci form.
        setIsSubmitted(true);
        Alert.alert('Info', result.message);
      } else {
        Alert.alert('Gagal', result.message || 'Gagal menyimpan feedback.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalkulasi ukuran komponen secara dinamis berbasis lebar layar perangkat
  const dynamicFontSizeTitle = width * 0.04;
  const dynamicFontSizeSubtitle = width * 0.032;
  const dynamicStarSize = width * 0.09;
  const dynamicImageHeight = height * 0.25;

  // PEMETAAN VARIABEL AKURAT 100% SESUAI DATA DEBUG KAMU:
  const namaMapel =
    sessionData?.mata_pelajaran?.nama_mapel ||
    sessionData?.nama_mapel ||
    'Pelajaran';
  const namaMateri =
    sessionData?.nama_materi || sessionData?.materi?.nama_materi || 'Materi';
  const namaTampil = isGuru
    ? sessionData?.murid?.nama_murid || sessionData?.nama_murid || 'Murid'
    : sessionData?.guru?.nama_guru || sessionData?.nama_guru || 'Guru';
  const idPemesanan = sessionData?.id_pemesanan || '-';
  const totalBiaya =
    sessionData?.nominal ??
    sessionData?.pembayaran?.nominal ??
    sessionData?.harga_total ??
    sessionData?.harga ??
    (sessionData?.biaya_sesi != null && sessionData?.biaya_jarak != null
      ? Number(sessionData.biaya_sesi) + Number(sessionData.biaya_jarak)
      : sessionData?.biaya_sesi);
  const fotoUri = resolveFotoUri(fotoDokumentasi);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <BackIconSvg size={10} color="#000000" />
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: width * 0.05,
            paddingBottom: 30,
          }}
        >
          {/* Info Top */}
          <View style={styles.infoRow}>
            <View
              style={[
                styles.iconBox,
                { width: width * 0.15, height: width * 0.15 },
              ]}
            >
              <Image
                source={require('../assets/buku.png')}
                style={styles.iconBuku}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.title, { fontSize: dynamicFontSizeTitle }]}
                numberOfLines={2}
              >
                <Text style={{ fontWeight: 'bold' }}>{namaMapel}</Text> -{' '}
                {namaMateri}
              </Text>

              {/* BAGIAN TANGGAL DAN WAKTU */}
              <Text
                style={[styles.subtitle, { fontSize: dynamicFontSizeSubtitle }]}
              >
                {formatSessionTime()}
              </Text>

              <Text
                style={[styles.subtitle, { fontSize: dynamicFontSizeSubtitle }]}
              >
                No. Sesi: {idPemesanan}
              </Text>
            </View>
          </View>
          {/* Dokumentasi */}
          <Text
            style={[styles.sectionTitle, { fontSize: dynamicFontSizeTitle }]}
          >
            Dokumentasi
          </Text>
          <TouchableOpacity
            style={[styles.imagePlaceholder, { height: dynamicImageHeight }]}
            onPress={() => fotoUri && setFotoFullscreen(true)}
            activeOpacity={fotoUri ? 0.85 : 1}
            disabled={!fotoUri}
          >
            {fotoUri ? (
              <>
                <Image
                  source={{ uri: fotoUri }}
                  style={{ width: '100%', height: '100%', borderRadius: 10 }}
                  resizeMode="cover"
                />
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>Ketuk untuk memperbesar</Text>
                </View>
              </>
            ) : (
              <Text style={{ fontSize: width * 0.15, color: '#CCC' }}>🖼️</Text>
            )}
          </TouchableOpacity>

          {/* Biaya */}
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { fontSize: width * 0.045 }]}>
              Biaya:
            </Text>
            <Text style={[styles.costValue, { fontSize: width * 0.045 }]}>
              {totalBiaya ? `Rp${totalBiaya.toLocaleString('id-ID')}` : 'Rp0'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Nama lawan bicara: guru → murid, murid → guru */}
          <Text style={[styles.personText, { fontSize: dynamicFontSizeTitle }]}>
            👤 {namaTampil}
          </Text>

          {isGuru ? (
            <>
              {checkingFeedback ? (
                <ActivityIndicator
                  color="#387C65"
                  style={{ marginVertical: 24 }}
                />
              ) : (
                <>
                  <View
                    style={[styles.feedbackReadonly, { minHeight: height * 0.08 }]}
                  >
                    <Text style={styles.feedbackReadonlyText}>
                      {feedback || 'Murid belum memberikan ulasan.'}
                    </Text>
                  </View>

                  <Text
                    style={[styles.ratingText, { fontSize: dynamicFontSizeTitle }]}
                  >
                    Rating dari Murid
                  </Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Text
                        key={star}
                        style={{
                          fontSize: dynamicStarSize,
                          color: star <= rating ? '#FFC107' : '#E0E0E0',
                          paddingHorizontal: 4,
                        }}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={[styles.feedbackInput, { height: height * 0.1 }]}
                placeholder="Masukkan Feedback..."
                placeholderTextColor="#A9A9A9"
                multiline
                value={feedback}
                onChangeText={setFeedback}
                editable={!isSubmitted && !isSubmitting && !checkingFeedback}
              />

              <Text
                style={[styles.ratingText, { fontSize: dynamicFontSizeTitle }]}
              >
                Berikan Rating Anda
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() =>
                      !isSubmitted &&
                      !isSubmitting &&
                      !checkingFeedback &&
                      setRating(star)
                    }
                    activeOpacity={isSubmitted ? 1 : 0.7}
                    style={{ paddingHorizontal: 4 }}
                  >
                    <Text
                      style={{
                        fontSize: dynamicStarSize,
                        color: star <= rating ? '#FFC107' : '#E0E0E0',
                      }}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (isSubmitted || isSubmitting || checkingFeedback) &&
                    styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitted || isSubmitting || checkingFeedback}
              >
                {isSubmitting || checkingFeedback ? (
                  <ActivityIndicator
                    color={checkingFeedback ? '#387C65' : '#FFF'}
                  />
                ) : (
                  <Text
                    style={[
                      styles.submitBtnText,
                      isSubmitted && styles.submitBtnTextDisabled,
                      { fontSize: width * 0.04 },
                    ]}
                  >
                    {isSubmitted ? 'Ulasan Terkirim' : 'Kirim Feedback'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fullscreen foto dokumentasi */}
      <Modal
        visible={fotoFullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoFullscreen(false)}
      >
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setFotoFullscreen(false)}
          >
            <Text style={styles.fullscreenCloseText}>✕ Tutup</Text>
          </TouchableOpacity>
          {fotoUri && (
            <Image
              source={{ uri: fotoUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    marginTop: -15,
    paddingBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  backText: {
    fontSize: 15,
    color: '#000000',
    marginLeft: 6,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: {
    backgroundColor: '#387C65',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconBuku: { width: 40, height: 40 },
  title: { color: '#333', marginBottom: 4 },
  subtitle: { color: '#888', marginBottom: 2 },
  sectionTitle: { fontWeight: 'bold', color: '#333', marginBottom: 10 },
  imagePlaceholder: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  costLabel: { fontWeight: 'bold', color: '#333' },
  costValue: { fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 15 },
  personText: { color: '#333', marginBottom: 15 },
  tapHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tapHintText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  feedbackReadonly: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  feedbackReadonlyText: { fontSize: 14, color: '#333', lineHeight: 20 },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullscreenCloseText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  fullscreenImage: { width: '100%', height: '85%' },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    color: '#333',
    marginBottom: 20,
    fontSize: 14,
  },
  ratingText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  submitBtn: {
    backgroundColor: '#387C65',
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' },
  submitBtnTextDisabled: { color: '#CCC' },
});

export default SessionDetailPage;
