import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, TextInput,
  Image, ActivityIndicator
} from 'react-native';
import { fetchMateriBySubject } from '../services/MateriService';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const MateriPage = ({ subjectName, id_mapel, onBack, onChapterSelect }) => {
  const [materiList, setMateriList]     = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const loadMateri = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMateriBySubject(id_mapel);
        setMateriList(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Gagal memuat materi.');
      } finally {
        setLoading(false);
      }
    };

    if (id_mapel) loadMateri();
  }, [id_mapel]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(materiList);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        materiList.filter(
          (m) =>
            m.namaMateri?.toLowerCase().includes(q) ||
            m.deskripsiMateri?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, materiList]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#284B7A" />
          <Text style={styles.stateText}>Memuat materi...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setLoading(true)}>
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filtered.length === 0) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorIcon}>📭</Text>
          <Text style={styles.stateText}>
            {searchQuery ? 'Materi tidak ditemukan.' : 'Belum ada materi tersedia.'}
          </Text>
        </View>
      );
    }

    return filtered.map((materi) => (
      <View key={materi.id || Math.random()} style={styles.card}>
        <View style={styles.cardIconBox}>
          <Image source={LOGO_SOURCE} style={styles.cardIcon} resizeMode="contain" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{materi.namaMateri}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {materi.deskripsiMateri || 'Tidak ada deskripsi.'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.lihatBtn}
          // PENTING: Kita kirim seluruh object "materi" ke App.jsx
          onPress={() => onChapterSelect(materi)}
        >
          <Text style={styles.lihatBtnText}>Lihat</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#284B7A" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'❮'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subjectName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}><Text style={{ fontWeight: 'bold' }}>Materi</Text></Text>
          <Text style={{ fontSize: 18, color: '#666' }}>▼</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Materi"
            placeholderTextColor="#A9A9A9"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Text style={{ fontSize: 16, color: '#A9A9A9' }}>🔍</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          {renderContent()}
        </ScrollView>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#284B7A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 },
  backBtn: { padding: 10, marginLeft: -10 },
  backIcon: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  contentContainer: { flex: 1, backgroundColor: '#FAFAFA', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 25 },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  contentTitle: { fontSize: 18, color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  searchInput: { flex: 1, height: '100%', color: '#333' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardIconBox: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardIcon: { width: 35, height: 35, tintColor: '#333' },
  cardTextContainer: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 3 },
  cardSubtitle: { fontSize: 11, color: '#888', lineHeight: 14 },
  lihatBtn: { backgroundColor: '#D0E1F9', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  lihatBtnText: { color: '#284B7A', fontSize: 12, fontWeight: 'bold' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  stateText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },
  errorIcon: { fontSize: 36 },
  retryBtn: { marginTop: 12, backgroundColor: '#284B7A', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10 },
  retryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});

export default MateriPage;
//arkan