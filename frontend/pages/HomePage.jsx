import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  StatusBar, ScrollView, Dimensions, Modal 
} from 'react-native';

const { width } = Dimensions.get('window');
const LOGO_SOURCE = require('../assets/logo_humana.png'); // Placeholder icon utama

const HomePage = ({ namaLengkap, email, onLogout, onSelectSubject }) => {
  const displayName = email ? email.split('@')[0] : 'Pengguna';

  // State untuk mengontrol visibilitas Modal Materi
  const [isMateriVisible, setIsMateriVisible] = useState(false);

  // ==========================================
  // DATA PELAJARAN DENGAN ASSET ASLI KAMU
  // ==========================================
  const favoriteSubjects = [
    { id: 'Informatika', name: 'Informatika', icon: require('../assets/informatika.png') },
    { id: 'Sosiologi', name: 'Sosiologi', icon: require('../assets/sosiologi.png') },
    { id: 'Biologi', name: 'Biologi', icon: require('../assets/biologi.png') },
    { id: 'Sejarah', name: 'Sejarah', icon: require('../assets/sejarah.png') },
  ];

  const allSubjects = [
    { id: 'Matematika', name: 'Matematika', icon: require('../assets/matematika.png') },
    { id: 'Informatika', name: 'Informatika', icon: require('../assets/informatika.png') },
    { id: 'Biologi', name: 'Biologi', icon: require('../assets/biologi.png') },
    { id: 'Kimia', name: 'Kimia', icon: require('../assets/kimia.png') },
    { id: 'Fisika', name: 'Fisika', icon: require('../assets/fisika.png') },
    { id: 'Sejarah', name: 'Sejarah', icon: require('../assets/sejarah.png') },
    { id: 'Sosiologi', name: 'Sosiologi', icon: require('../assets/sosiologi.png') },
    { id: 'Inggris', name: 'Inggris', icon: require('../assets/inggris.png') },
  ];

  // Komponen Reusable untuk Render Ikon Pelajaran di dalam Modal
  const renderSubjectItem = (subject) => (
    <TouchableOpacity 
      key={subject.id} 
      style={styles.subjectItemContainer}
      onPress={() => {
        setIsMateriVisible(false); // Tutup modal saat diklik
        onSelectSubject(subject.id); // Pindah ke halaman Materi sesuai mapel
      }}
    >
      <View style={styles.subjectIconBox}>
        <Image 
          source={subject.icon} 
          style={styles.subjectIconImage} 
          resizeMode="contain" 
        />
      </View>
      <Text style={styles.subjectItemText}>{subject.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.homeContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerBackground}>
          <Image source={LOGO_SOURCE} style={styles.headerWatermark} resizeMode="contain" />
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Selamat datang,{"\n"}{namaLengkap || displayName} !
          </Text>
        </View>

        {/* KARTU JADWAL */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleSubHeader}>SESI HARI INI</Text>
          <Text style={styles.scheduleTitle}>
            <Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi
          </Text>
          <View style={styles.scheduleDetails}>
            <View><Text style={styles.scheduleLabel}>Waktu</Text><Text style={styles.scheduleValue}>06.30 - 09.30</Text></View>
            <View><Text style={styles.scheduleLabel}>Guru</Text><Text style={styles.scheduleValue}>Ahmad Pambudi, S.Pd.</Text></View>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Image source={LOGO_SOURCE} style={[styles.actionIcon, { tintColor: '#81C784' }]} resizeMode="contain" />
            </View>
            <Text style={styles.actionText}>Pesan Sesi</Text>
          </TouchableOpacity>
          
          {/* TOMBOL MATERI MENGAKTIFKAN MODAL */}
          <TouchableOpacity style={styles.actionItem} onPress={() => setIsMateriVisible(true)}>
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F7FA' }]}>
              <Image source={LOGO_SOURCE} style={[styles.actionIcon, { tintColor: '#4DD0E1' }]} resizeMode="contain" />
            </View>
            <Text style={styles.actionText}>Materi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Image source={LOGO_SOURCE} style={[styles.actionIcon, { tintColor: '#81C784' }]} resizeMode="contain" />
            </View>
            <Text style={styles.actionText}>Jadwal Saya</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* SECTION: PESAN LAGI */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>PESAN LAGI</Text>
          <View style={styles.pesanLagiCard}>
            <View style={styles.pesanLagiContent}>
              <Text style={styles.pesanLagiSubtitle}>Lanjutkan sesi favoritmu</Text>
              <Text style={styles.pesanLagiTitle}>
                <Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi
              </Text>
              <TouchableOpacity style={styles.pesanSesiBtn}>
                <Text style={styles.pesanSesiBtnText}>Pesan Sesi →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pesanLagiGraphic}><Text style={styles.mathSymbols}>+ ={"\n"}- x</Text></View>
          </View>
        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#2A3563' }]} resizeMode="contain" /><Text style={[styles.navText, { color: '#2A3563', fontWeight: 'bold' }]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Activity</Text></TouchableOpacity>
        <View style={styles.fabContainer}>
          <View style={styles.fabCutout}>
            <TouchableOpacity style={styles.fabButton}><Image source={LOGO_SOURCE} style={styles.fabIcon} resizeMode="contain" /></TouchableOpacity>
          </View>
          <Text style={styles.fabText}>Pesan{"\n"}Sesi</Text>
        </View>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Chat</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
      </View>

      {/* ========================================== */}
      {/* MODAL BOTTOM SHEET MATERI */}
      {/* ========================================== */}
      <Modal visible={isMateriVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          {/* Area transparan di atas untuk menutup modal jika di-klik */}
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMateriVisible(false)} />
          
          {/* Kontainer Putih Bottom Sheet */}
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHandle} />
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Bagian Pelajaran Favorit */}
              <Text style={styles.sheetSectionTitle}>Pelajaran Favorit</Text>
              <View style={styles.subjectGrid}>
                {favoriteSubjects.map(renderSubjectItem)}
              </View>

              <View style={styles.sheetDivider} />

              {/* Bagian Semua Pelajaran */}
              <Text style={styles.sheetSectionTitle}>Semua Pelajaran</Text>
              <View style={styles.subjectGrid}>
                {allSubjects.map(renderSubjectItem)}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  headerBackground: { position: 'absolute', width: '100%', height: 280, backgroundColor: '#2A3563', borderBottomRightRadius: 80, borderBottomLeftRadius: 20, overflow: 'hidden' },
  headerWatermark: { position: 'absolute', right: -40, top: 20, width: 250, height: 250, tintColor: '#FFFFFF', opacity: 0.05 },
  homeGreetingContainer: { marginTop: 70, paddingHorizontal: 30 },
  homeGreetingText: { fontSize: 26, fontWeight: 'bold', color: '#FFF', lineHeight: 34, textTransform: 'capitalize' },
  scheduleCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 35, borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 5 },
  scheduleSubHeader: { fontSize: 10, color: '#A9A9A9', fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  scheduleTitle: { fontSize: 16, color: '#333', marginBottom: 15 },
  scheduleDetails: { flexDirection: 'row', justifyContent: 'flex-start', gap: 40 },
  scheduleLabel: { fontSize: 11, color: '#A9A9A9', marginBottom: 3 },
  scheduleValue: { fontSize: 13, color: '#333', fontWeight: '600' },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, paddingHorizontal: 40 },
  actionItem: { alignItems: 'center' },
  actionIconBox: { width: 65, height: 65, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIcon: { width: 35, height: 35 },
  actionText: { fontSize: 12, color: '#333', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginHorizontal: 20, marginTop: 25, marginBottom: 25 },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 12, color: '#888', fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
  pesanLagiCard: { backgroundColor: '#4A81D4', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  pesanLagiContent: { flex: 1 },
  pesanLagiSubtitle: { color: '#D0E1F9', fontSize: 12, marginBottom: 5 },
  pesanLagiTitle: { color: '#FFF', fontSize: 14, marginBottom: 15 },
  pesanSesiBtn: { backgroundColor: '#8DB3E2', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignSelf: 'flex-start' },
  pesanSesiBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  pesanLagiGraphic: { position: 'absolute', right: -10, bottom: -10 },
  mathSymbols: { fontSize: 45, fontWeight: 'bold', color: 'rgba(255,255,255,0.15)', lineHeight: 45 },
  
  // --- BOTTOM NAV ---
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 15 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 10 },
  navIcon: { width: 22, height: 22, tintColor: '#A9A9A9', marginBottom: 5 },
  navText: { fontSize: 10, color: '#A9A9A9' },
  fabContainer: { alignItems: 'center', justifyContent: 'flex-start', width: 70, height: 90, top: -25 },
  fabCutout: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  fabButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#2A3563', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#2A3563', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5 },
  fabIcon: { width: 28, height: 28, tintColor: '#FFF' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center', marginTop: 2 },

  // --- MODAL BOTTOM SHEET MATERI ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  bottomSheetContainer: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 15,
    maxHeight: '85%' 
  },
  sheetHandle: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  sheetDivider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  subjectItemContainer: { width: '25%', alignItems: 'center', marginBottom: 20 }, 
  
  subjectIconBox: { 
    width: 60, height: 60, borderRadius: 15, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 8, 
    elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, 
    shadowOpacity: 0.1, shadowRadius: 3, backgroundColor: 'transparent' // Background transparan karena icon kamu sudah kotak berwarna
  },
  subjectIconImage: { width: 55, height: 55, borderRadius: 12 }, 
  subjectItemText: { fontSize: 11, color: '#333', fontWeight: '500', textAlign: 'center' }
});

export default HomePage;