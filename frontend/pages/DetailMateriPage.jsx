import React from 'react';
import {
  StyleSheet, Text, View,
  StatusBar, ScrollView
} from 'react-native';
import PageHeader from '../components/PageHeader';

const DetailMateriPage = ({ chapterData, onBack }) => {

  // Mengambil nama materi dan deskripsi asli dari Database
  const title = chapterData?.namaMateri || 'Detail Materi';
  const description = chapterData?.deskripsiMateri || 'Belum ada deskripsi untuk materi ini.';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />

      <PageHeader title={title} onBack={onBack} variant="dark" borderBottom={false} titleStyle={{ fontSize: 20 }} />

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

  contentContainer: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#387C65', marginBottom: 15 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 24, marginBottom: 15, textAlign: 'justify' }
});

export default DetailMateriPage;