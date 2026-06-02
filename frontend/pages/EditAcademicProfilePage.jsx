import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
    StatusBar, ScrollView, TextInput, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIconSvg from '../components/BackIconSvg';
// Import API dari file service kamu
import { updateAcademicProfile } from '../services/editProfileService';

const InputField = ({ label, value, onChangeText }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#A9A9A9"
        />
    </View>
);

const EditAcademicProfilePage = ({ profileData, onSave, onCancel }) => {
    const [education, setEducation] = useState(profileData.education);
    const [major, setMajor] = useState(profileData.major);

    // State untuk animasi loading
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                email: profileData.email,
                major: major // Mengirim teks, misal: "12 - IPA"
            };

            const result = await updateAcademicProfile(payload);

            if (result.success === true || result.status === 200) {

                // 💡 HITUNG JENJANG BARU SECARA OTOMATIS BERDASARKAN INPUT USER
                let angkaKelas = 0;
                if (major && major.includes('-')) {
                    angkaKelas = parseInt(major.split('-')[0].trim(), 10);
                } else if (major) {
                    angkaKelas = parseInt(major.trim(), 10);
                }

                let jenjangBaru = "-";
                if (angkaKelas >= 1 && angkaKelas <= 6) {
                    jenjangBaru = "SD";
                } else if (angkaKelas >= 7 && angkaKelas <= 9) {
                    jenjangBaru = "SMP";
                } else if (angkaKelas >= 10 && angkaKelas <= 12) {
                    jenjangBaru = "SMA";
                }

                // Kembalikan data yang sudah diperbarui ke App.jsx
                const updatedFields = {
                    ...profileData,
                    education: jenjangBaru,
                    jenjang_pendidikan: jenjangBaru,
                    major: major,
                    kelas_jurusan: major
                };

                try {
                    const savedSession = await AsyncStorage.getItem('user_session');
                    if (savedSession) {
                        const parsed = JSON.parse(savedSession);
                        parsed.userData = { ...parsed.userData, ...updatedFields };
                        await AsyncStorage.setItem('user_session', JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.log('Gagal memperbarui simpanan profil akademik di local storage:', e);
                }
                onSave(updatedFields);

            } else {
                Alert.alert("Gagal Menyimpan", result.message || "Pastikan data sudah benar.");
            }
        } catch (error) {
            console.log("Error Update Academic Profile:", error);
            Alert.alert("Error Jaringan", "Gagal terhubung ke server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
                    <BackIconSvg size={10} color="#000000" />
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Academic Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <InputField label="Jenjang Pendidikan" value={education} onChangeText={setEducation} />
                <InputField label="Kelas - Jurusan" value={major} onChangeText={setMajor} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isLoading}>
                    <Text style={styles.cancelBtnText}>Batalkan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Konfirmasi Perubahan</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 35, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backBtn: {
        flexDirection: 'row',    // Membuat ikon dan teks berjejer ke samping
        alignItems: 'center',    // Membuat ikon dan teks lurus sejajar secara vertikal
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    backText: {
        fontSize: 15,            // Ukuran teks 'Kembali'
        color: '#000000',        // Warna teks hitam disamakan dengan ikon
        marginLeft: 6,           // Memberikan jarak antara ikon panah dan teks
        fontFamily: 'SF-Pro-Display-Bold',       // Membuat teks sedikit lebih tegas (opsional)
    },
    backIcon: { fontSize: 20, color: '#000', fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

    content: { padding: 20 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, height: 50, paddingHorizontal: 15, fontSize: 14, color: '#000', fontWeight: '600' },

    footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFF' },
    cancelBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cancelBtnText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
    saveBtn: { flex: 1.2, height: 50, borderRadius: 25, backgroundColor: '#387C65', justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});

export default EditAcademicProfilePage;