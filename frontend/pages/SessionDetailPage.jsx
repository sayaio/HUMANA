import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { postFeedback } from '../services/feedbackService'; // Pastikan service ini sudah Anda buat

const SessionDetailPage = ({ onBack, sessionData, userId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fungsi untuk mengirim data ke database
  const handleSubmit = async () => {
    // Validasi agar data kosong tidak masuk
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
        // Gunakan timeout kecil agar Alert muncul setelah state loading selesai
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>
                <Text style={styles.headerTitle}>Session Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* Info Top - Menggunakan data dinamis dari sessionData */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}><Text style={{color: '#FFF', fontSize: 24}}>📖</Text></View>
          <View>
            <Text style={styles.title}>
                <Text style={{fontWeight: 'bold'}}>
                    {sessionData?.mata_pelajaran?.nama_mapel || sessionData?.nama_mapel || "Pelajaran"}
                </Text> - {sessionData?.materi?.nama_materi || sessionData?.nama_materi || "Materi"}
            </Text>
            {/* UBAH BAGIAN INI: Agar waktu sesuai data asli, bukan 31 Februari lagi */}
            <Text style={styles.subtitle}>
                {sessionData?.waktu_mulai ? new Date(sessionData.waktu_mulai).toLocaleString('id-ID', {
                    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                }) : "Waktu tidak tersedia"}
            </Text>
            <Text style={styles.subtitle}>No. Sesi: {sessionData?.id_pemesanan || "-"}</Text>
          </View>
        </View>

        {/* Dokumentasi */}
        <Text style={styles.sectionTitle}>Dokumentasi</Text>
        <View style={styles.imagePlaceholder}>
          <Text style={{fontSize: 60, color: '#CCC'}}>🖼️</Text>
        </View>

        {/* Biaya */}
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Biaya:</Text>
          <Text style={styles.costValue}>Rp30.000</Text>
        </View>

        <View style={styles.divider} />

        {/* Guru */}
        <Text style={styles.guruText}>👤 {sessionData?.guru?.nama_guru || sessionData?.nama_guru || "Guru"}</Text>

        {/* Feedback Section */}
        <TextInput 
          style={styles.feedbackInput} 
          placeholder="Masukkan Feedback..." 
          placeholderTextColor="#A9A9A9"
          multiline
          value={feedback}
          onChangeText={setFeedback}
          editable={!isSubmitted && !isSubmitting}
        />

        <Text style={styles.ratingText}>Berikan Rating Anda</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
                key={star} 
                onPress={() => !isSubmitted && !isSubmitting && setRating(star)} 
                activeOpacity={isSubmitted ? 1 : 0.7}
            >
              <Text style={{fontSize: 35, color: star <= rating ? '#FFC107' : '#E0E0E0', marginHorizontal: 5}}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, (isSubmitted || isSubmitting) && styles.submitBtnDisabled]} 
          onPress={handleSubmit} // Pastikan ini handleSubmit
          disabled={isSubmitted || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.submitBtnText, isSubmitted && styles.submitBtnTextDisabled]}>
              {isSubmitted ? "Ulasan Terkirim" : "Kirim Feedback"}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// Styles tetap sama persis dengan kode awal Anda
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { padding: 10, marginLeft: -10 },
  backIcon: { fontSize: 20, color: '#000', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  iconBox: { width: 60, height: 60, backgroundColor: '#387C65', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 14, color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 11, color: '#888', marginBottom: 3 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#F0F0F0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  costLabel: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  costValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 20 },
  guruText: { fontSize: 14, color: '#333', marginBottom: 20 },
  feedbackInput: { borderWidth: 1, borderColor: '#EEE', borderRadius: 10, height: 80, padding: 15, textAlignVertical: 'top', color: '#333', marginBottom: 20 },
  ratingText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  submitBtn: { backgroundColor: '#387C65', borderRadius: 25, height: 50, justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  submitBtnTextDisabled: { color: '#CCC' }
});

export default SessionDetailPage;