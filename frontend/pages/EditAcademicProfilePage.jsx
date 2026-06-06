import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    StatusBar, ScrollView, TextInput, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from '../components/PageHeader';
import { useAppAlert } from '../components/AppAlertProvider';
import Svg, { Path } from 'react-native-svg';
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

const ThinChevronRight = ({ size = 16, color = "#888" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 18l6-6-6-6" />
    </Svg>
);

const DropdownField = ({ label, value, options, onSelect }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setVisible(!visible)}
            >
                <Text style={[styles.inputText, !value && styles.placeholderText]}>
                    {value ? String(value) : `Pilih ${label}`}
                </Text>
                <View style={{ transform: [{ rotate: visible ? '90deg' : '0deg' }] }}>
                    <ThinChevronRight size={18} color="#888" />
                </View>
            </TouchableOpacity>

            {visible && (
                <View style={styles.inlineDropdownContent}>
                    {options.map((item, index) => (
                        <TouchableOpacity 
                            key={String(index)}
                            style={[
                                styles.optionItem,
                                index === options.length - 1 && { borderBottomWidth: 0 }
                            ]}
                            onPress={() => {
                                onSelect(String(item));
                                setVisible(false);
                            }}
                        >
                            <Text style={styles.optionText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const EditAcademicProfilePage = ({ profileData, onSave, onCancel }) => {
    const { showInfo } = useAppAlert();
    const [education, setEducation] = useState(profileData.education || '');
    const [major, setMajor] = useState(profileData.major || '');

    // State untuk animasi loading
    const [isLoading, setIsLoading] = useState(false);

    const jenjangOptions = ['SD', 'SMP', 'SMA'];
    const getKelasOptions = (jenjang) => {
        if (jenjang === 'SD') return ['1', '2', '3', '4', '5', '6'];
        if (jenjang === 'SMP') return ['7', '8', '9'];
        if (jenjang === 'SMA') return ['10', '11', '12'];
        return [];
    };

    const handleJenjangChange = (val) => {
        setEducation(val);
        setMajor(''); // reset kelas saat jenjang berubah
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                email: profileData.email,
                major: major // Mengirim teks, misal: "12 - IPA"
            };

            const result = await updateAcademicProfile(payload);

            if (result.success === true || result.status === 200) {

                // Kembalikan data yang sudah diperbarui ke App.jsx
                const updatedFields = {
                    ...profileData,
                    education: education,
                    jenjang_pendidikan: education,
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
                showInfo('Gagal Menyimpan', result.message || 'Pastikan data sudah benar.');
            }
        } catch (error) {
            console.log("Error Update Academic Profile:", error);
            showInfo('Error Jaringan', 'Gagal terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />

            <PageHeader title="Edit Data Akademis" onBack={onCancel} />

            <ScrollView contentContainerStyle={styles.content}>
                <DropdownField 
                    label="Jenjang Pendidikan" 
                    value={education} 
                    options={jenjangOptions} 
                    onSelect={handleJenjangChange} 
                />
                <DropdownField 
                    label="Kelas" 
                    value={major} 
                    options={getKelasOptions(education)} 
                    onSelect={setMajor} 
                />
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
    dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, height: 50, paddingHorizontal: 15, backgroundColor: '#FFF' },
    inputText: { fontSize: 14, color: '#000', fontWeight: '600' },
    placeholderText: { color: '#A9A9A9', fontWeight: 'normal' },
    inlineDropdownContent: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, marginTop: 5, backgroundColor: '#FFF', overflow: 'hidden' },
    optionItem: { paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    optionText: { fontSize: 14, color: '#333' },

    footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFF' },
    cancelBtn: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cancelBtnText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
    saveBtn: { flex: 1.2, height: 50, borderRadius: 25, backgroundColor: '#387C65', justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});

export default EditAcademicProfilePage;