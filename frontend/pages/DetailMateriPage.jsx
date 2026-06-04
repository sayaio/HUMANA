import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  StatusBar, ScrollView
} from 'react-native';
import BackIconSvg from '../components/BackIconSvg';
const DetailMateriPage = ({ chapterData, onBack }) => {

  // Mengambil nama materi dan deskripsi asli dari Database
  const title = chapterData?.namaMateri || 'Detail Materi';
  const description = chapterData?.deskripsiMateri || 'Belum ada deskripsi untuk materi ini.';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <BackIconSvg size={10} color="#ffffff" />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 50 }}>
          <Text style={styles.sectionTitle}>Deskripsi Materi</Text>

          {/* Menampilkan deskripsi asli dari API Database */}
          <Text style={styles.paragraph}>
            {description}
          </Text>

        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#284B7A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 45, paddingBottom: 30, paddingHorizontal: 20 },
    backBtn: {
    flexDirection: 'row',    // Membuat ikon dan teks berjejer ke samping
    alignItems: 'center',    // Membuat ikon dan teks lurus sejajar secara vertikal
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  backText: {
    fontSize: 15,            // Ukuran teks 'Kembali'
    color: '#ffffff',        // Warna teks hitam disamakan dengan ikon
    marginLeft: 6,           // Memberikan jarak antara ikon panah dan teks
    fontFamily: 'SF-Pro-Display-Bold',       // Membuat teks sedikit lebih tegas (opsional)
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', flex: 1, textAlign: 'center', marginHorizontal: 10 },

  contentContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 24, marginBottom: 15, textAlign: 'justify' }
});

export default DetailMateriPage;