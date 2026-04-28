import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  StatusBar, ScrollView, Dimensions, Modal 
} from 'react-native';

import CustomAlert from '../components/CustomAlert'; // <--- IMPORT ALERT

const { width } = Dimensions.get('window');
const LOGO_SOURCE = require('../assets/logo_humana.png'); 

const HomePage = ({ namaLengkap, email, onLogout, onSelectSubject, onNavigate, showSuccessAlert, onAlertClose }) => {
  const firstName = namaLengkap ? namaLengkap.split(' ')[0] : 'Murid';
  const [isMateriVisible, setIsMateriVisible] = useState(false);

  // STATE UNTUK MENGONTROL ALERT
  const [alertConfig, setAlertConfig] = useState({
    visible: false, type: 'success', title: '', message: ''
  });

  // MUNCULKAN ALERT JIKA TERDETEKSI LOGIN BARU
  useEffect(() => {
    if (showSuccessAlert) {
      setAlertConfig({
        visible: true,
        type: 'success',
        title: 'Sukses!',
        message: 'Berhasil masuk ke akun kamu.'
      });
    }
  }, [showSuccessAlert]);

  const handleCloseAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (onAlertClose) onAlertClose(); // Matikan sinyal dari App.jsx
  };

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

  const renderSubjectItem = (subject) => (
    <TouchableOpacity 
      key={subject.id} 
      style={styles.subjectItemContainer}
      onPress={() => {
        setIsMateriVisible(false); 
        if (onSelectSubject) onSelectSubject(subject.id); 
      }}
    >
      <View style={styles.subjectIconBox}>
        <Image source={subject.icon} style={styles.subjectIconImage} resizeMode="contain" />
      </View>
      <Text style={styles.subjectItemText}>{subject.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.homeContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        
        <View style={styles.headerBackground}>
          <Image source={LOGO_SOURCE} style={styles.headerWatermark} resizeMode="contain" />
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.homeGreetingText}>
            Selamat datang,{"\n"}{firstName} !
          </Text>
        </View>

        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleSubHeader}>SESI HARI INI</Text>
          <Text style={styles.scheduleTitle}>
            <Text style={{fontWeight: 'bold'}}>Matematika</Text> - Relasi & Fungsi
          </Text>
          <View style={styles.scheduleDetails}>
            <View>
              <Text style={styles.scheduleLabel}>Waktu</Text>
              <Text style={styles.scheduleValue}>06.30 - 09.30</Text>
            </View>
            <View>
              <Text style={styles.scheduleLabel}>Guru</Text>
              <Text style={styles.scheduleValue}>Ahmad Pambudi, S.Pd.</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconBox}>
              <Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" />
            </View>
            <Text style={styles.actionText}>Pesan Sesi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => setIsMateriVisible(true)}>
            <View style={styles.actionIconBox}>
              <Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" />
            </View>
            <Text style={styles.actionText}>Materi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate && onNavigate('Activity', 'aktif')}>
            <View style={styles.actionIconBox}>
              <Image source={LOGO_SOURCE} style={styles.actionIcon} resizeMode="contain" />
            </View>
            <Text style={styles.actionText}>Jadwal Saya</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

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
            <View style={styles.pesanLagiGraphic}>
              <Text style={styles.mathSymbols}>+ ={"\n"}- x</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>REKOMENDASI MATERI</Text>
            <TouchableOpacity>
              <Text style={styles.lihatSemuaText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rekomendasiCard}>
            <View style={styles.rekomendasiIconWrapper}>
              <Image source={LOGO_SOURCE} style={styles.rekomendasiIcon} resizeMode="contain" />
            </View>
            <View style={styles.rekomendasiTextContainer}>
              <Text style={styles.rekomendasiCardTitle}>Aljabar Linear</Text>
              <Text style={styles.rekomendasiCardSubtitle}>Sekolah Menengah Atas</Text>
            </View>
            <TouchableOpacity style={styles.lihatMateriBtn}>
              <Text style={styles.lihatMateriBtnText}>Lihat Materi</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Image source={LOGO_SOURCE} style={[styles.navIcon, { tintColor: '#284B7A' }]} resizeMode="contain" />
          <Text style={[styles.navText, { color: '#284B7A', fontWeight: 'bold' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate && onNavigate('Activity', 'aktif')}>
          <Image source={LOGO_SOURCE} style={styles.navIcon} resizeMode="contain" />
          <Text style={styles.navText}>Activity</Text>
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

      {/* CUSTOM ALERT DIPANGGIL DI SINI UNTUK LOGIN SUKSES */}
      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleCloseAlert}
      />

      <Modal visible={isMateriVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMateriVisible(false)} />
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetSectionTitle}>Pelajaran Favorit</Text>
              <View style={styles.subjectGrid}>
                {favoriteSubjects.map(renderSubjectItem)}
              </View>
              <View style={styles.sheetDivider} />
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
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 310, backgroundColor: '#284B7A', borderBottomRightRadius: 100, borderBottomLeftRadius: 15, overflow: 'hidden' },
  headerWatermark: { position: 'absolute', right: -30, top: 10, width: 280, height: 280, tintColor: '#FFFFFF', opacity: 0.05 },
  greetingContainer: { marginTop: 80, paddingHorizontal: 25 },
  homeGreetingText: { fontSize: 34, fontWeight: 'bold', color: '#FFF', lineHeight: 42, textTransform: 'capitalize' },
  scheduleCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 45, borderRadius: 20, padding: 22, elevation: 6, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.12, shadowRadius: 8 },
  scheduleSubHeader: { fontSize: 10, color: '#A9A9A9', fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  scheduleTitle: { fontSize: 17, color: '#333', marginBottom: 18 },
  scheduleDetails: { flexDirection: 'row', justifyContent: 'flex-start', gap: 40 },
  scheduleLabel: { fontSize: 11, color: '#A9A9A9', marginBottom: 4 },
  scheduleValue: { fontSize: 13, color: '#333', fontWeight: '700' },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 35, paddingHorizontal: 40 },
  actionItem: { alignItems: 'center' },
  actionIconBox: { width: 68, height: 68, backgroundColor: '#E8F5E9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionIcon: { width: 35, height: 35, tintColor: '#81C784' },
  actionText: { fontSize: 12, color: '#333', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginHorizontal: 20, marginTop: 30, marginBottom: 25 },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 12, color: '#888', fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
  pesanLagiCard: { backgroundColor: '#4A81D4', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  pesanLagiContent: { flex: 1 },
  pesanLagiSubtitle: { color: '#D0E1F9', fontSize: 12, marginBottom: 5 },
  pesanLagiTitle: { color: '#FFF', fontSize: 15, marginBottom: 15 },
  pesanSesiBtn: { backgroundColor: '#8DB3E2', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignSelf: 'flex-start' },
  pesanSesiBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  pesanLagiGraphic: { position: 'absolute', right: -10, bottom: -10 },
  mathSymbols: { fontSize: 45, fontWeight: 'bold', color: 'rgba(255,255,255,0.15)', lineHeight: 45 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  lihatSemuaText: { fontSize: 12, color: '#4A81D4', fontWeight: 'bold' },
  rekomendasiCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#F5F5F5', elevation: 1, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 3 },
  rekomendasiIconWrapper: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rekomendasiIcon: { width: 35, height: 35, tintColor: '#333' },
  rekomendasiTextContainer: { flex: 1 },
  rekomendasiCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  rekomendasiCardSubtitle: { fontSize: 12, color: '#888' },
  lihatMateriBtn: { backgroundColor: '#E0E7FF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10 },
  lihatMateriBtnText: { color: '#284B7A', fontSize: 11, fontWeight: 'bold' },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 80, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 15 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 10 },
  navIcon: { width: 22, height: 22, tintColor: '#A9A9A9', marginBottom: 5 },
  navText: { fontSize: 10, color: '#A9A9A9' },
  fabContainer: { alignItems: 'center', justifyContent: 'flex-start', width: 70, height: 90, top: -25 },
  fabCutout: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  fabButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#284B7A', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5 },
  fabIcon: { width: 28, height: 28, tintColor: '#FFF' },
  fabText: { fontSize: 10, color: '#A9A9A9', textAlign: 'center', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  bottomSheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 15, maxHeight: '85%' },
  sheetHandle: { width: 50, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  sheetDivider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  subjectItemContainer: { width: '25%', alignItems: 'center', marginBottom: 20 }, 
  subjectIconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 3, backgroundColor: 'transparent' },
  subjectIconImage: { width: 55, height: 55, borderRadius: 12 }, 
  subjectItemText: { fontSize: 11, color: '#333', fontWeight: '500', textAlign: 'center' }
});

export default HomePage;