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
  const [terpilih, setTerpilih]             = useState(new Set()); // Set of id_materi
  const [terpilihAwal, setTerpilihAwal]     = useState(new Set()); // data awal dari DB
  const [search, setSearch]                 = useState('');
  const [filterJenjang, setFilterJenjang]   = useState('Semua');
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);

  // === LOAD DATA ===
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allMateri, materiGuru] = await Promise.all([
          materiGuruService.getAllMateri(),
          materiGuruService.getMateriGuru(idGuru),
        ]);
        setSemuaMateri(allMateri);

        // Set materi yang sudah dipilih sebelumnya
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

  // === TOGGLE CHECKBOX ===
  const toggleMateri = (idMateri) => {
    setTerpilih(prev => {
      const next = new Set(prev);
      if (next.has(idMateri)) next.delete(idMateri);
      else next.add(idMateri);
      return next;
    });
  };

  // === HAPUS CHIP ===
  const hapusChip = async (item) => {
    // Hapus dari state lokal
    setTerpilih(prev => {
      const next = new Set(prev);
      next.delete(item.id_materi);
      return next;
    });

    // Kalau sudah ada di DB, hapus dari DB juga
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

  // === SIMPAN ===
  const handleSimpan = async () => {
    // Hanya simpan yang baru dipilih (belum ada di DB)
    const baru = [...terpilih].filter(id => !terpilihAwal.has(id));
    if (baru.length === 0) {
      Alert.alert('Info', 'Tidak ada perubahan baru untuk disimpan.');
      return;
    }
    setSaving(true);
    try {
      await materiGuruService.simpanMateriGuru(idGuru, baru);
      setTerpilihAwal(new Set(terpilih));
      Alert.alert('Berhasil 🎉', `${baru.length} materi berhasil disimpan!`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  // === GROUPING & FILTER ===
  const grouped = useMemo(() => {
    let filtered = semuaMateri;

    // Filter jenjang
    if (filterJenjang !== 'Semua') {
      filtered = filtered.filter(m => m.jenjang === filterJenjang);
    }

    // Filter search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.nama_materi.toLowerCase().includes(q) ||
        m.nama_mapel.toLowerCase().includes(q)
      );
    }

    // Group by nama_mapel + kelas
    const map = {};
    filtered.forEach(m => {
      const key = `${m.nama_mapel}||${m.kelas}`;
      if (!map[key]) map[key] = { nama_mapel: m.nama_mapel, kelas: m.kelas, jenjang: m.jenjang, items: [] };
      map[key].items.push(m);
    });

    return Object.values(map);
  }, [semuaMateri, filterJenjang, search]);

  // Data materi terpilih (untuk chips)
  const chipData = useMemo(() => {
    return semuaMateri.filter(m => terpilih.has(m.id_materi));
  }, [semuaMateri, terpilih]);

  // === RENDER ===
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284B7A" />
          <Text style={styles.loadingText}>Memuat data materi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.headerBack}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Materi</Text>
        <TouchableOpacity onPress={handleSimpan} disabled={saving} activeOpacity={0.7}>
          {saving
            ? <ActivityIndicator size="small" color="#284B7A" />
            : <Text style={styles.headerSimpan}>Simpan</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari materi pelajaran..."
            placeholderTextColor="#ABABAB"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Jenjang */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {JENJANG_OPTIONS.map(j => (
            <TouchableOpacity
              key={j}
              style={[styles.filterChip, filterJenjang === j && styles.filterChipActive]}
              onPress={() => setFilterJenjang(j)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, filterJenjang === j && styles.filterChipTextActive]}>
                {j}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Materi Terpilih */}
        {chipData.length > 0 && (
          <View style={styles.chipSection}>
            <Text style={styles.chipSectionLabel}>
              Materi Terpilih
              <Text style={styles.chipCount}> ({chipData.length})</Text>
            </Text>
            <View style={styles.chipWrap}>
              {chipData.map(item => (
                <TouchableOpacity
                  key={item.id_materi}
                  style={styles.chip}
                  onPress={() => hapusChip(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText} numberOfLines={1}>{item.nama_materi}</Text>
                  <Text style={styles.chipX}> ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Daftar Materi */}
        {grouped.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Tidak ada materi ditemukan</Text>
          </View>
        ) : (
          grouped.map((group, idx) => (
            <View key={`${group.nama_mapel}-${group.kelas}-${idx}`} style={styles.groupSection}>
              {/* Group Header */}
              <View style={styles.groupHeader}>
                <Text style={styles.groupIcon}>📘</Text>
                <Text style={styles.groupTitle}>
                  {group.nama_mapel}
                  <Text style={styles.groupKelas}> — Kelas {group.kelas}</Text>
                </Text>
                <View style={styles.jenjangBadge}>
                  <Text style={styles.jenjangBadgeText}>{group.jenjang}</Text>
                </View>
              </View>

              {/* Item List */}
              <View style={styles.groupCard}>
                {group.items.map((item, itemIdx) => {
                  const checked = terpilih.has(item.id_materi);
                  return (
                    <TouchableOpacity
                      key={item.id_materi}
                      style={[
                        styles.materiItem,
                        itemIdx === group.items.length - 1 && styles.materiItemLast,
                      ]}
                      onPress={() => toggleMateri(item.id_materi)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.materiName}>{item.nama_materi}</Text>
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: FONTS.regular, marginTop: 12, color: '#999', fontSize: 13 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 50, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F2F5', backgroundColor: '#FFF',
  },
  headerBack: { fontFamily: FONTS.regular, fontSize: 15, color: '#555' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 17, color: '#1A1A2E' },
  headerSimpan: { fontFamily: FONTS.bold, fontSize: 15, color: '#284B7A' },

  scrollContent: { flex: 1 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 20, marginBottom: 16,
    backgroundColor: '#F5F7FA', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#EAEEF3',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 14, color: '#333' },
  searchClear: { fontFamily: FONTS.bold, fontSize: 14, color: '#ABABAB', paddingLeft: 8 },

  // Filter Jenjang
  filterRow: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F0F2F5', marginRight: 8,
    borderWidth: 1, borderColor: '#EAEEF3',
  },
  filterChipActive: { backgroundColor: '#284B7A', borderColor: '#284B7A' },
  filterChipText: { fontFamily: FONTS.bold, fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#FFF' },

  // Chips Terpilih
  chipSection: { paddingHorizontal: 20, marginBottom: 16 },
  chipSectionLabel: { fontFamily: FONTS.bold, fontSize: 13, color: '#1A1A2E', marginBottom: 10 },
  chipCount: { color: '#284B7A' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#284B7A', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, maxWidth: 180,
  },
  chipText: { fontFamily: FONTS.bold, fontSize: 12, color: '#FFF', flexShrink: 1 },
  chipX: { fontFamily: FONTS.bold, fontSize: 14, color: 'rgba(255,255,255,0.7)' },

  // Group Section
  groupSection: { marginHorizontal: 20, marginBottom: 20 },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 10,
  },
  groupIcon: { fontSize: 18, marginRight: 8 },
  groupTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#284B7A', flex: 1 },
  groupKelas: { fontFamily: FONTS.regular, fontSize: 13, color: '#284B7A' },
  jenjangBadge: {
    backgroundColor: '#EBF0F8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  jenjangBadgeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#284B7A' },

  // Group Card
  groupCard: {
    backgroundColor: '#FFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#EAEEF3',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  materiItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F2F5',
  },
  materiItemLast: { borderBottomWidth: 0 },
  materiName: { fontFamily: FONTS.regular, fontSize: 14, color: '#1A1A2E', flex: 1, marginRight: 12 },

  // Checkbox
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#C0C4CC',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: { backgroundColor: '#284B7A', borderColor: '#284B7A' },
  checkmark: { fontFamily: FONTS.bold, fontSize: 13, color: '#FFF' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontFamily: FONTS.regular, fontSize: 14, color: '#ABABAB' },
});

export default TambahMateriGuruPage;
