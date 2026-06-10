// pages/PendapatanPage.jsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { fetchPendapatan } from '../services/pendapatanService';
import { formatRupiah } from '../utils/formatters';
import PageHeader from '../components/PageHeader';

const FONTS = {
  bold: 'SF-Pro-Display-Bold',
  regular: 'SF-Pro-Display-Regular',
};

const SUBJECT_ICONS = {
  Matematika: require('../assets/matematika.png'),
  Informatika: require('../assets/informatika.png'),
  Biologi: require('../assets/biologi.png'),
  Kimia: require('../assets/kimia.png'),
  Fisika: require('../assets/fisika.png'),
  Sejarah: require('../assets/sejarah.png'),
  Sosiologi: require('../assets/sosiologi.png'),
  'Bahasa Inggris': require('../assets/inggris.png'),
};

const HARI_ID = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

const PendapatanPage = ({ guruData, onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchPendapatan(guruData?.id);
        if (result?.success) setData(result.data);
      } catch (err) {
        console.error('[PendapatanPage] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [guruData?.id]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <PageHeader
        title="Pendapatan"
        onBack={() => onNavigate?.('HomeGuru')}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#284B7A" />
          <Text style={styles.loadingText}>Memuat data pendapatan...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Card Total Pendapatan */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Pendapatan</Text>
            <Text style={styles.totalValue}>
              {formatRupiah(data?.total_pendapatan)}
            </Text>
          </View>

          {/* Card Bulan Ini & Sesi Selesai */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Bulan Ini</Text>
              <Text style={styles.statValue}>
                {formatRupiah(data?.bulan_ini)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Sesi Selesai</Text>
              <Text style={styles.statValue}>
                {data?.sesi_selesai || 0} Sesi
              </Text>
            </View>
          </View>

          {/* Riwayat Pendapatan */}
          <View style={styles.riwayatHeader}>
            <Text style={styles.riwayatTitle}>Riwayat Pendapatan</Text>
            <TouchableOpacity onPress={() => onNavigate?.('RiwayatPendapatan')}>
              <Text style={styles.lihatSemua}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {data?.riwayat?.length > 0 ? (
            data.riwayat.map((item, index) => (
              <View key={item.id_pemesanan || index} style={styles.riwayatCard}>
                {/* Icon Mapel */}
                <View style={styles.iconBox}>
                  {/* ✅ DIUBAH: Icon sekarang menggunakan file Image dari assets */}
                  {SUBJECT_ICONS[item.nama_mapel] ? (
                    <Image 
                      source={SUBJECT_ICONS[item.nama_mapel]} 
                      style={styles.mapelIconImage} 
                      resizeMode="contain" 
                    />
                  ) : (
                    <Text style={styles.iconText}>⊞</Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.riwayatInfo}>
                  <Text style={styles.riwayatNama} numberOfLines={1}>
                    {item.nama_mapel} — {item.nama_materi}
                  </Text>
                  <Text style={styles.riwayatSub} numberOfLines={1}>
                    {HARI_ID[item.hari] || item.hari}, {item.jam} •{' '}
                    {item.nama_murid}
                  </Text>
                </View>

                {/* Jumlah & Badge */}
                <View style={styles.riwayatRight}>
                  <Text style={styles.riwayatJumlah}>
                    +{formatRupiah(item.jumlah)}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.status?.toUpperCase() || 'TERKIRIM'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 36 }}>💸</Text>
              <Text style={styles.emptyText}>
                bulan ini belum ada pendapatan.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    fontFamily: FONTS.regular,
    marginTop: 10,
    color: '#999',
    fontSize: 13,
  },

  // Card Total
  totalCard: {
    backgroundColor: '#284B7A',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
  },
  totalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
  },
  totalValue: { fontFamily: FONTS.bold, fontSize: 32, color: '#FFF' },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEEF3',
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  statValue: { fontFamily: FONTS.bold, fontSize: 16, color: '#284B7A' },

  // Riwayat
  riwayatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  riwayatTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#1A1A2E' },
  lihatSemua: { fontFamily: FONTS.bold, fontSize: 13, color: '#284B7A' },

  riwayatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAEEF3',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EBF0F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mapelIconImage: {
    width: 32,
    height: 32,
  },
  iconText: { fontSize: 20 },
  riwayatInfo: { flex: 1 },
  riwayatNama: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  riwayatSub: { fontFamily: FONTS.regular, fontSize: 12, color: '#888' },

  riwayatRight: { alignItems: 'flex-end', marginLeft: 8 },
  riwayatJumlah: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#284B7A',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#EBF0F8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#284B7A' },

  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: {
    fontFamily: FONTS.regular,
    color: '#999',
    marginTop: 8,
    fontSize: 13,
  },
});

export default PendapatanPage;