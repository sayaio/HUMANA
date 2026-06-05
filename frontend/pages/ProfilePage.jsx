import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { fetchMuridProfile } from '../services/feedbackService';
import BottomNavbar from '../components/BottomNavbar';
import { Calendar, MessageSquare, User, Home, LogOut, Edit2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const LOGO_SOURCE = require('../assets/logo_humana.png');

const mapMuridProfileToApp = (data, existing) => ({
  id: data.id ?? data.id_murid ?? existing?.id,
  role: (data.role || existing?.role || 'murid').toLowerCase(),
  name: data.name || data.nama || existing?.name || '-',
  email: data.email || existing?.email || '-',
  username: data.username || existing?.username || '-',
  phone: data.no_telepon || existing?.phone || '-',
  no_telepon: data.no_telepon || existing?.no_telepon || '-',
  gender: data.jenis_kelamin || existing?.gender || '-',
  jenis_kelamin: data.jenis_kelamin || existing?.jenis_kelamin || '-',
  domicile: data.alamat || existing?.domicile || '-',
  domisili: data.alamat || existing?.domisili || '-',
  alamat: data.alamat || existing?.alamat || '-',
  education: data.jenjang_pendidikan || existing?.education || '-',
  jenjang_pendidikan: data.jenjang_pendidikan || existing?.jenjang_pendidikan || '-',
  major: data.kelas_jurusan || existing?.major || '-',
  kelas_jurusan: data.kelas_jurusan || existing?.kelas_jurusan || '-',
  is_active: existing?.is_active ?? false,
});

const ProfilePage = ({ profileData, onNavigate, onLogout, onRefreshData }) => {
  const role = profileData && profileData.role ? profileData.role.toLowerCase() : 'murid';
  const idMurid = profileData?.id;
  const [refreshing, setRefreshing] = useState(false);

  const loadLatestProfileData = useCallback(async () => {
    if (!idMurid) return;
    const response = await fetchMuridProfile(idMurid);
    if (response?.success && response.data && onRefreshData) {
      onRefreshData(mapMuridProfileToApp(response.data, profileData));
    }
  }, [idMurid, onRefreshData, profileData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLatestProfileData();
    setRefreshing(false);
  };

  const DataRow = ({ label, value }) => (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );

  const initialLetter =
    profileData.name && profileData.name !== '-'
      ? profileData.name.charAt(0).toUpperCase()
      : 'U';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

      {/* HEADER — tanpa tombol Settings */}
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#284B7A']} tintColor="#284B7A" />
        }
      >
        {/* USER CARD */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => alert('Fitur ganti foto akan datang!')}
            >
              <Text style={{ fontSize: 11, color: '#FFF' }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{profileData.name}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{profileData.email}</Text>
          </View>
          <Image source={LOGO_SOURCE} style={styles.cardWatermark} resizeMode="contain" />
        </View>

        {/* SECTION BASIC */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Data Pribadi</Text>
            <TouchableOpacity style={styles.editSectionBtn} onPress={() => onNavigate('EditBasicProfile')} activeOpacity={0.7}>
              <Edit2 size={14} color="#284B7A" />
              <Text style={styles.editSectionBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBox}>
            <DataRow label="Username" value={profileData.username || '-'} />
            <View style={styles.divider} />
            <DataRow label="No. Telepon" value={profileData.no_telepon || '-'} />
            <View style={styles.divider} />
            <DataRow label="Jenis Kelamin" value={profileData.jenis_kelamin || '-'} />
            <View style={styles.divider} />
            <DataRow label="Domisili" value={profileData.alamat || '-'} />
          </View>
        </View>

        {/* SECTION ACADEMIC */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Data Akademik</Text>
            <TouchableOpacity style={styles.editSectionBtn} onPress={() => onNavigate('EditAcademicProfile')} activeOpacity={0.7}>
              <Edit2 size={14} color="#284B7A" />
              <Text style={styles.editSectionBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardBox}>
            <DataRow label="Jenjang Pendidikan" value={profileData.jenjang_pendidikan || '-'} />
            <View style={styles.divider} />
            <DataRow label="Kelas - Jurusan" value={profileData.kelas_jurusan || '-'} />
          </View>
        </View>

        {/* TOMBOL LOGOUT */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.6}>
            <LogOut color="#FF4D4D" size={20} style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavbar currentScreen="Profile" onNavigate={onNavigate} userRole={profileData?.role} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    // SOLUSI RESPONSIF: Menghitung padding atas berdasarkan platform OS & tinggi StatusBar asli
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 20
        : 15,
    paddingBottom: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
  },

  userCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    marginHorizontal: width * 0.05,
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden',
  },
  avatarContainer: { position: 'relative', marginRight: 15 },
  avatarCircle: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: (width * 0.16) / 2,
    backgroundColor: '#A1AFC3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: width * 0.08, color: '#FFF', fontWeight: 'bold' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7B61FF',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8F9FC',
  },
  userInfo: { flex: 1, zIndex: 1, paddingRight: 10 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 2, textTransform: 'capitalize' },
  userEmail: { fontSize: 12, color: '#666' },
  cardWatermark: {
    position: 'absolute',
    right: -15,
    top: 10,
    width: width * 0.25,
    height: width * 0.25,
    tintColor: '#E0E5EC',
    opacity: 0.4,
    zIndex: 0,
  },

  sectionContainer: { paddingHorizontal: width * 0.05, marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#000' },
  editSectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#284B7A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  editSectionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#284B7A', marginLeft: 4 },

  cardBox: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: width * 0.045,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  dataRow: { marginBottom: 4, marginTop: 4 },
  dataLabel: { fontSize: 11, color: '#888', marginBottom: 3, fontWeight: '600' },
  dataValue: { fontSize: 15, color: '#000', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#FFAAAA',
    borderRadius: 19,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  logoutIcon: { marginRight: 10 },
  logoutText: { fontSize: 15, color: '#FF8A8A', fontWeight: 'bold' },
});

export default ProfilePage;
