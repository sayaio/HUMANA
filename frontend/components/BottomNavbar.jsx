import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Home, Calendar, MessageSquare, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const LOGO_SOURCE = require('../assets/logo_humana.png');

const BottomNavbar = ({ currentScreen, onNavigate, userRole }) => {
    const role = userRole ? userRole.toLowerCase() : 'murid';

    return (
        <View style={styles.container}>
            {/* BERANDA / HOME */}
            <TouchableOpacity 
                style={styles.navBarItem} 
                onPress={() => onNavigate && onNavigate('Home')}
            >
                <Home color={currentScreen === 'Home' ? '#284B7A' : '#A9A9A9'} size={22} />
                <Text style={[styles.navBarLabel, currentScreen === 'Home' && styles.activeLabel]}>
                    {role === 'guru' ? 'Home' : 'Beranda'}
                </Text>
            </TouchableOpacity>

            {/* AKTIVITAS / ACTIVITY */}
            <TouchableOpacity 
                style={styles.navBarItem} 
                onPress={() => onNavigate && onNavigate('Activity', 'aktif')}
            >
                <Calendar color={currentScreen === 'Activity' ? '#284B7A' : '#A9A9A9'} size={22} />
                <Text style={[styles.navBarLabel, currentScreen === 'Activity' && styles.activeLabel]}>
                    {role === 'guru' ? 'Activity' : 'Aktivitas'}
                </Text>
            </TouchableOpacity>

            {/* PLACEHOLDER (Biar space kosong di tengah pas untuk FAB melayang) */}
            <View style={styles.navBarItem} pointerEvents="none">
                <View style={{ height: 22 }} />
                <Text style={[styles.navBarLabel, { color: '#284B7A', fontWeight: '600', fontSize: 9 }]}>
                    {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
                </Text>
            </View>

            {/* CHAT */}
            <TouchableOpacity 
                style={styles.navBarItem} 
                onPress={() => onNavigate && onNavigate('Chat')}
            >
                <MessageSquare color={currentScreen === 'Chat' ? '#284B7A' : '#A9A9A9'} size={22} />
                <Text style={[styles.navBarLabel, currentScreen === 'Chat' && styles.activeLabel]}>
                    Chat
                </Text>
            </TouchableOpacity>

            {/* PROFILE */}
            <TouchableOpacity 
                style={styles.navBarItem} 
                onPress={() => onNavigate && onNavigate('Profile')}
            >
                <User color={currentScreen === 'Profile' ? '#284B7A' : '#A9A9A9'} size={22} />
                <Text style={[styles.navBarLabel, currentScreen === 'Profile' && styles.activeLabel]}>
                    Profile
                </Text>
            </TouchableOpacity>

            {/* REAL ABSOLUTE FAB BUTTON (Melayang kokoh di tengah tanpa merusak layout) */}
            <TouchableOpacity 
                style={styles.centerFabAbsolute}
                onPress={() => onNavigate && onNavigate('PesanSesi')}
                activeOpacity={0.8}
            >
                <Image source={LOGO_SOURCE} style={styles.centerFabLogoIcon} resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        height: 85, 
        backgroundColor: '#FFF', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderTopWidth: 1, 
        borderColor: '#EEF0F2', 
        zIndex: 1000,
        paddingBottom: 12, // Aman untuk gesture navigation bar Android/iOS
    },
    navBarItem: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        flex: 1,
        height: '100%'
    },
    navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
    activeLabel: { color: '#284B7A', fontWeight: 'bold' },
    
    centerFabAbsolute: { 
        position: 'absolute',
        left: width / 2 - 27, // Pas di tengah layar secara horizontal (lebar button 54 / 2)
        top: -18, // Konsisten melayang keluar dari navbar
        width: 54, 
        height: 54, 
        borderRadius: 27, 
        backgroundColor: '#284B7A', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 5, 
        shadowColor: '#284B7A', 
        shadowOffset: { width: 0, height: 3 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4 
    },
    centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
});

export default BottomNavbar;