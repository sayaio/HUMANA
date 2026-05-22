import React from 'react';
import {
    StyleSheet, Text, View, Image, TouchableOpacity,
    StatusBar, ScrollView, SafeAreaView
} from 'react-native';

// Import Ikon Lucide agar seragam dengan HomePage
import { Calendar, MessageSquare, User, Home } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const ProfilePage = ({ profileData, onNavigate }) => {
    const role = profileData && profileData.role ? profileData.role.toLowerCase() : 'murid';

    const DataRow = ({ label, value }) => (
        <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{label}</Text>
            <Text style={styles.dataValue}>{value}</Text>
        </View>
    );

    const initialLetter = (profileData.name && profileData.name !== '-')
        ? profileData.name.charAt(0).toUpperCase()
        : 'U';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity>
                    <Text style={{ fontSize: 24, color: '#333' }}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{initialLetter}</Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={() => alert('Fitur ganti foto akan datang!')}>
                            <Text style={{ fontSize: 12, color: '#FFF' }}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{profileData.name}</Text>
                        <Text style={styles.userEmail}>{profileData.email}</Text>
                    </View>
                    <Image source={LOGO_SOURCE} style={styles.cardWatermark} resizeMode="contain" />
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Basic</Text>
                        <TouchableOpacity onPress={() => onNavigate('EditBasicProfile')}>
                            <Text style={styles.editIcon}>📝</Text>
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

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Academic</Text>
                        <TouchableOpacity onPress={() => onNavigate('EditAcademicProfile')}>
                            <Text style={styles.editIcon}>📝</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cardBox}>
                        <DataRow label="Jenjang Pendidikan" value={profileData.jenjang_pendidikan || '-'} />
                        <View style={styles.divider} />
                        <DataRow label="Kelas - Jurusan" value={profileData.kelas_jurusan || '-'} />
                    </View>
                </View>

            </ScrollView>

            {/* SAMAKAN BOTTOM NAVBAR DENGAN HOMEPAGE */}
            <View style={styles.customBottomNavbar}>
                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Home')}>
                    <Home color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>{role === 'guru' ? 'Home' : 'Beranda'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Activity', 'aktif')}>
                    <Calendar color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>{role === 'guru' ? 'Activity' : 'Aktivitas'}</Text>
                </TouchableOpacity>

                <View style={styles.centerFabContainer}>
                    <TouchableOpacity 
                        style={styles.centerFabButton}
                        onPress={() => {
                            if (onNavigate) {
                                onNavigate(role === 'guru' ? 'Activity' : 'PesanSesi');
                            }
                        }}
                    >
                        <Image source={LOGO_SOURCE} style={styles.centerFabLogoIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <Text style={styles.centerFabLabelText}>
                        {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.navBarItem} onPress={() => onNavigate && onNavigate('Chat')}>
                    <MessageSquare color="#A9A9A9" size={22} />
                    <Text style={styles.navBarLabel}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navBarItem}>
                    <User color="#284B7A" size={22} />
                    <Text style={[styles.navBarLabel, { color: '#284B7A', fontWeight: 'bold' }]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },

    userCard: { flexDirection: 'row', backgroundColor: '#F8F9FC', marginHorizontal: 20, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
    avatarContainer: { position: 'relative', marginRight: 15 },
    avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#A1AFC3', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 34, color: '#FFF', fontWeight: 'bold' },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7B61FF', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F8F9FC' },
    userInfo: { flex: 1, zIndex: 1 },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 2, textTransform: 'capitalize' },
    userEmail: { fontSize: 12, color: '#666' },
    cardWatermark: { position: 'absolute', right: -20, top: 10, width: 100, height: 100, tintColor: '#E0E5EC', opacity: 0.5, zIndex: 0 },

    sectionContainer: { paddingHorizontal: 20, marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    editIcon: { fontSize: 18 },

    cardBox: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    dataRow: { marginBottom: 10, marginTop: 5 },
    dataLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '600' },
    dataValue: { fontSize: 15, color: '#000', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },

    // STYLE SINKRONISASI HOMEPAGE NAVBAR
    customBottomNavbar: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEF0F2', paddingHorizontal: 10 },
    navBarItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
    centerFabContainer: { alignItems: 'center', width: 75, height: 80, top: -16 },
    centerFabButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#284B7A', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#284B7A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4 },
    centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
    centerFabLabelText: { fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4, fontWeight: '600' },
});

export default ProfilePage;