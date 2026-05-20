import React, { useState } from 'react';

import { 
  StyleSheet, Text, View, TouchableOpacity, StatusBar, 
  ScrollView, TextInput, Alert, ActivityIndicator, 
  useWindowDimensions, KeyboardAvoidingView, Platform 
} from 'react-native'; 

// Import SafeAreaView yang dari library khusus tetap biarkan di bawahnya:
import { SafeAreaView } from 'react-native-safe-area-context';
import { postFeedback } from '../services/feedbackService'; 

const SessionDetailPage = ({ onBack, sessionData, userId }) => {
  // Mengambil lebar (width) dan tinggi (height) layar HP secara real-time
  const { width, height } = useWindowDimensions();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Perhatian", "Silakan pilih bintang terlebih dahulu.");
      return;
    }

    if (!feedback.trim()) {
      Alert.alert("Perhatian", "Komentar tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_sesi: sessionData?.id_pemesanan || sessionData?.id_sesi,
        komentar: feedback,
        rating: rating
      };

      const result = await postFeedback(payload);
      if (result.success) {
        setTimeout(() => {
            Alert.alert("Berhasil", "Terima kasih atas ulasan Anda!");
        }, 100);
        setIsSubmitted(true);
      } else {
        Alert.alert("Gagal", "Gagal menyimpan feedback.");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalkulasi ukuran komponen secara dinamis berbasis lebar layar perangkat
  const dynamicFontSizeTitle = width * 0.04;      // ~16px di layar standar
  const dynamicFontSizeSubtitle = width * 0.032;   // ~12.5px di layar standar
  const dynamicStarSize = width * 0.09;            // Ukuran bintang proporsional (~36px)
  const dynamicImageHeight = height * 0.25;        // Tinggi placeholder dokumentasi (25% dari tinggi HP)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Agar inputan teks tidak tertutup oleh keyboard otomatis */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>{'❮'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: width * 0.05, paddingBottom: 30 }}>
          
          {/* Info Top */}
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { width: width * 0.15, height: width * 0.15 }]}>
              <Text style={{ fontSize: width * 0.06 }}>📖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontSize: dynamicFontSizeTitle }]} numberOfLines={2}>
                <Text style={{ fontWeight: 'bold' }}>
                  {sessionData?.mata_pelajaran?.nama_mapel || sessionData?.nama_mapel || "Pelajaran"}
                </Text> - {sessionData?.materi?.nama_materi || sessionData?.nama_materi || "Materi"}
              </Text>
              <Text style={[styles.subtitle, { fontSize: dynamicFontSizeSubtitle }]}>
                {sessionData?.waktu_mulai ? new Date(sessionData.waktu_mulai).toLocaleString('id-ID', {
                    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                }) : "Waktu tidak tersedia"}
              </Text>
              <Text style={[styles.subtitle, { fontSize: dynamicFontSizeSubtitle }]}>No. Sesi: {sessionData?.id_pemesanan || "-"}</Text>
            </View>
          </View>

          {/* Dokumentasi */}
          <Text style={[styles.sectionTitle, { fontSize: dynamicFontSizeTitle }]}>Dokumentasi</Text>
          <View style={[styles.imagePlaceholder, { height: dynamicImageHeight }]}>
            <Text style={{ fontSize: width * 0.15, color: '#CCC' }}>🖼️</Text>
          </View>

          {/* Biaya */}
          <View style={styles.costRow}>
            <Text style={[styles.costLabel, { fontSize: width * 0.045 }]}>Biaya:</Text>
            <Text style={[styles.costValue, { fontSize: width * 0.045 }]}>Rp30.000</Text>
          </View>

          <View style={styles.divider} />

          {/* Guru */}
          <Text style={[styles.guruText, { fontSize: dynamicFontSizeTitle }]}>👤 {sessionData?.guru?.nama_guru || sessionData?.nama_guru || "Guru"}</Text>

          {/* Feedback Section */}
          <TextInput 
            style={[styles.feedbackInput, { height: height * 0.1 }]} 
            placeholder="Masukkan Feedback..." 
            placeholderTextColor="#A9A9A9"
            multiline
            value={feedback}
            onChangeText={setFeedback}
            editable={!isSubmitted && !isSubmitting}
          />

          <Text style={[styles.ratingText, { fontSize: dynamicFontSizeTitle }]}>Berikan Rating Anda</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                  key={star} 
                  onPress={() => !isSubmitted && !isSubmitting && setRating(star)} 
                  activeOpacity={isSubmitted ? 1 : 0.7}
                  style={{ paddingHorizontal: 4 }}
              >
                <Text style={{ fontSize: dynamicStarSize, color: star <= rating ? '#FFC107' : '#E0E0E0' }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tombol Kirim */}
          <TouchableOpacity 
            style={[styles.submitBtn, (isSubmitted || isSubmitting) && styles.submitBtnDisabled]} 
            onPress={handleSubmit} 
            disabled={isSubmitted || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.submitBtnText, isSubmitted && styles.submitBtnTextDisabled, { fontSize: width * 0.04 }]}>
                {isSubmitted ? "Ulasan Terkirim" : "Kirim Feedback"}
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    
    // --- UBAH BAGIAN INI ---
    paddingTop: 0,         // Pres ke angka 0 agar mepet ke atas
    marginTop: -15,        // BERIKAN MINUS (-) agar komponen dipaksa naik mendekati kamera
    paddingBottom: 10      // Jarak bawah ke konten tetap aman
    // -----------------------
  },
  backBtn: { 
    padding: 10, 
    marginLeft: -10 
  },
  backIcon: { 
    fontSize: 20, 
    color: '#000', 
    fontWeight: 'bold' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  // ... sisa style di bawahnya tetap sama
  iconBox: { backgroundColor: '#387C65', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { color: '#333', marginBottom: 4 },
  subtitle: { color: '#888', marginBottom: 2 },
  sectionTitle: { fontWeight: 'bold', color: '#333', marginBottom: 10 },
  imagePlaceholder: { width: '100%', backgroundColor: '#F0F0F0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  costLabel: { fontWeight: 'bold', color: '#333' },
  costValue: { fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 15 },
  guruText: { color: '#333', marginBottom: 15 },
  feedbackInput: { borderWidth: 1, borderColor: '#EEE', borderRadius: 10, padding: 12, textAlignVertical: 'top', color: '#333', marginBottom: 20, fontSize: 14 },
  ratingText: { textAlign: 'center', fontWeight: '600', color: '#333', marginBottom: 10 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  submitBtn: { backgroundColor: '#387C65', borderRadius: 25, height: 48, justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' },
  submitBtnTextDisabled: { color: '#CCC' }
});

export default SessionDetailPage;