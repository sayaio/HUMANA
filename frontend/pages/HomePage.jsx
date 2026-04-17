import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const HomePage = ({ namaLengkap, email, onLogout }) => {
  const displayName = email ? email.split('@')[0] : 'Pengguna';

  return (
    <View style={styles.homeContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.homeHeaderBg} />
        <View style={styles.homeGreetingContainer}>
          <Text style={styles.homeGreetingText}>
            Selamat datang,{"\n"}{namaLengkap || displayName} !
          </Text>
        </View>

        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>
            <Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi
          </Text>
          <View style={styles.scheduleDetails}>
            <View><Text style={styles.scheduleLabel}>Waktu</Text><Text style={styles.scheduleValue}>06.30 - 09.30</Text></View>
            <View><Text style={styles.scheduleLabel}>Guru</Text><Text style={styles.scheduleValue}>Ahmad Pambudi, S.Pd.</Text></View>
          </View>
          <Image source={LOGO_SOURCE} style={styles.watermarkLogo} resizeMode="contain" />
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBox}><Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" /></View>
            <Text style={styles.actionText}>Pesan Sesi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBox}><Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" /></View>
            <Text style={styles.actionText}>Materi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBox}><Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" /></View>
            <Text style={styles.actionText}>Jadwal Saya</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.chartSection}>
          <View style={styles.donutChartPlaceholder}>
            <View style={styles.donutHole}>
              <Text style={styles.donutHoleText}>Total{"\n"}sesi{"\n"}<Text style={{fontWeight: 'bold', fontSize: 16}}>14</Text></Text>
            </View>
          </View>
          <Text style={[styles.chartLabel, { top: 0, right: '20%' }]}>Matematika{"\n"}21.4%</Text>
          <Text style={[styles.chartLabel, { bottom: 0, right: '15%' }]}>Bahasa Indonesia{"\n"}35.7%</Text>
          <Text style={[styles.chartLabel, { bottom: '20%', left: '20%' }]}>IPS{"\n"}14.3%</Text>
          <Text style={[styles.chartLabel, { top: '20%', left: '20%' }]}>IPA{"\n"}28.6%</Text>
        </View>

        <TouchableOpacity style={styles.tempLogout} onPress={onLogout}>
          <Text style={{color: '#FFF'}}>Logout (Sementara)</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#2A3563' }]} resizeMode="contain" /><Text style={[styles.navText, { color: '#2A3563' }]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Activity</Text></TouchableOpacity>
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabButton}><Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" /></TouchableOpacity>
          <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
        </View>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Chat</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  homeHeaderBg: { position: 'absolute', width: '100%', height: 260, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#2A3563' },
  homeGreetingContainer: { marginTop: 80, paddingHorizontal: 30 },
  homeGreetingText: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', lineHeight: 36, textTransform: 'capitalize' },
  scheduleCard: { backgroundColor: '#FFF', marginHorizontal: 25, marginTop: 40, borderRadius: 20, padding: 25, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 5, overflow: 'hidden' },
  scheduleTitle: { fontSize: 18, color: '#333', marginBottom: 20 },
  scheduleDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  scheduleLabel: { fontSize: 12, color: '#A9A9A9', marginBottom: 5 },
  scheduleValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  watermarkLogo: { position: 'absolute', right: -20, top: 20, width: 120, height: 120, tintColor: '#F0F0F0', opacity: 0.5, zIndex: -1 },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30, paddingHorizontal: 10 },
  actionItem: { alignItems: 'center' },
  actionIconBox: { width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3, marginBottom: 10 },
  actionIcon: { width: 35, height: 35, tintColor: '#2A3563' },
  actionText: { fontSize: 12, color: '#333' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 30, marginTop: 30 },
  chartSection: { marginTop: 40, alignItems: 'center', height: 250, position: 'relative' },
  donutChartPlaceholder: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#34315A', borderWidth: 20, borderColor: '#2A3563', justifyContent: 'center', alignItems: 'center' },
  donutHole: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  donutHoleText: { textAlign: 'center', fontSize: 12, color: '#333' },
  chartLabel: { position: 'absolute', fontSize: 10, color: '#333', textAlign: 'center' },
  tempLogout: { alignSelf: 'center', marginTop: 20, padding: 10, backgroundColor: '#FF6B6B', borderRadius: 10 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEE', paddingHorizontal: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navIcon: { width: 24, height: 24, tintColor: '#A9A9A9', marginBottom: 5 },
  navText: { fontSize: 10, color: '#A9A9A9' },
  fabContainer: { alignItems: 'center', justifyContent: 'center', top: -20 },
  fabButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 5, marginBottom: 5 },
  fabIcon: { width: 35, height: 35, tintColor: '#2A3563' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center' },
});

export default HomePage;