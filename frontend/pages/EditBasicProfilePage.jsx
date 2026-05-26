import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
    StatusBar, ScrollView, TextInput, ActivityIndicator, Alert
} from 'react-native';
import BackIconSvg from '../components/BackIconSvg';
// Import API dari file service kamu
import { updateBasicProfile } from '../services/editProfileService';

const EditBasicProfilePage = ({ profileData, onSave, onCancel }) => {
    const [username, setUsername] = useState(profileData.username || '');
    const [phone, setPhone] = useState(profileData.no_telepon || profileData.phone || '');
    const [gender, setGender] = useState(profileData.jenis_kelamin || profileData.gender || '');
    const [domicile, setDomicile] = useState(profileData.alamat || profileData.domisili || profileData.domicile || '');

    // State untuk animasi loading
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Menyiapkan payload untuk dikirim ke backend
            // (Menyertakan field ganda agar lebih fleksibel dengan nama kolom di database kamu)
            const payload = {
                id: profileData.id,
                id_user: profileData.id,
                email: profileData.email,
                username: username,
                phone: phone,
                no_telepon: phone,
                gender: gender,
                jenis_kelamin: gender,
                domicile: domicile,
                domisili: domicile
            };

            const result = await updateBasicProfile(payload);

            // Mengecek apakah respons sukses
            if (result.success === true || result.status === 200) {
                // Jika berhasil, perbarui data di App.jsx dan kembali ke Profile
                onSave({
                    ...profileData,
                    username,
                    phone,
                    no_telepon: phone,
                    gender,
                    jenis_kelamin: gender,
                    domicile,
                    alamat: domicile,
                    domisili: domicile
                });
            } else {
                Alert.alert("Gagal Menyimpan", result.message || "Pastikan data sudah benar.");
            }
        } catch (error) {
            console.log("Error Update Basic Profile:", error);
            Alert.alert("Error Jaringan", "Gagal terhubung ke server. Periksa koneksi internetmu.");
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

            <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
                    <BackIconSvg size={10} color="#000000" />
                    <Text style={styles.backText}>Kembali</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Basic Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <InputField label="Username" value={username} onChangeText={setUsername} />
                <InputField label="No. Telepon" value={phone} onChangeText={setPhone} />
                <InputField label="Jenis Kelamin" value={gender} onChangeText={setGender} />
                <InputField label="Domisili" value={domicile} onChangeText={setDomicile} />
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

export default EditBasicProfilePage;