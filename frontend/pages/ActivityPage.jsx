import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  StatusBar, ScrollView, Image, ActivityIndicator 
} from 'react-native';

import { getHistory } from '../services/historyService';

const LOGO_SOURCE = require('../assets/logo_humana.png'); 

const ActivityPage = ({ initialTab = 'aktif', onNavigate, onDetailClick, userId, userRole }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchHistoryData = async () => {
    if (!userId || !userRole) return; 

    // DEBUGGING: Cek terminal untuk melihat apakah role dan id sudah benar
    console.log(`[DEBUG] Memanggil API History -> Role: ${userRole}, ID: ${userId}`);

    setIsLoading(true);
    try {
      const result = await getHistory(userRole, userId);
      
      // DEBUGGING: Cek terminal untuk melihat wujud asli balasan backend
      console.log("[DEBUG] Balasan API History:", result);

      // LOGIKA BARU: Lebih fleksibel menerima berbagai bentuk JSON dari backend
      if (Array.isArray(result)) {
        // Jika backend langsung mengirim Array: [ {id: 1...}, {id: 2...} ]
        setHistoryData(result);
      } 
      else if (result && (result.success === true || result.status === 200)) {
        // Jika backend mengirim Object: { success: true, data: [...] }
        setHistoryData(result.data || result.history || []); 
      } 
      else {
        console.log("[DEBUG] Gagal atau data kosong:", result);
        setHistoryData([]); 
      }

    } catch (error) {
      console.log("[DEBUG] Error fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'riwayat') {
      fetchHistoryData();
    }
  }, [activeTab, userId, userRole]);

  const dummyDataAktif = [1, 2]; 

  const renderCard = (item, isHistory, index) => (
    <View style={styles.card} key={item.id_sesi || item.id || index}>
      <View style={styles.cardIconBox}><Text style={{color: '#FFF', fontSize: 24}}>📖</Text></View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>
          {/* Fallback otomatis jika field bernama mapel, mata_pelajaran, atau nama_mapel */}
          <Text style={{fontWeight: 'bold'}}>
            {item.nama_mapel || item.mata_pelajaran || item.mapel || 'Matematika'}
          </Text> - {item.materi || item.judul_materi || 'Relasi & Fungsi'}
        </Text>
        
        {/* Fallback untuk nama guru */}
        <Text style={styles.cardGuru}>👤 {item.nama_guru || item.guru || 'Ahmad Pambudi, S.Pd.'}</Text>
        
        {/* Fallback untuk waktu */}
        <Text style={styles.cardTime}>{item.waktu_sesi || item.tanggal || item.waktu || '31 FEB, 06.30 - 09.30'}</Text>
      </View>
      
      {isHistory ? (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDetailClick(item)}>
          <Text style={styles.actionBtnText}>Lihat detail</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Ingatkan</Text>
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

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'aktif' && styles.activeTabBtn]} onPress={() => setActiveTab('aktif')}>
          <Text style={[styles.tabText, activeTab === 'aktif' && styles.activeTabText]}>Jadwal Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.activeTabBtn]} onPress={() => setActiveTab('riwayat')}>
          <Text style={[styles.tabText, activeTab === 'riwayat' && styles.activeTabText]}>Riwayat Sesi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {activeTab === 'aktif' ? (
          dummyDataAktif.map((_, index) => renderCard({}, false, index))
        ) : (
          isLoading ? (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#284B7A" />
                <Text style={{ marginTop: 10, color: '#888' }}>Mencari riwayat...</Text>
            </View>
          ) : historyData && historyData.length > 0 ? (
            historyData.map((item, index) => renderCard(item, true, index))
          ) : (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
                <Text style={{ fontSize: 40 }}>📭</Text>
                <Text style={styles.emptyText}>Belum ada riwayat sesi.</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate && onNavigate('Home')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#284B7A' }]} resizeMode="contain" />
          <Text style={[styles.navText, { color: '#284B7A', fontWeight: 'bold' }]}>Activity</Text>
        </TouchableOpacity>
        
        <View style={styles.fabContainer}>
          <View style={styles.fabCutout}>
            <TouchableOpacity style={styles.fabButton}>
              <Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
        </View>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate && onNavigate('Chat')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate && onNavigate('Profile')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTabBtn: { borderBottomWidth: 2, borderBottomColor: '#284B7A' },
  tabText: { fontSize: 14, color: '#A9A9A9', fontWeight: '600' },
  activeTabText: { color: '#284B7A' },
  
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3 },
  cardIconBox: { width: 60, height: 60, backgroundColor: '#387C65', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 12, color: '#333', marginBottom: 5 },
  cardGuru: { fontSize: 11, color: '#555', marginBottom: 5 },
  cardTime: { fontSize: 10, color: '#A9A9A9' },
  actionBtn: { backgroundColor: '#387C65', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, position: 'absolute', bottom: 15, right: 15 },
  actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 10, fontSize: 14 }, 

  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 15 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 10 },
  navIcon: { width: 22, height: 22, tintColor: '#A9A9A9', marginBottom: 5 },
  navText: { fontSize: 10, color: '#A9A9A9' },
  fabContainer: { alignItems: 'center', justifyContent: 'flex-start', width: 70, height: 90, top: -25 },
  fabCutout: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  fabButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabIcon: { width: 28, height: 28, tintColor: '#FFF' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center', marginTop: 2 },
});

export default ActivityPage;