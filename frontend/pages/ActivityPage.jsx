import React, { useState, useEffect, useRef } from 'react';
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
  RefreshControl,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import BottomNavbar from '../components/BottomNavbar';
import { getHistory, getActiveSchedule } from '../services/historyService';

import { Calendar, MessageSquare, User, Home } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');
const USER_ICON = require('../assets/user.png');

const ActivityPage = ({
  initialTab = 'aktif',
  onTabChange,
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
  const [refreshing, setRefreshing] = useState(false);
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeOffset, setActiveOffset] = useState(0);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [hasMoreActive, setHasMoreActive] = useState(true);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    setActiveTab(initialTab === 'aktif' ? 'Jadwal Aktif' : 'Riwayat Sesi');
  }, [initialTab]);

  const fetchActiveData = async (isPullRefresh = false, isLoadMore = false) => {
    if (!userId || !userRole) return;
    if (isLoadMore && !hasMoreActive) return;

    if (isLoadMore) setLoadingMore(true);
    else if (!isPullRefresh) setIsLoading(true);

    const currentOffset = isLoadMore ? activeOffset : 0;
    try {
      const result = await getActiveSchedule(userRole, userId, LIMIT, currentOffset);
      const rawData = result?.data || [];
      const formattedData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
      
      if (formattedData.length < LIMIT) setHasMoreActive(false);
      else setHasMoreActive(true);

      if (isLoadMore) {
        setActiveData(prev => {
          const existingIds = new Set(prev.map(item => item.id_pemesanan).filter(Boolean));
          const uniqueNewData = formattedData.filter(item => !item.id_pemesanan || !existingIds.has(item.id_pemesanan));
          return [...prev, ...uniqueNewData];
        });
      } else {
        setActiveData(formattedData);
      }
      
      setActiveOffset(currentOffset + LIMIT);
    } catch (error) {
      console.log('Error fetch active:', error);
      if (!isLoadMore) setActiveData([]);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchHistoryData = async (isPullRefresh = false, isLoadMore = false) => {
    if (!userId || !userRole) return;
    if (isLoadMore && !hasMoreHistory) return;

    if (isLoadMore) setLoadingMore(true);
    else if (!isPullRefresh) setIsLoading(true);

    const currentOffset = isLoadMore ? historyOffset : 0;
    try {
      const result = await getHistory(userRole, userId, LIMIT, currentOffset); 
      let formattedData = [];
      if (Array.isArray(result)) formattedData = result;
      else if (result && (result.success === true || result.status === 200)) {
        formattedData = result.data || result.history || [];
      }

      if (formattedData.length < LIMIT) setHasMoreHistory(false);
      else setHasMoreHistory(true);

      if (isLoadMore) {
        setHistoryData(prev => {
          const existingIds = new Set(prev.map(item => item.id_pemesanan).filter(Boolean));
          const uniqueNewData = formattedData.filter(item => !item.id_pemesanan || !existingIds.has(item.id_pemesanan));
          return [...prev, ...uniqueNewData];
        });
      } else {
        setHistoryData(formattedData);
      }

      setHistoryOffset(currentOffset + LIMIT);
    } catch (error) {
      console.log('Error fetch history:', error);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
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

  const handleRefresh = async () => {
    if (!userId || !userRole) return;
    setRefreshing(true);
    if (activeTab === 'Jadwal Aktif') {
      setActiveOffset(0);
      setHasMoreActive(true);
      await fetchActiveData(true, false);
    } else {
      setHistoryOffset(0);
      setHasMoreHistory(true);
      await fetchHistoryData(true, false);
    }
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (isLoading || loadingMore) return;
    if (activeTab === 'Jadwal Aktif') {
      fetchActiveData(false, true);
    } else {
      fetchHistoryData(false, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#284B7A" />
      </View>
    );
  };

  const renderCardItem = ({ item, index }) => {
    const isHistory = activeTab === 'Riwayat Sesi';
    const isUnpaid = !isHistory && userRole === 'murid' && item.status_pembayaran === 'menunggu';
    return (
      <View style={styles.card} key={item.id_pemesanan || index}>
        <View style={styles.cardIconBox}>
          {/* PERUBAHAN: Emoji diganti dengan Image dari assets */}
          <Image
            source={require('../assets/buku.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
          />
        </View>
        <View style={[styles.cardInfo, { marginRight: isUnpaid ? 80 : 70 }]}>
          <Text style={styles.cardTitle}>
            <Text style={{ fontWeight: 'bold' }}>
              {item.mata_pelajaran?.nama_mapel || item.nama_mapel || 'Pelajaran'}
            </Text>{' '}
            - {item.materi?.nama_materi || item.nama_materi || 'Materi'}
          </Text>

          <Text style={styles.cardGuru}>
            <Image source={USER_ICON} style={{ width: 8, height: 8, resizeMode: 'contain' }} />{'  '}
            {userRole === 'murid'
              ? item.nama_guru || item.guru?.nama_guru || 'Guru tidak terdaftar'
              : item.nama_murid ||
              item.murid?.nama_murid ||
              'Murid tidak terdaftar'}
          </Text>

          <Text style={styles.cardTime}>
            {(() => {
              if (!item.waktu_mulai) return item.waktu_string || 'Waktu tidak tersedia';
              const d = new Date(item.waktu_mulai instanceof Date ? item.waktu_mulai : item.waktu_mulai.toString().replace(' ', 'T'));
              if (isNaN(d.getTime())) return item.waktu_string || 'Waktu tidak tersedia';
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              const day = d.getDate().toString().padStart(2, '0');
              const mon = months[d.getMonth()];
              const year = d.getFullYear();
              const h = d.getHours().toString().padStart(2, '0');
              const m = d.getMinutes().toString().padStart(2, '0');
              return `${day} ${mon} ${year}, ${h}.${m}`;
            })()}
          </Text>
        </View>

        {isUnpaid && (
          <View style={styles.badgeYellow}>
            <Text style={styles.badgeYellowText}>Bayar</Text>
          </View>
        )}

        {isHistory ? (
          /* PERUBAHAN: Saat beri ulasan beralih ke SessionDetail */
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#387C65' }]}
            onPress={() => {
              if (onDetailClick) {
                onDetailClick(item, true);
              }
            }}
          >
            <Text style={styles.actionBtnText}>Beri Ulasan</Text>
          </TouchableOpacity>
        ) : (
          /* PERUBAHAN: Saat lihat detail beralih ke DetailSesiAktif */
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (onDetailClick) {
                onDetailClick(item, false);
              }
            }}
          >
            <Text style={styles.actionBtnText}>Lihat Detail</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();

  // Memastikan ScrollView bergeser saat tab berubah
  useEffect(() => {
    const index = activeTab === 'Jadwal Aktif' ? 0 : 1;
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
  }, [activeTab, width]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    const newTab = page === 0 ? 'Jadwal Aktif' : 'Riwayat Sesi';
    if (activeTab !== newTab) {
      setActiveTab(newTab);
      if (onTabChange) onTabChange(newTab);
    }
  };

  const renderList = (data, isHistory) => (
    <View style={{ width, flex: 1 }}>
        <FlatList
        data={data}
        keyExtractor={(item, index) => item.id_pemesanan?.toString() || index.toString()}
        renderItem={renderCardItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 110, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#284B7A']} tintColor="#284B7A" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>{isHistory ? '📜' : '📅'}</Text>
            <Text style={styles.emptyText}>
                {isHistory ? 'Belum ada riwayat sesi.' : 'Tidak ada jadwal aktif saat ini.'}
            </Text>
            </View>
        }
        />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aktivitas</Text>
      </View>

      <View style={styles.tabSliderContainer}>
        {['Jadwal Aktif', 'Riwayat Sesi'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButtonElement,
              activeTab === tab && styles.tabButtonElementActive,
            ]}
            onPress={() => {
              setActiveTab(tab);
              if (onTabChange) onTabChange(tab);
            }}
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
      <View style={{ flex: 1 }}>
        {isLoading && !refreshing ? (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#284B7A" />
            <Text style={{ marginTop: 10, color: '#888' }}>
              Memuat data...
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
          >
            {renderList(activeData, false)}
            {renderList(historyData, true)}
          </ScrollView>
        )}
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
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
  badgeYellow: {
    backgroundColor: '#FFFDE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F9A825',
    position: 'absolute',
    top: 15,
    right: 15,
  },
  badgeYellowText: {
    color: '#F9A825',
    fontSize: 9,
    fontWeight: 'bold',
  },
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
