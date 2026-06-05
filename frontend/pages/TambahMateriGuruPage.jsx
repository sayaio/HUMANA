import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, StatusBar,
} from 'react-native';
import { materiGuruService } from '../services/materiGuruService';
import PageHeader from '../components/PageHeader';
import { useAppAlert } from '../components/AppAlertProvider';

const FONTS = { bold: 'SF-Pro-Display-Bold', regular: 'SF-Pro-Display-Regular' };
const JENJANG_OPTIONS = ['Semua', 'SD', 'SMP', 'SMA'];

const TambahMateriGuruPage = ({ onBack, idGuru }) => {
  const { showInfo } = useAppAlert();
  const [semuaMateri, setSemuaMateri]       = useState([]);
  const [terpilih, setTerpilih]             = useState(new Set()); 
  const [terpilihAwal, setTerpilihAwal]     = useState(new Set()); 
  const [search, setSearch]                 = useState('');
  const [filterJenjang, setFilterJenjang]   = useState('Semua');
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

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
        showInfo('Error', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [idGuru]);

  const toggleGroup = (nama_mapel) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(nama_mapel)) next.delete(nama_mapel);
      else next.add(nama_mapel);
      return next;
    });
  };

  const toggleMateri = (idMateri) => {
    setTerpilih(prev => {
      const next = new Set(prev);
      if (next.has(idMateri)) next.delete(idMateri);
      else next.add(idMateri);
      return next;
    });
  };

  // Hapus chip hanya membatalkan pilihan secara lokal (di-stage),
  // perubahan baru dipersistkan ke DB saat menekan "Simpan".
  const hapusChip = (item) => {
    setTerpilih(prev => {
      const next = new Set(prev);
      next.delete(item.id_materi);
      return next;
    });
  };

  const handleSimpan = async () => {
    // Deteksi perubahan: bandingkan set terpilih dengan kondisi awal (tambah ATAU hapus).
    const tidakAdaPerubahan =
      terpilih.size === terpilihAwal.size &&
      [...terpilih].every(id => terpilihAwal.has(id));
    if (tidakAdaPerubahan) {
      showInfo('Info', 'Tidak ada perubahan untuk disimpan.');
      return;
    }
    setSaving(true);
    try {
      // Kirim SELURUH daftar terpilih; backend menyinkronkan (insert baru + hapus yang dilepas).
      await materiGuruService.simpanMateriGuru(idGuru, [...terpilih]);
      setTerpilihAwal(new Set(terpilih));
      showInfo('Berhasil', 'Perubahan materi berhasil disimpan!');
    } catch (error) {
      showInfo('Error', error.message);
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
      <View style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284B7A" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <PageHeader
        title="Tambah Materi"
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={handleSimpan} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#284B7A" />
            ) : (
              <Text style={styles.headerSimpan}>Simpan</Text>
            )}
          </TouchableOpacity>
        }
      />

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
        {grouped.map((group, idx) => {
          const isExpanded = expandedGroups.has(group.nama_mapel);
          const selectedCount = group.items.filter(item => terpilih.has(item.id_materi)).length;
          return (
            <View key={`${group.nama_mapel}-${idx}`} style={styles.groupSection}>
              <TouchableOpacity
                style={[styles.groupHeader, styles.groupHeaderDropdown, isExpanded && styles.groupHeaderExpanded]}
                onPress={() => toggleGroup(group.nama_mapel)}
                activeOpacity={0.8}
              >
                <View style={styles.groupHeaderLeft}>
                  <Text style={styles.groupTitleText}>{group.nama_mapel}</Text>
                  {selectedCount > 0 && (
                    <View style={styles.groupBadge}>
                      <Text style={styles.groupBadgeText}>{selectedCount}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.chevron, isExpanded && styles.chevronUp]}>
                  <Text style={styles.chevronText}>›</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
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
              )}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSimpan: { fontSize: 15, fontWeight: 'bold', color: '#2D669F', textAlign: 'right' },
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
  groupSection: { paddingHorizontal: 20, marginBottom: 10 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  groupHeaderDropdown: {
    justifyContent: 'space-between', backgroundColor: '#FFF',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#E8EDF3',
    elevation: 2, shadowColor: '#1A3A5F', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    marginBottom: 0,
  },
  groupHeaderExpanded: {
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
    borderBottomColor: '#E8EDF3', backgroundColor: '#F4F7FB',
  },
  groupHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  groupBadge: {
    marginLeft: 8, backgroundColor: '#1A3A5F',
    borderRadius: 10, minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  groupBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  chevron: { justifyContent: 'center', alignItems: 'center', width: 24, height: 24 },
  chevronUp: { transform: [{ rotate: '90deg' }] },
  chevronText: { fontSize: 22, color: '#1A3A5F', fontWeight: 'bold', lineHeight: 24 },
  groupIcon: { fontSize: 18, marginRight: 10 },
  groupTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1A3A5F' },
  groupCard: {
    backgroundColor: '#FFF', borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    borderWidth: 1, borderTopWidth: 0, borderColor: '#E8EDF3',
    overflow: 'hidden', elevation: 2, shadowColor: '#1A3A5F', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    marginBottom: 0,
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