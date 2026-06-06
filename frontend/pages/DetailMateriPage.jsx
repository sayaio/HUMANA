import React from 'react';
import {
  StyleSheet, Text, View,
  StatusBar, ScrollView, TouchableOpacity
} from 'react-native';
import PageHeader from '../components/PageHeader';

const DetailMateriPage = ({ chapterData, onBack, userRole, onPesanSesi }) => {

  // Mengambil nama materi dan deskripsi asli dari Database
  const title = chapterData?.namaMateri || chapterData?.nama_materi || 'Detail Materi';
  const description = chapterData?.deskripsiMateri || chapterData?.deskripsi || 'Belum ada deskripsi untuk materi ini.';

  const isMurid = userRole === 'murid';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />

      <PageHeader title={title} onBack={onBack} variant="dark" borderBottom={false} titleStyle={{ fontSize: 20 }} />

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.sectionTitle}>Deskripsi Materi</Text>

          {/* Menampilkan deskripsi asli dari API Database */}
          <Text style={styles.paragraph}>
            {description}
          </Text>

        </ScrollView>
      </View>

      {isMurid && (
        <View style={styles.bottomActionContainer}>
          <TouchableOpacity
            style={styles.pesanButton}
            onPress={onPesanSesi}
            activeOpacity={0.8}
          >
            <Text style={styles.pesanButtonText}>Pesan Sesi Belajar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#284B7A' },

  contentContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#387C65', marginBottom: 15 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 24, marginBottom: 15, textAlign: 'justify' },
  
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  pesanButton: {
    backgroundColor: '#387C65',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#387C65',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  pesanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default DetailMateriPage;