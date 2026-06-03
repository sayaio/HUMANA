import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, Alert, ActivityIndicator, SafeAreaView, StatusBar,
} from 'react-native';
import { materiGuruService } from '../services/materiGuruService';

const FONTS = { bold: 'SF-Pro-Display-Bold', regular: 'SF-Pro-Display-Regular' };
const JENJANG_OPTIONS = ['Semua', 'SD', 'SMP', 'SMA'];

const TambahMateriGuruPage = ({ onBack, idGuru }) => {
  const [semuaMateri, setSemuaMateri]       = useState([]);
  const [terpilih, setTerpilih]             = useState(new Set()); 
  const [terpilihAwal, setTerpilihAwal]     = useState(new Set()); 
  const [search, setSearch]                 = useState('');
  const [filterJenjang, setFilterJenjang]   = useState('Semua');
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allMateri, materiGuru] = await Promise.all([
          materiGuruService.getAllMateri(),
          materiGuruService.getMateriGuru(idGuru),
        ]);
        setSemuaMateri(allMateri);
        const idSet = new Set(materiGuru.map(m => m.id_materi));
        setTerpilih(new Set(idSet));
        setTerpilihAwal(new Set(idSet));
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [idGuru]);

  const toggleMateri = (idMateri) => {
    setTerpilih(prev => {
      const next = new Set(prev);
      if (next.has(idMateri)) next.delete(idMateri);
      else next.add(idMateri);
      return next;
    });
  };

  const hapusChip = async (item) => {
    setTerpilih(prev => {
      const next = new Set(prev);
      next.delete(item.id_materi);
      return next;
    });
    if (terpilihAwal.has(item.id_materi)) {
      try {
        await materiGuruService.hapusMateriGuru(idGuru, item.id_materi);
        setTerpilihAwal(prev => {
          const next = new Set(prev);
          next.delete(item.id_materi);
          return next;
        });
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleSimpan = async () => {
    const baru = [...terpilih].filter(id => !terpilihAwal.has(id));
    if (baru.length === 0 && terpilih.size === terpilihAwal.size) {
      Alert.alert('Info', 'Tidak ada perubahan baru untuk disimpan.');
      return;
    }
    setSaving(true);
    try {
      await materiGuruService.simpanMateriGuru(idGuru, [...terpilih]);
      setTerpilihAwal(new Set(terpilih));
      Alert.alert('Berhasil 🎉', `Perubahan materi berhasil disimpan!`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const grouped = useMemo(() => {
    let filtered = semuaMateri;
    if (filterJenjang !== 'Semua') {
      filtered = filtered.filter(m => m.jenjang === filterJenjang);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.nama_materi.toLowerCase().includes(q) ||
        m.nama_mapel.toLowerCase().includes(q)
      );
    }
    const map = {};
    filtered.forEach(m => {
      const key = m.nama_mapel;
      if (!map[key]) map[key] = { nama_mapel: m.nama_mapel, items: [] };
      map[key].items.push(m);
    });
    return Object.values(map);
  }, [semuaMateri, filterJenjang, search]);

  const chipData = useMemo(() => {
    return semuaMateri.filter(m => terpilih.has(m.id_materi));
  }, [semuaMateri, terpilih]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284B7A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header Sesuai Figma */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.headerBack}>❮ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Materi</Text>
        <TouchableOpacity onPress={handleSimpan} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#284B7A" /> : <Text style={styles.headerSimpan}>Simpan</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Bar Sesuai Figma */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi pelajaran..."
            placeholderTextColor="#ABABAB"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Jenjang (SD, SMP, SMA) */}
        <View style={styles.filterContainer}>
          {JENJANG_OPTIONS.map(j => (
            <TouchableOpacity
              key={j}
              style={[styles.filterChip, filterJenjang === j && styles.filterChipActive]}
              onPress={() => setFilterJenjang(j)}
            >
              <Text style={[styles.filterChipText, filterJenjang === j && styles.filterChipTextActive]}>{j}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Materi Terpilih Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleLabel}>Materi Terpilih</Text>
        </View>
        <View style={styles.chipWrap}>
          {chipData.length === 0 ? (
            <Text style={styles.emptyChipText}>Belum ada materi dipilih</Text>
          ) : (
            chipData.map(item => (
              <TouchableOpacity key={item.id_materi} style={styles.chip} onPress={() => hapusChip(item)}>
                <Text style={styles.chipText}>{item.nama_mapel}: {item.nama_materi}</Text>
                <Text style={styles.chipX}>✕</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Daftar List Materi Grouped */}
        {grouped.map((group, idx) => (
          <View key={`${group.nama_mapel}-${idx}`} style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>📂</Text>
              <Text style={styles.groupTitleText}>{group.nama_mapel}</Text>
            </View>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIdx) => {
                const checked = terpilih.has(item.id_materi);
                return (
                  <TouchableOpacity
                    key={item.id_materi}
                    style={[styles.materiItem, itemIdx === group.items.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => toggleMateri(item.id_materi)}
                  >
                    <Text style={styles.materiNameText}>{item.nama_materi} ({item.jenjang})</Text>
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 15,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F2F2F2'
  },
  backBtn: { width: 80 },
  headerBack: { fontSize: 14, color: '#333', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A1A2E' },
  headerSimpan: { fontSize: 15, fontWeight: 'bold', color: '#2D669F', width: 80, textAlign: 'right' },
  scrollContent: { flex: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', margin: 20,
    backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 15,
    height: 50, borderWidth: 1, borderColor: '#E0E0E0'
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  filterChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F5F5F5', marginRight: 10, borderWidth: 1, borderColor: '#EAEAEA'
  },
  filterChipActive: { backgroundColor: '#1A3A5F', borderColor: '#1A3A5F' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterChipTextActive: { color: '#FFF' },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 10 },
  sectionTitleLabel: { fontSize: 14, color: '#888', fontWeight: '500' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 25 },
  chip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A5F',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20
  },
  chipText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
  chipX: { marginLeft: 8, color: '#FFF', fontSize: 12 },
  emptyChipText: { fontSize: 13, color: '#CCC', fontStyle: 'italic' },
  groupSection: { paddingHorizontal: 20, marginBottom: 25 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  groupIcon: { fontSize: 18, marginRight: 10 },
  groupTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1A3A5F' },
  groupCard: {
    backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0',
    overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  materiItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#FAFAFA'
  },
  materiNameText: { fontSize: 14, color: '#333', flex: 1 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#DCDFE6',
    justifyContent: 'center', alignItems: 'center'
  },
  checkboxChecked: { backgroundColor: '#1A3A5F', borderColor: '#1A3A5F' },
  checkmark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});

export default TambahMateriGuruPage;