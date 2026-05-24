import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Home, Calendar, MessageSquare, User } from 'lucide-react-native';

const LOGO_SOURCE = require('../assets/logo_humana.png');

const BottomNavbar = ({ currentScreen, onNavigate, userRole }) => {
    const role = userRole ? userRole.toLowerCase() : 'murid';

    return (
        <View style={styles.customBottomNavbar}>
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

            {/* CENTER FAB */}
            <TouchableOpacity 
                style={styles.centerFabContainer}
                onPress={() => onNavigate && onNavigate('PesanSesi')}
            >
                <View style={styles.centerFabButton}>
                    <Image source={LOGO_SOURCE} style={styles.centerFabLogoIcon} resizeMode="contain" />
                </View>
                <Text style={styles.centerFabLabelText}>
                    {role === 'guru' ? 'Permintaan' : 'Pesan Sesi'}
                </Text>
            </TouchableOpacity>

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
        </View>
    );
};

const styles = StyleSheet.create({
    customBottomNavbar: { 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        height: 75, 
        backgroundColor: '#FFF', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderTopWidth: 1, 
        borderColor: '#EEF0F2', 
        paddingHorizontal: 10,
        zIndex: 1000
    },
    navBarItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    navBarLabel: { fontSize: 10, color: '#A9A9A9', marginTop: 4 },
    activeLabel: { color: '#284B7A', fontWeight: 'bold' },
    
    centerFabContainer: { alignItems: 'center', width: 75, height: 80, top: -16 },
    centerFabButton: { 
        width: 52, 
        height: 52, 
        borderRadius: 26, 
        backgroundColor: '#284B7A', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 4, 
        shadowColor: '#284B7A', 
        shadowOffset: { width: 0, height: 3 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4 
    },
    centerFabLogoIcon: { width: 24, height: 24, tintColor: '#FFF' },
    centerFabLabelText: { fontSize: 9, color: '#284B7A', textAlign: 'center', marginTop: 4, fontWeight: '600' },
});

export default BottomNavbar;