import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    StatusBar, ScrollView, TextInput, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from '../components/PageHeader';
import { useAppAlert } from '../components/AppAlertProvider';
// Import API dari file service kamu
import { updateBasicProfile } from '../services/editProfileService';

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

const RadioField = ({ label, options, selectedValue, onSelect }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.radioGroup}>
            {options.map((option) => (
                <TouchableOpacity 
                    key={option} 
                    style={styles.radioOption} 
                    onPress={() => onSelect(option)}
                    activeOpacity={0.7}
                >
                    <View style={styles.radioOuterCircle}>
                        {selectedValue === option && <View style={styles.radioInnerCircle} />}
                    </View>
                    <Text style={styles.radioText}>{option}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const EditBasicProfilePage = ({ profileData, onSave, onCancel }) => {
    const { showInfo } = useAppAlert();
    const [name, setName] = useState(profileData.name || profileData.nama || '');
    const [username, setUsername] = useState(profileData.username || '');
    const [phone, setPhone] = useState(profileData.no_telepon || profileData.phone || '');
    const [gender, setGender] = useState(profileData.jenis_kelamin || profileData.gender || '');
    const [domicile, setDomicile] = useState(profileData.alamat || profileData.domisili || profileData.domicile || '');

    // State untuk animasi loading
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {

        if (!name.trim() || !username.trim()) {
            showInfo('Data Kosong', 'Nama lengkap dan Username tidak boleh kosong.');
            return;
        }

        const nameRegex = /^[A-Za-z\s.,]{5,}$/;
        if (!nameRegex.test(name.trim())) {
            showInfo('Format Salah', 'Nama lengkap minimal 5 karakter dan tidak boleh mengandung karakter acak (hanya huruf, titik, koma).');
            return;
        }

        if (username.trim().length < 5) {
            showInfo('Format Salah', 'Username minimal 5 karakter.');
            return;
        }

        const phoneRegex = /^08[0-9]{9,}$/;
        if (!phoneRegex.test(phone.trim())) {
            showInfo(
                'Format Salah',
                'Nomor telepon harus diawali dengan 08, minimal 11 angka, dan tanpa huruf.',
            );
            return;
        }

        if (domicile.trim()) {
            const domisiliRegex = /^[A-Za-z0-9\s.,-]+$/;
            if (!domisiliRegex.test(domicile.trim())) {
                showInfo('Format Salah', 'Domisili tidak boleh mengandung karakter acak (hanya huruf, angka, spasi, titik, koma).');
                return;
            }
        }

        setIsLoading(true);
        try {
            // Menyiapkan payload untuk dikirim ke backend
            // (Menyertakan field ganda agar lebih fleksibel dengan nama kolom di database kamu)
            const payload = {
                id: profileData.id,
                id_user: profileData.id,
                email: profileData.email,
                role: profileData.role,
                name: name,
                nama: name,
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
                const updatedFields = {
                    ...profileData,
                    name,
                    nama: name,
                    username,
                    phone,
                    no_telepon: phone,
                    gender,
                    jenis_kelamin: gender,
                    domicile,
                    alamat: domicile,
                    domisili: domicile
                };

                try {
                    const savedSession = await AsyncStorage.getItem('user_session');
                    if (savedSession) {
                        const parsed = JSON.parse(savedSession);
                        parsed.userData = { ...parsed.userData, ...updatedFields };
                        await AsyncStorage.setItem('user_session', JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.log('Gagal memperbarui simpanan profil di local storage:', e);
                }

                // Setelah lokal beres, panggil onSave milik App.jsx untuk sinkronisasi state global
                onSave(updatedFields);

            } else {
                showInfo('Gagal Menyimpan', result.message || 'Pastikan data sudah benar.');
            }
        } catch (error) {
            console.log("Error Update Basic Profile:", error);
            showInfo('Error Jaringan', 'Gagal terhubung ke server. Periksa koneksi internetmu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

            <PageHeader title="Edit Data Pribadi" onBack={onCancel} />

            <ScrollView contentContainerStyle={styles.content}>
                <InputField label="Nama" value={name} onChangeText={setName} />
                <InputField label="Username" value={username} onChangeText={setUsername} />
                <InputField label="No. Telepon" value={phone} onChangeText={setPhone} />
                <RadioField 
                    label="Jenis Kelamin" 
                    options={['Laki-laki', 'Perempuan']} 
                    selectedValue={gender} 
                    onSelect={setGender} 
                />
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    content: { padding: 20 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, height: 50, paddingHorizontal: 15, fontSize: 14, color: '#000', fontWeight: '600' },
    
    radioGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
    radioOuterCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#284B7A', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    radioInnerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#284B7A' },
    radioText: { fontSize: 14, color: '#000', fontWeight: '500' },

    footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFF' },
    cancelBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cancelBtnText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
    saveBtn: { flex: 1.2, height: 50, borderRadius: 25, backgroundColor: '#387C65', justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});

export default EditBasicProfilePage;