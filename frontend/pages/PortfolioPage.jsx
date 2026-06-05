import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import DimmedModal from '../components/DimmedModal';
import { MODAL_WIDE_WIDTH, wideModalCardBase } from '../components/modalTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import { portfolioService } from '../services/portfolioService';
import { useAppAlert } from '../components/AppAlertProvider';

const { width } = Dimensions.get('window');

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const TIPE_OPTIONS = [
  'Penghargaan',
  'Pengalaman',
  'Sertifikat',
  'Karya',
  'Pendidikan',
];

const formatTanggal = date =>
  date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : '';

const toDbDate = date => {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, '0');
  const hari = String(date.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${hari}`;
};

const startOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const PortfolioPage = ({ onBack, idGuru }) => {
  const { showInfo } = useAppAlert();
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [kategori, setKategori] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalSelesai, setTanggalSelesai] = useState(null);
  const [deskripsi, setDeskripsi] = useState('');
  const [urlBukti, setUrlBukti] = useState('');
  const [openKategori, setOpenKategori] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const openCalendarFor = target => {
    const refDate = target === 'mulai' ? tanggalMulai : tanggalSelesai;
    const base = refDate || new Date();
    setCalendarMonth(base.getMonth());
    setCalendarYear(base.getFullYear());
    setCalendarTarget(target);
    setOpenKategori(false);
    setShowCalendar(true);
  };

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysArray = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ key: `empty-${i}`, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      daysArray.push({ key: `day-${d}`, day: d });
    }
    return daysArray;
  };

  const activeDate = calendarTarget === 'mulai' ? tanggalMulai : tanggalSelesai;

  const isDateSelected = day => {
    if (!day || !activeDate) return false;
    return (
      activeDate.getDate() === day &&
      activeDate.getMonth() === calendarMonth &&
      activeDate.getFullYear() === calendarYear
    );
  };

  const isDateDisabled = day => {
    if (!day) return true;
    const checkDate = startOfDay(new Date(calendarYear, calendarMonth, day));
    if (calendarTarget === 'selesai' && tanggalMulai) {
      return checkDate < startOfDay(tanggalMulai);
    }
    return false;
  };

  const selectDate = day => {
    const selected = startOfDay(new Date(calendarYear, calendarMonth, day));
    if (calendarTarget === 'mulai') {
      setTanggalMulai(selected);
      if (tanggalSelesai && startOfDay(tanggalSelesai) < selected) {
        setTanggalSelesai(null);
      }
    } else if (calendarTarget === 'selesai') {
      setTanggalSelesai(selected);
    }
    setShowCalendar(false);
    setCalendarTarget(null);
  };

  const handleSimpan = async () => {
    if (!idGuru) {
      showInfo('Error', 'ID guru tidak ditemukan. Silakan login ulang.');
      return;
    }
    if (!namaKegiatan.trim()) {
      showInfo('Peringatan', 'Mohon isi Nama Kegiatan atau Sertifikasi.');
      return;
    }
    if (!kategori) {
      showInfo('Peringatan', 'Mohon pilih Kategori.');
      return;
    }
    if (!tanggalMulai) {
      showInfo('Peringatan', 'Mohon pilih Tanggal Mulai.');
      return;
    }
    if (!tanggalSelesai) {
      showInfo('Peringatan', 'Mohon pilih Tanggal Selesai.');
      return;
    }
    if (startOfDay(tanggalSelesai) < startOfDay(tanggalMulai)) {
      showInfo('Peringatan', 'Tanggal selesai harus sama atau setelah tanggal mulai.');
      return;
    }
    if (!deskripsi.trim()) {
      showInfo('Peringatan', 'Mohon isi Deskripsi.');
      return;
    }
    if (!urlBukti.trim()) {
      showInfo('Peringatan', 'Mohon isi URL Bukti.');
      return;
    }

    setIsSaving(true);
    try {
      await portfolioService.tambahPortfolio({
        id_guru: idGuru,
        judul: namaKegiatan.trim(),
        deskripsi: deskripsi.trim(),
        tipe_portfolio: kategori,
        bukti: urlBukti.trim(),
        tanggal_mulai: toDbDate(tanggalMulai),
        tanggal_selesai: toDbDate(tanggalSelesai),
      });
      showInfo('Sukses', 'Portofolio berhasil disimpan.', {
        onClose: () => onBack && onBack(),
      });
    } catch (error) {
      showInfo('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <PageHeader title="Tambah Portofolio" onBack={onBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBodyPadding}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Nama Kegiatan atau Sertifikasi</Text>
          <TextInput
            style={styles.outlineInputBox}
            placeholder="Masukkan Nama"
            placeholderTextColor="#C4C4C4"
            value={namaKegiatan}
            onChangeText={setNamaKegiatan}
          />
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Kategori</Text>
          <TouchableOpacity
            style={styles.dropdownSelectBox}
            activeOpacity={0.7}
            onPress={() => {
              setOpenKategori(prev => !prev);
              setShowCalendar(false);
            }}
          >
            <Text style={[styles.dropdownValueText, !kategori && { color: '#C4C4C4' }]}>
              {kategori || 'Pilih Kategori'}
            </Text>
            <Text style={styles.dropdownChevronIcon}>{openKategori ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {openKategori && (
            <View style={styles.kategoriDropdown}>
              {TIPE_OPTIONS.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.kategoriItem, kategori === item && styles.kategoriItemActive]}
                  onPress={() => {
                    setKategori(item);
                    setOpenKategori(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.kategoriItemText,
                      kategori === item && styles.kategoriItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {kategori === item && <Text style={styles.kategoriCheckmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.metaGridRow}>
          <TouchableOpacity
            style={styles.metaGridCard}
            activeOpacity={0.7}
            onPress={() => openCalendarFor('mulai')}
          >
            <Text style={styles.metaInputLabel}>Tanggal Mulai</Text>
            <Text style={styles.metaLabelTitle}>Tanggal</Text>
            <Text style={[styles.metaValueText, !tanggalMulai && styles.metaPlaceholder]}>
              {tanggalMulai ? formatTanggal(tanggalMulai) : 'Pilih Tanggal'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.metaGridCard}
            activeOpacity={0.7}
            onPress={() => {
              if (!tanggalMulai) {
                showInfo('Peringatan', 'Pilih Tanggal Mulai terlebih dahulu.');
                return;
              }
              openCalendarFor('selesai');
            }}
          >
            <Text style={styles.metaInputLabel}>Tanggal Selesai</Text>
            <Text style={styles.metaLabelTitle}>Tanggal</Text>
            <Text style={[styles.metaValueText, !tanggalSelesai && styles.metaPlaceholder]}>
              {tanggalSelesai ? formatTanggal(tanggalSelesai) : 'Pilih Tanggal'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>Deskripsi</Text>
          <TextInput
            style={[styles.outlineInputBox, styles.textareaInputBox]}
            placeholder="Masukkan Deskripsi"
            placeholderTextColor="#C4C4C4"
            multiline
            numberOfLines={4}
            value={deskripsi}
            onChangeText={setDeskripsi}
          />
        </View>

        <View style={styles.fieldBlockWrapper}>
          <Text style={styles.fieldSectionLabel}>URL Bukti</Text>
          <TextInput
            style={styles.outlineInputBox}
            placeholder="Masukkan URL"
            placeholderTextColor="#C4C4C4"
            value={urlBukti}
            onChangeText={setUrlBukti}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </ScrollView>

      <View style={styles.persistentFooterContainer}>
        <TouchableOpacity
          style={[styles.primarySubmitButton, isSaving && styles.primarySubmitButtonDisabled]}
          onPress={handleSimpan}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonLabelText}>Simpan Portofolio</Text>
          )}
        </TouchableOpacity>
      </View>

      <DimmedModal
        visible={showCalendar}
        onRequestClose={() => {
          setShowCalendar(false);
          setCalendarTarget(null);
        }}
        placement="center"
        size="wide"
      >
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={prevMonth} style={styles.calendarNavBtn}>
                  <Text style={styles.calendarNavText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.calendarMonthText}>
                  {MONTHS[calendarMonth]} {calendarYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={styles.calendarNavBtn}>
                  <Text style={styles.calendarNavText}>{'>'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calendarDayHeaders}>
                {DAYS.map(day => (
                  <Text key={day} style={styles.calendarDayHeaderText}>
                    {day}
                  </Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {generateCalendarDays().map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.calendarDayCell,
                      isDateSelected(item.day) && styles.calendarDaySelected,
                      isDateDisabled(item.day) && styles.calendarDayDisabled,
                    ]}
                    onPress={() => item.day && !isDateDisabled(item.day) && selectDate(item.day)}
                    disabled={isDateDisabled(item.day)}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isDateSelected(item.day) && styles.calendarDayTextSelected,
                        isDateDisabled(item.day) && styles.calendarDayTextDisabled,
                      ]}
                    >
                      {item.day || ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setShowCalendar(false);
                  setCalendarTarget(null);
                }}
              >
                <Text style={styles.modalCloseBtnText}>Tutup</Text>
              </TouchableOpacity>
            </View>
      </DimmedModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollBodyPadding: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  fieldBlockWrapper: {
    marginBottom: 20,
  },
  fieldSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  outlineInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333333',
  },
  textareaInputBox: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  dropdownSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
  },
  dropdownValueText: {
    fontSize: 14,
    color: '#333333',
  },
  dropdownChevronIcon: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  kategoriDropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  kategoriItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  kategoriItemActive: {
    backgroundColor: '#F0FDF4',
  },
  kategoriItemText: {
    fontSize: 14,
    color: '#333333',
  },
  kategoriItemTextActive: {
    color: '#1DB954',
    fontWeight: '600',
  },
  kategoriCheckmark: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: 'bold',
  },
  metaGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaGridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaInputLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
  },
  metaLabelTitle: {
    fontSize: 11,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  metaValueText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  metaPlaceholder: {
    color: '#C4C4C4',
    fontWeight: '400',
  },
  persistentFooterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  primarySubmitButton: {
    backgroundColor: '#387C65',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primarySubmitButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  calendarContainer: {
    ...wideModalCardBase,
    width: MODAL_WIDE_WIDTH,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavBtn: { padding: 10 },
  calendarNavText: { fontSize: 20, fontWeight: 'bold', color: '#284B7A' },
  calendarMonthText: { fontSize: 16, fontWeight: '700', color: '#333' },
  calendarDayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDaySelected: { backgroundColor: '#1DB954', borderRadius: 20 },
  calendarDayDisabled: { opacity: 0.3 },
  calendarDayText: { fontSize: 14, color: '#333', fontWeight: '500' },
  calendarDayTextSelected: { color: '#FFF', fontWeight: '700' },
  calendarDayTextDisabled: { color: '#CCC' },
  modalCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  modalCloseBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
});

export default PortfolioPage;
