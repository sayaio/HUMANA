import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import BottomNavbar from '../components/BottomNavbar';
import { getHistory, getActiveSchedule } from '../services/historyService';

// Import Ikon Lucide agar seragam dengan HomePage
import { Calendar, MessageSquare, User, Home } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const ActivityPage = ({
  initialTab = 'aktif',
  onNavigate,
  onDetailClick,
  userId,
  userRole,
}) => {
  const role = userRole ? userRole.toLowerCase() : 'murid';
  const [activeTab, setActiveTab] = useState(
    initialTab === 'aktif' ? 'Jadwal Aktif' : 'Riwayat Sesi',
  );
  const [activeData, setActiveData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab === 'aktif' ? 'Jadwal Aktif' : 'Riwayat Sesi');
  }, [initialTab]);

  const fetchActiveData = async () => {
    setIsLoading(true);
    try {
      const result = await getActiveSchedule(userRole, userId);
      console.log('Hasil dari Backend:', result);

      if (result && result.success) {
        const rawData = result.data;
        const formattedData = Array.isArray(rawData)
          ? rawData
          : rawData
          ? [rawData]
          : [];
        setActiveData(formattedData);
      } else {
        setActiveData([]);
      }
    } catch (error) {
      console.log('Error fetch active:', error);
      setActiveData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId || !userRole) return;

    if (activeTab === 'Jadwal Aktif') {
      fetchActiveData();
    } else if (activeTab === 'Riwayat Sesi') {
      fetchHistoryData();
    }
  }, [activeTab, userId, userRole]);

  const fetchHistoryData = async () => {
    if (!userId || !userRole) {
      console.log('❌ FETCH DIBATALKAN KARENA ID ATAU ROLE KOSONG!');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getHistory(userRole, userId);
      console.log('[DEBUG] Balasan API History:', result);

      if (Array.isArray(result)) {
        setHistoryData(result);
      } else if (result && (result.success === true || result.status === 200)) {
        setHistoryData(result.data || result.history || []);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.log('[DEBUG] Error fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCard = (item, isHistory, index) => (
    <View style={styles.card} key={item.id_pemesanan || index}>
      <View style={styles.cardIconBox}>
        {/* PERUBAHAN: Emoji diganti dengan Image dari assets[cite: 11] */}
        <Image 
          source={require('../assets/buku.png')} 
          style={{ width: 40, height: 40, resizeMode: 'contain' }} 
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>
          <Text style={{ fontWeight: 'bold' }}>
            {item.mata_pelajaran?.nama_mapel || item.nama_mapel || 'Pelajaran'}
          </Text>{' '}
          - {item.materi?.nama_materi || item.nama_materi || 'Materi'}
        </Text>

        <Text style={styles.cardGuru}>
          👤{' '}
          {userRole === 'murid'
            ? item.nama_guru || item.guru?.nama_guru || 'Guru tidak terdaftar'
            : item.nama_murid ||
              item.murid?.nama_murid ||
              'Murid tidak terdaftar'}
        </Text>

        <Text style={styles.cardTime}>
          {item.waktu_mulai
            ? new Date(
                item.waktu_mulai.toString().replace(' ', 'T'),
              ).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : item.waktu_string || 'Waktu tidak tersedia'}
        </Text>
      </View>

      {isHistory ? (
        /* PERUBAHAN: Saat beri ulasan beralih ke SessionDetail[cite: 12, 15] */
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#387C65' }]}
          onPress={() => {
            if (onDetailClick) {
                onDetailClick(item); 
                onNavigate('SessionDetail'); 
            }
          }}
        >
          <Text style={styles.actionBtnText}>Beri Ulasan</Text>
        </TouchableOpacity>
      ) : (
        /* PERUBAHAN: Saat lihat detail beralih ke DetailSesiAktif[cite: 12, 15] */
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => {
            if (onDetailClick) {
              onDetailClick(item); 
              onNavigate('DetailSesiAktif'); 
            }
          }}
        >
          <Text style={styles.actionBtnText}>Lihat Detail</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <View style={styles.tabSliderContainer}>
        {['Jadwal Aktif', 'Riwayat Sesi'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButtonElement,
              activeTab === tab && styles.tabButtonElementActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      >
        {activeTab === 'Jadwal Aktif' ? (
          isLoading ? (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#284B7A" />
              <Text style={{ marginTop: 10, color: '#888' }}>
                Memuat jadwal...
              </Text>
            </View>
          ) : activeData && activeData.length > 0 ? (
            activeData.map((item, index) => renderCard(item, false, index))
          ) : (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <Text style={{ fontSize: 40 }}>📅</Text>
              <Text style={styles.emptyText}>
                Tidak ada jadwal aktif saat ini.
              </Text>
            </View>
          )
        ) : isLoading ? (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#284B7A" />
            <Text style={{ marginTop: 10, color: '#888' }}>
              Mencari riwayat...
            </Text>
          </View>
        ) : historyData && historyData.length > 0 ? (
          historyData.map((item, index) => renderCard(item, true, index))
        ) : (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={styles.emptyText}>Belum ada riwayat sesi.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavbar
        currentScreen="Activity"
        onNavigate={onNavigate}
        userRole={userRole}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  tabSliderContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#F0F2F5',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButtonElement: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonElementActive: {
    backgroundColor: '#FFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabButtonText: { fontSize: 13, color: '#666', fontWeight: '500' },
  tabButtonTextActive: { color: '#284B7A', fontWeight: 'bold' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#387C65',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 12, color: '#333', marginBottom: 5 },
  cardGuru: { fontSize: 11, color: '#555', marginBottom: 5 },
  cardTime: { fontSize: 10, color: '#A9A9A9' },
  actionBtn: {
    backgroundColor: '#387C65',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
    fontSize: 14,
  },
});

export default ActivityPage;