import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Modal,
  Linking,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const PesanSesiPage = ({ onBack, onConfirmOrder }) => {
  const [tanggal, setTanggal] = useState(null);
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [kelas, setKelas] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [materi, setMateri] = useState('');

  const [openWaktuMulai, setOpenWaktuMulai] = useState(false);
  const [openWaktuSelesai, setOpenWaktuSelesai] = useState(false);
  const [openJenjang, setOpenJenjang] = useState(false);
  const [openKelas, setOpenKelas] = useState(false);
  const [openMapel, setOpenMapel] = useState(false);
  const [openMateri, setOpenMateri] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('Mengambil lokasi...');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // === DATA OPTIONS ===
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 6; h <= 21; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const getFilteredEndTimes = () => {
    if (!waktuMulai) return [];
    const startIndex = timeSlots.indexOf(waktuMulai);
    if (startIndex === -1) return [];
    return timeSlots.slice(startIndex + 1);
  };

  const jenjangOptions = ['SD', 'SMP', 'SMA'];

  const getKelasOptions = () => {
    if (jenjang === 'SD') return ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
    if (jenjang === 'SMP') return ['Kelas 1', 'Kelas 2', 'Kelas 3'];
    if (jenjang === 'SMA') return ['Kelas 1', 'Kelas 2', 'Kelas 3'];
    return [];
  };

  const mapelOptions = [
    'Matematika', 'Fisika', 'Kimia', 'Biologi',
    'Bahasa Inggris', 'Bahasa Indonesia', 'Ekonomi', 'Sejarah',
    'IPA', 'IPS', 'PKN', 'Seni Budaya',
  ];

  const materiOptions = [
    'Aljabar Linear', 'Kalkulus Diferensial', 'Trigonometri',
    'Statistika', 'Geometri', 'Persamaan Kuadrat',
    'Termodinamika', 'Kinematika', 'Optik',
  ];

  const closeAllDropdowns = (except = '') => {
    if (except !== 'waktuMulai') setOpenWaktuMulai(false);
    if (except !== 'waktuSelesai') setOpenWaktuSelesai(false);
    if (except !== 'jenjang') setOpenJenjang(false);
    if (except !== 'kelas') setOpenKelas(false);
    if (except !== 'mapel') setOpenMapel(false);
    if (except !== 'materi') setOpenMateri(false);
  };

  // === LOCATION ===
  useEffect(() => { requestLocation(); }, []);

  const requestLocation = async () => {
    setLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message: 'Aplikasi membutuhkan akses lokasi untuk menentukan titik bimbingan.',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Tolak',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationAddress('Izin lokasi ditolak');
          setLoadingLocation(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
            .then(res => res.json())
            .then(data => setLocationAddress(data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`))
            .catch(() => setLocationAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`));
          setLoadingLocation(false);
        },
        () => {
          setLocationAddress('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch {
      setLocationAddress('Error mendapatkan lokasi');
      setLoadingLocation(false);
    }
  };

  const openInGoogleMaps = () => {
    if (userLocation) {
      Linking.openURL(`https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`);
    } else {
      Alert.alert('Lokasi belum tersedia', 'Tunggu hingga GPS mendapatkan posisi Anda.');
    }
  };

  // === CALENDAR ===
  const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const generateCalendarDays = () => {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ key: `e-${i}`, day: null });
    for (let d = 1; d <= daysInMonth; d++) days.push({ key: `d-${d}`, day: d });
    return days;
  };

  const isDateDisabled = (day) => {
    if (!day) return true;
    const date = new Date(calendarYear, calendarMonth, day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (day) => {
    if (!tanggal || !day) return false;
    return tanggal.getDate() === day && tanggal.getMonth() === calendarMonth && tanggal.getFullYear() === calendarYear;
  };

  const selectDate = (day) => {
    if (isDateDisabled(day)) return;
    setTanggal(new Date(calendarYear, calendarMonth, day));
    setShowCalendar(false);
  };

  const prevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
    else setCalendarMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
    else setCalendarMonth(m => m + 1);
  };

  const formatTanggal = (date) =>
    date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : '';

  // === KONFIRMASI ===
  const handleConfirm = () => {
    if (!tanggal || !waktuMulai || !waktuSelesai || !jenjang || !kelas || !mataPelajaran || !materi) {
      Alert.alert('Form Belum Lengkap', 'Mohon lengkapi semua field sebelum mengkonfirmasi pesanan.');
      return;
    }
    if (onConfirmOrder) onConfirmOrder({
      tanggal: formatTanggal(tanggal),
      waktuSesi: `${waktuMulai} - ${waktuSelesai}`,
      jenjang: `${jenjang} - ${kelas}`,
      mataPelajaran, materi,
      lokasi: locationAddress,
      koordinat: userLocation,
    });
  };

  // === KONSTANTA DROPDOWN ===
  const ITEM_HEIGHT = 44;
  const TIME_ITEM_HEIGHT = 40;
  const MAX_VISIBLE = 5;

  // === FLOATING DROPDOWN DENGAN SEARCH (ScrollView + map, bukan FlatList) ===
  const FloatingDropdown = ({ label, value, placeholder, options, isOpen, onToggle, onSelect, zIndex = 10 }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = options.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const listHeight = Math.min(filtered.length * ITEM_HEIGHT, MAX_VISIBLE * ITEM_HEIGHT);

    return (
      <View style={[styles.fieldContainer, { zIndex }]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.dropdownBox, isOpen && styles.dropdownBoxOpen]}
          onPress={() => {
            closeAllDropdowns(label);
            if (!isOpen) setSearchQuery('');
            onToggle(!isOpen);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
          <Text style={isOpen ? styles.chevronUp : styles.chevronDown}>▼</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.floatingList}>
            {/* Search bar */}
            <View style={styles.searchBarWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={`Cari ${label.toLowerCase()}...`}
                placeholderTextColor="#AAAAAA"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* List hasil pakai ScrollView + map, BUKAN FlatList */}
            <ScrollView
              style={{ maxHeight: listHeight || ITEM_HEIGHT }}
              nestedScrollEnabled={true}
              bounces={false}
              showsVerticalScrollIndicator={filtered.length > MAX_VISIBLE}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length === 0 ? (
                <View style={styles.emptyResult}>
                  <Text style={styles.emptyResultText}>Tidak ada hasil untuk "{searchQuery}"</Text>
                </View>
              ) : (
                filtered.map((item, index) => (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    style={[
                      styles.floatingItem,
                      { height: ITEM_HEIGHT },
                      value === item && styles.floatingItemSelected,
                      index === filtered.length - 1 && styles.floatingItemLast,
                    ]}
                    onPress={() => { onSelect(item); onToggle(false); setSearchQuery(''); }}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.floatingItemText, value === item && styles.floatingItemTextSelected]}>
                      {item}
                    </Text>
                    {value === item && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // === TIME FLOATING DROPDOWN DENGAN SEARCH (ScrollView + map, bukan FlatList) ===
  const TimeFloatingDropdown = ({ value, placeholder, options, isOpen, onToggle, onSelect, zIndex = 10 }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = options.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const listHeight = Math.min(filtered.length * TIME_ITEM_HEIGHT, MAX_VISIBLE * TIME_ITEM_HEIGHT);

    return (
      <View style={[styles.timeDropdownWrap, { zIndex }]}>
        <TouchableOpacity
          style={[styles.timeBox, isOpen && styles.timeBoxOpen]}
          onPress={() => {
            closeAllDropdowns(placeholder);
            if (!isOpen) setSearchQuery('');
            onToggle(!isOpen);
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.timeText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
          <Text style={isOpen ? styles.chevronUpSmall : styles.chevronDownSmall}>▼</Text>
        </TouchableOpacity>

        {isOpen && options.length > 0 && (
          <View style={styles.floatingListTime}>
            {/* Search bar kecil */}
            <View style={styles.searchBarWrapSmall}>
              <Text style={styles.searchIconSmall}>🔍</Text>
              <TextInput
                style={styles.searchInputSmall}
                placeholder="Cari waktu..."
                placeholderTextColor="#AAAAAA"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* List hasil pakai ScrollView + map, BUKAN FlatList */}
            <ScrollView
              style={{ maxHeight: listHeight || TIME_ITEM_HEIGHT }}
              nestedScrollEnabled={true}
              bounces={false}
              showsVerticalScrollIndicator={filtered.length > MAX_VISIBLE}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length === 0 ? (
                <View style={styles.emptyResult}>
                  <Text style={styles.emptyResultText}>Tidak ditemukan</Text>
                </View>
              ) : (
                filtered.map((item, index) => (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    style={[
                      styles.floatingItem,
                      { height: TIME_ITEM_HEIGHT },
                      value === item && styles.floatingItemSelected,
                      index === filtered.length - 1 && styles.floatingItemLast,
                    ]}
                    onPress={() => { onSelect(item); onToggle(false); setSearchQuery(''); }}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.floatingItemText, value === item && styles.floatingItemTextSelected]}>
                      {item}
                    </Text>
                    {value === item && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // === RENDER ===
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Kembali'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesan Sesi</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Tanggal & Waktu Row */}
        <View style={[styles.rowContainer, { zIndex: 100 }]}>
          {/* Tanggal */}
          <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.fieldLabel}>Tanggal</Text>
            <TouchableOpacity
              style={styles.dropdownBox}
              onPress={() => { closeAllDropdowns(); setShowCalendar(true); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !tanggal && styles.placeholderText]}>
                {tanggal ? formatTanggal(tanggal) : 'Pilih Tanggal'}
              </Text>
              <Text>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Waktu Sesi */}
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.fieldLabel}>Waktu Sesi</Text>
            <View style={styles.timeRow}>
              <TimeFloatingDropdown
                value={waktuMulai}
                placeholder="Mulai"
                options={timeSlots}
                isOpen={openWaktuMulai}
                onToggle={(val) => { closeAllDropdowns('waktuMulai'); setOpenWaktuMulai(val); }}
                onSelect={(val) => { setWaktuMulai(val); setWaktuSelesai(''); setOpenWaktuMulai(false); }}
                zIndex={99}
              />
              <Text style={styles.timeSeparator}>-</Text>
              <TimeFloatingDropdown
                value={waktuSelesai}
                placeholder="Selesai"
                options={getFilteredEndTimes()}
                isOpen={openWaktuSelesai}
                onToggle={(val) => {
                  if (!waktuMulai) {
                    Alert.alert('Pilih Waktu Mulai', 'Pilih waktu mulai terlebih dahulu.');
                    return;
                  }
                  closeAllDropdowns('waktuSelesai');
                  setOpenWaktuSelesai(val);
                }}
                onSelect={(val) => { setWaktuSelesai(val); setOpenWaktuSelesai(false); }}
                zIndex={98}
              />
            </View>
          </View>
        </View>

        {/* Jenjang */}
        <FloatingDropdown
          label="Jenjang" value={jenjang} placeholder="Pilih Jenjang"
          options={jenjangOptions} isOpen={openJenjang}
          onToggle={(val) => { closeAllDropdowns('Jenjang'); setOpenJenjang(val); }}
          onSelect={(val) => { setJenjang(val); setKelas(''); setOpenJenjang(false); }}
          zIndex={90}
        />

        {/* Kelas */}
        {jenjang !== '' && (
          <FloatingDropdown
            label="Kelas" value={kelas} placeholder="Pilih Kelas"
            options={getKelasOptions()} isOpen={openKelas}
            onToggle={(val) => { closeAllDropdowns('Kelas'); setOpenKelas(val); }}
            onSelect={(val) => { setKelas(val); setOpenKelas(false); }}
            zIndex={80}
          />
        )}

        {/* Mata Pelajaran */}
        <FloatingDropdown
          label="Mata Pelajaran" value={mataPelajaran} placeholder="Pilih Mata Pelajaran"
          options={mapelOptions} isOpen={openMapel}
          onToggle={(val) => { closeAllDropdowns('Mata Pelajaran'); setOpenMapel(val); }}
          onSelect={(val) => { setMataPelajaran(val); setOpenMapel(false); }}
          zIndex={70}
        />

        {/* Materi */}
        <FloatingDropdown
          label="Materi" value={materi} placeholder="Pilih Materi"
          options={materiOptions} isOpen={openMateri}
          onToggle={(val) => { closeAllDropdowns('Materi'); setOpenMateri(val); }}
          onSelect={(val) => { setMateri(val); setOpenMateri(false); }}
          zIndex={60}
        />

        {/* Map Section */}
        <View style={[styles.mapSection, { zIndex: 1 }]}>
          <TouchableOpacity style={styles.mapPlaceholder} onPress={openInGoogleMaps} activeOpacity={0.8}>
            {loadingLocation ? (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#284B7A" />
                <Text style={styles.mapLoadingText}>Mengambil lokasi GPS...</Text>
              </View>
            ) : userLocation ? (
              <View style={styles.mapPreview}>
                <Text style={styles.mapPinEmoji}>📍</Text>
                <Text style={styles.mapCoordText}>
                  {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
                </Text>
                <Text style={styles.mapTapText}>Ketuk untuk buka di Google Maps</Text>
              </View>
            ) : (
              <View style={styles.mapPreview}>
                <Text style={styles.mapPinEmoji}>⚠️</Text>
                <Text style={styles.mapTapText}>Lokasi belum tersedia</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={requestLocation}>
                  <Text style={styles.retryBtnText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.lokasiRow}>
            <Text style={styles.lokasiIcon}>📍</Text>
            <View style={styles.lokasiTextWrap}>
              <Text style={styles.lokasiTitle}>Lokasi Anda</Text>
              <Text style={styles.lokasiAddress} numberOfLines={2}>{locationAddress}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Tombol Konfirmasi */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calendarNavBtn}>
                <Text style={styles.calendarNavText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>{MONTHS[calendarMonth]} {calendarYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calendarNavBtn}>
                <Text style={styles.calendarNavText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.calendarDayHeaders}>
              {DAYS.map(day => (
                <Text key={day} style={styles.calendarDayHeaderText}>{day}</Text>
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
                  onPress={() => item.day && selectDate(item.day)}
                  disabled={isDateDisabled(item.day)}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.calendarDayText,
                    isDateSelected(item.day) && styles.calendarDayTextSelected,
                    isDateDisabled(item.day) && styles.calendarDayTextDisabled,
                  ]}>
                    {item.day || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowCalendar(false)}>
              <Text style={styles.modalCloseBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 56 : 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#E8E8E8', backgroundColor: '#FFFFFF',
  },
  backButton: { paddingVertical: 4 },
  backText: { fontSize: 14, color: '#333', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  scrollContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  rowContainer: { flexDirection: 'row', marginBottom: 4 },
  fieldContainer: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#4A4A4A', marginBottom: 8 },

  // Dropdown box
  dropdownBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FAFAFA',
  },
  dropdownBoxOpen: {
    borderColor: '#284B7A',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: { fontSize: 14, color: '#333', flex: 1 },
  placeholderText: { color: '#AAAAAA' },
  chevronDown: { fontSize: 11, color: '#999' },
  chevronUp: { fontSize: 11, color: '#284B7A', transform: [{ rotate: '180deg' }] },

  // Floating list utama
  floatingList: {
    position: 'absolute',
    top: 82,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#284B7A',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },

  // Search bar dalam dropdown
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F9F9F9',
    height: 48,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1, fontSize: 13, color: '#333',
    paddingVertical: 4, height: 36,
  },
  searchClear: {
    fontSize: 13, color: '#999',
    paddingHorizontal: 6, fontWeight: 'bold',
  },

  // Item dropdown
  floatingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  floatingItemSelected: { backgroundColor: '#F0F7FF' },
  floatingItemLast: { borderBottomWidth: 0 },
  floatingItemText: { fontSize: 14, color: '#333' },
  floatingItemTextSelected: { color: '#284B7A', fontWeight: '700' },
  checkmark: { fontSize: 14, color: '#284B7A', fontWeight: 'bold' },

  // Empty state
  emptyResult: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  emptyResultText: { fontSize: 12, color: '#999', fontStyle: 'italic' },

  // Time row
  timeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeDropdownWrap: { flex: 1, position: 'relative' },
  timeBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 12,
    backgroundColor: '#FAFAFA', gap: 4,
  },
  timeBoxOpen: {
    borderColor: '#284B7A',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  timeText: { fontSize: 12, color: '#2D9CDB', fontWeight: '600' },
  timeSeparator: { marginHorizontal: 4, fontSize: 16, color: '#999', fontWeight: 'bold', paddingTop: 12 },
  chevronDownSmall: { fontSize: 8, color: '#999' },
  chevronUpSmall: { fontSize: 8, color: '#284B7A', transform: [{ rotate: '180deg' }] },

  // Floating list waktu
  floatingListTime: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#284B7A',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },

  // Search bar kecil untuk waktu
  searchBarWrapSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F9F9F9',
    height: 40,
  },
  searchIconSmall: { fontSize: 11, marginRight: 4 },
  searchInputSmall: {
    flex: 1, fontSize: 12, color: '#333',
    paddingVertical: 2, height: 32,
  },

  // Map
  mapSection: { marginTop: 4, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E8E8E8' },
  mapPlaceholder: { height: 180, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  mapLoadingContainer: { alignItems: 'center' },
  mapLoadingText: { marginTop: 10, fontSize: 13, color: '#666' },
  mapPreview: { alignItems: 'center' },
  mapPinEmoji: { fontSize: 40, marginBottom: 8 },
  mapCoordText: { fontSize: 13, color: '#333', fontWeight: '600', marginBottom: 4 },
  mapTapText: { fontSize: 12, color: '#2D9CDB', fontWeight: '500' },
  retryBtn: { marginTop: 12, backgroundColor: '#284B7A', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 15 },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  lokasiRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FFF' },
  lokasiIcon: { fontSize: 20, marginRight: 10 },
  lokasiTextWrap: { flex: 1 },
  lokasiTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  lokasiAddress: { fontSize: 12, color: '#777', marginTop: 2 },

  // Bottom button
  bottomButtonContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#1DB954', borderRadius: 25, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#1DB954', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Calendar
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  calendarContainer: {
    backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, padding: 20,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10,
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calendarNavBtn: { padding: 10 },
  calendarNavText: { fontSize: 20, fontWeight: 'bold', color: '#284B7A' },
  calendarMonthText: { fontSize: 16, fontWeight: '700', color: '#333' },
  calendarDayHeaders: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  calendarDayHeaderText: { fontSize: 12, fontWeight: '600', color: '#888', width: 40, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  calendarDaySelected: { backgroundColor: '#1DB954', borderRadius: 20 },
  calendarDayDisabled: { opacity: 0.3 },
  calendarDayText: { fontSize: 14, color: '#333', fontWeight: '500' },
  calendarDayTextSelected: { color: '#FFF', fontWeight: '700' },
  calendarDayTextDisabled: { color: '#CCC' },
  modalCloseBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12, backgroundColor: '#F5F5F5', borderRadius: 10 },
  modalCloseBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
});

export default PesanSesiPage;