import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image } from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png'); // Dummy icon bawah

const ActivityPage = ({ initialTab = 'aktif', onNavigate, onDetailClick }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab jika masuk dari menu Home (Jadwal Saya)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const dummyData = [1, 2, 3]; // Loop dummy untuk list

  const renderCard = (isHistory) => (
    <View style={styles.card} key={Math.random()}>
      <View style={styles.cardIconBox}><Text style={{color: '#FFF', fontSize: 24}}>📖</Text></View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}><Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi</Text>
        <Text style={styles.cardGuru}>👤 Ahmad Pambudi, S.Pd.</Text>
        <Text style={styles.cardTime}>31 FEB, 06.30 - 09.30</Text>
      </View>
      {isHistory ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onDetailClick}>
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

      {/* Custom Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'aktif' && styles.activeTabBtn]} onPress={() => setActiveTab('aktif')}>
          <Text style={[styles.tabText, activeTab === 'aktif' && styles.activeTabText]}>Jadwal Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === 'riwayat' && styles.activeTabBtn]} onPress={() => setActiveTab('riwayat')}>
          <Text style={[styles.tabText, activeTab === 'riwayat' && styles.activeTabText]}>Riwayat Sesi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {activeTab === 'aktif' ? dummyData.slice(0, 2).map(() => renderCard(false)) : dummyData.map(() => renderCard(true))}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Home')}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#284B7A' }]} resizeMode="contain" /><Text style={[styles.navText, { color: '#284B7A', fontWeight: 'bold' }]}>Activity</Text></TouchableOpacity>
        <View style={styles.fabContainer}>
          <View style={styles.fabCutout}>
            <TouchableOpacity style={styles.fabButton}><Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" /></TouchableOpacity>
          </View>
          <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
        </View>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Chat</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
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