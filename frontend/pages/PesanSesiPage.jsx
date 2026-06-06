import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Linking,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import DimmedModal from '../components/DimmedModal';
import { MODAL_WIDE_WIDTH, wideModalCardBase } from '../components/modalTheme';
import { WebView } from 'react-native-webview'; // Import WebView untuk peta interaktif
import { MapPin, Search } from 'lucide-react-native';
import Geolocation from '@react-native-community/geolocation';
import { pemesananService } from '../services/pemesananService';
import PageHeader from '../components/PageHeader';
import LocationPickerModal from '../components/LocationPickerModal';
import PoinSVG from '../components/mapsPoint';
import MapsSVG from '../components/mapsSVG';
import Back from '../components/BackIconSvg';
import { useAppAlert } from '../components/AppAlertProvider';
import CustomAlert from '../components/CustomAlert';

// === KONSTANTA KALENDER ===
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const PesanSesiPage = ({ onBack, onConfirmOrder, userId, prefillBooking = null, resetDraft = false }) => {
  const { showInfo } = useAppAlert();
  // === STATE CUSTOM ALERT ===
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // === STATE FORM ===
  const [tanggal, setTanggal] = useState(null);
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [kelas, setKelas] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [materi, setMateri] = useState('');
  const [selectedMateriId, setSelectedMateriId] = useState(null);
  const [materiSelected, setMateriSelected] = useState(null);


  // === STATE DB ===
  const [daftarMapelDB, setDaftarMapelDB] = useState([]);
  const [daftarMateriDB, setDaftarMateriDB] = useState([]);
  const [loadingMapel, setLoadingMapel] = useState(false);
  const [loadingMateri, setLoadingMateri] = useState(false);
  const [mapelSelected, setMapelSelected] = useState(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  // === STATE DROPDOWN ===
  const [openWaktuMulai, setOpenWaktuMulai] = useState(false);
  const [openWaktuSelesai, setOpenWaktuSelesai] = useState(false);
  const [openJenjang, setOpenJenjang] = useState(false);
  const [openKelas, setOpenKelas] = useState(false);
  const [openMapel, setOpenMapel] = useState(false);
  const [openMateri, setOpenMateri] = useState(false);

  // === STATE LOKASI ===
  const [userLocation, setUserLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('Mengambil lokasi...');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false); // ← TAMBAH INI
  // === STATE KALENDER ===
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // === FETCH LOKASI ===
  useEffect(() => {
    requestLocation();
  }, []);

  // === FETCH MAPEL (Menggunakan Service) ===
  useEffect(() => {
    if (!jenjang) {
      setDaftarMapelDB([]);
      setMapelSelected(null);
      setMataPelajaran('');
      return;
    }
    const fetchMapel = async () => {
      setLoadingMapel(true);
      try {
        const data = await pemesananService.getDaftarMapel(jenjang);
        setDaftarMapelDB(data);
      } catch (error) {
        Alert.alert(
          'Error',
          error.message || 'Gagal memuat daftar mata pelajaran',
        );
      } finally {
        setLoadingMapel(false);
      }
    };
    fetchMapel();
  }, [jenjang]);

  const applyPrefillBooking = prefill => {
    if (!prefill) return;
    if (prefill.jenjang) setJenjang(prefill.jenjang);
    if (prefill.kelas) setKelas(prefill.kelas);
    if (prefill.mataPelajaran) setMataPelajaran(prefill.mataPelajaran);
    if (prefill.materi) setMateri(prefill.materi);
    if (prefill.mapelSelected) setMapelSelected(prefill.mapelSelected);
    if (prefill.selectedMateriId) setSelectedMateriId(prefill.selectedMateriId);
  };

  // === FETCH LOAD DRAFT + PREFILL dari Home (Pesan Lagi)
  useEffect(() => {
    if (!userId) {
      setIsLoadingDraft(false);
      return;
    }

    // Jika resetDraft = true, skip load draft dan langsung selesai loading
    if (resetDraft) {
      console.log('🚫 Skip load draft karena resetDraft = true');
      setIsLoadingDraft(false);
      return;
    }

    let cancelled = false;

    const initForm = async () => {
      await loadDraft();
      if (!cancelled && prefillBooking) {
        applyPrefillBooking(prefillBooking);
      }
    };

    initForm();
    return () => {
      cancelled = true;
    };
  }, [userId, prefillBooking, resetDraft]); // ← tambah resetDraft ke dependency

  // === FETCH AUTO-SAVE
  useEffect(() => {
    if (!isLoadingDraft && userId) {
      // Cek apakah ada data yang terisi
      const hasData =
        tanggal ||
        waktuMulai ||
        waktuSelesai ||
        jenjang ||
        kelas ||
        mataPelajaran ||
        materi;
      if (hasData) {
        const timer = setTimeout(() => {
          saveDraft();
        }, 1000); // delay 1 detik
        return () => clearTimeout(timer);
      }
    }
  }, [
    tanggal,
    waktuMulai,
    waktuSelesai,
    jenjang,
    kelas,
    mataPelajaran,
    materi,
    locationAddress,
    isLoadingDraft,
    userId,
  ]);

  // Untuk save saat component unmount
  useEffect(() => {
    return () => {
      // Cleanup: simpan draft saat component unmount
      if (!isLoadingDraft && userId) {
        console.log('👋 Component unmount, menyimpan draft...');
        saveDraft();
      }
    };
  }, []);

  // === FETCH MATERI (Menggunakan Service) ===
  useEffect(() => {
    if (!mapelSelected || !kelas) {
      setDaftarMateriDB([]);
      setMateri('');
      return;
    }
    const fetchMateri = async () => {
      setLoadingMateri(true);
      try {
        const kelasAngka = getKelasNumber(jenjang, kelas);
        const data = await pemesananService.getDaftarMateri(
          mapelSelected.id,
          kelasAngka,
        );
        setDaftarMateriDB(data);
      } catch (error) {
        Alert.alert('Error', error.message || 'Gagal memuat daftar materi');
      } finally {
        setLoadingMateri(false);
      }
    };
    fetchMateri();
  }, [mapelSelected, kelas]);

  // === LOGIKA & HANDLER KALENDER ===
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

    // Padding kosong untuk hari sebelum tanggal 1 awal bulan
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ key: `empty-${i}`, day: null });
    }

    // Memasukkan tanggal riil
    for (let d = 1; d <= daysInMonth; d++) {
      daysArray.push({ key: `day-${d}`, day: d });
    }
    return daysArray;
  };

  const isDateSelected = day => {
    if (!day || !tanggal) return false;
    return (
      tanggal.getDate() === day &&
      tanggal.getMonth() === calendarMonth &&
      tanggal.getFullYear() === calendarYear
    );
  };

  const isDateDisabled = day => {
    if (!day) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(calendarYear, calendarMonth, day);
    return checkDate < today; // Memblokir tanggal yang sudah lewat
  };

  const selectDate = day => {
    const selected = new Date(calendarYear, calendarMonth, day);
    setTanggal(selected);
    setShowCalendar(false);
  };

  // === DATA HELPER OPTIONS ===
  const generateTimeSlots = () => {
    const slots = [];
    slots.push('07:30');
    for (let h = 8; h <= 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const getFilteredEndTimes = () => {
    if (!waktuMulai) return [];
    const startIndex = timeSlots.indexOf(waktuMulai);
    if (startIndex === -1) return [];
    // Minimal 1 jam = 2 slot (2 * 30 menit)
    return timeSlots.slice(startIndex + 2);
  };

  const jenjangOptions = ['SD', 'SMP', 'SMA'];

  const getKelasOptions = () => {
    if (jenjang === 'SD')
      return ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
    if (jenjang === 'SMP')
      return ['Kelas 7', 'Kelas 8', 'Kelas 9'];
    if (jenjang === 'SMA')
      return ['Kelas 10', 'Kelas 11', 'Kelas 12'];
    return [];
  };

  const getKelasNumber = (jenjang, kelas) => {
    const num = parseInt(kelas.replace('Kelas ', ''));
    return num;
  };

  const closeAllDropdowns = (except = '') => {
    const ex = except.toLowerCase();
    if (ex !== 'waktumulai') setOpenWaktuMulai(false);
    if (ex !== 'waktuselesai') setOpenWaktuSelesai(false);
    if (ex !== 'jenjang') setOpenJenjang(false);
    if (ex !== 'kelas') setOpenKelas(false);
    if (ex !== 'mata pelajaran') setOpenMapel(false);
    if (ex !== 'materi') setOpenMateri(false);
  };

  const requestLocation = async () => {
    setLoadingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi',
            message:
              'Aplikasi membutuhkan akses lokasi untuk menentukan titik bimbingan.',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Tolak',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationAddress('Izin lokasi ditolak');
          setLoadingLocation(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          // 👉 TAMBAHKAN HEADER USER-AGENT DI SINI
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'HumanaApp/1.0 (Aplikasi Bimbingan Belajar)', // Beri nama bebas yang unik
              },
            },
          )
            .then(res => res.json())
            .then(data => {
              // Memastikan data display_name ada
              if (data && data.display_name) {
                setLocationAddress(data.display_name);
              } else {
                setLocationAddress(
                  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                );
              }
            })
            .catch(err => {
              console.log('Error Reverse Geocoding:', err);
              setLocationAddress(
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              );
            });
          setLoadingLocation(false);
        },
        error => {
          console.log('Error GPS:', error);
          setLocationAddress('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {
      console.log('Error Permission:', err);
      setLocationAddress('Error mendapatkan lokasi');
      setLoadingLocation(false);
    }
  };
  // === FUNGSI DRAFT ===
  const loadDraft = async () => {
    console.log('🔄 ===== LOAD DRAFT DIPANGGIL =====');
    console.log('📌 userId:', userId);
    try {
      const draft = await pemesananService.getDraft(userId);
      console.log('📦 Draft dari server:', draft);
      if (draft && Object.keys(draft).length > 0) {
        console.log('✅ Draft ditemukan, memuat data...');
        // ========== ISI FORM DENGAN DATA DRAFT ==========
        if (draft.tanggal) setTanggal(new Date(draft.tanggal));
        if (draft.waktuMulai) setWaktuMulai(draft.waktuMulai);
        if (draft.waktuSelesai) setWaktuSelesai(draft.waktuSelesai);
        if (draft.jenjang) setJenjang(draft.jenjang);
        if (draft.kelas) setKelas(draft.kelas);
        if (draft.mataPelajaran) setMataPelajaran(draft.mataPelajaran);
        if (draft.materi) setMateri(draft.materi);
        if (draft.mapelSelected) setMapelSelected(draft.mapelSelected);
        if (draft.selectedMateriId) setSelectedMateriId(draft.selectedMateriId);
        if (draft.locationAddress) setLocationAddress(draft.locationAddress);
        if (draft.userLocation) setUserLocation(draft.userLocation);
        // ==============================================
        console.log('✅ State form sudah diisi dengan draft');
      } else {
        console.log('ℹ️ Tidak ada draft untuk userId:', userId);
      }
    } catch (error) {
      console.error('❌ Error loadDraft:', error);
    } finally {
      setIsLoadingDraft(false);
      console.log('🏁 isLoadingDraft set ke false');
    }
  };

  const saveDraft = async () => {
    console.log('💾 ===== SAVE DRAFT DIPANGGIL =====');
    console.log('📌 userId:', userId);

    try {
      const draftData = {
        tanggal: tanggal ? tanggal.toISOString() : null,
        waktuMulai: waktuMulai,
        waktuSelesai: waktuSelesai,
        jenjang: jenjang,
        kelas: kelas,
        mataPelajaran: mataPelajaran,
        materi: materi,
        mapelSelected: mapelSelected,
        selectedMateriId: selectedMateriId,
        locationAddress: locationAddress,
        userLocation: userLocation,
      };
      console.log(
        '📦 Data yang akan dikirim:',
        JSON.stringify(draftData, null, 2),
      );
      await pemesananService.saveDraft(userId, draftData);
      console.log('✅ Draft tersimpan');
    } catch (error) {
      console.error('❌ Gagal save draft:', error);
    }
  };

  const handleBackPress = () => {
    console.log('👆 Tombol back ditekan');
    if (onBack) {
      onBack(); // Panggil fungsi back dari props
    }
  };

  // === FORMAT TANGGAL HELPER ===
  const formatTanggal = date =>
    date
      ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
      : '';

  // === CORE HANDLE CONFIRM ===
  const handleConfirm = async () => {
    if (
      !userId ||
      !tanggal ||
      !waktuMulai ||
      !waktuSelesai ||
      !jenjang ||
      !kelas ||
      !mapelSelected ||
      !selectedMateriId ||
      !locationAddress
    ) {
      showInfo(
        'Form Belum Lengkap',
        'Mohon lengkapi semua field atau pastikan Anda sudah login kembali.',
        { type: 'gagal' }
      );
      return;
    }

    try {
      const tahun = tanggal.getFullYear();
      const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
      const hari = String(tanggal.getDate()).padStart(2, '0');
      const tglDb = `${tahun}-${bulan}-${hari}`;

      const waktuMulaiFormatted = `${tglDb} ${waktuMulai}:00`;
      const waktuSelesaiFormatted = `${tglDb} ${waktuSelesai}:00`;

      const dataPemesanan = {
        id_murid: userId,
        id_mapel: mapelSelected.id,
        id_materi: selectedMateriId,
        waktu_mulai: waktuMulaiFormatted,
        waktu_selesai: waktuSelesaiFormatted,
        lokasi_sesi: userLocation
          ? `${userLocation.latitude},${userLocation.longitude}|${locationAddress}`
          : locationAddress,
      };

      const result = await pemesananService.createPemesanan(dataPemesanan);

      if (result.success) {
        if (onConfirmOrder) {
          onConfirmOrder({
            id_pemesanan: result.id_pemesanan,
            tanggal: formatTanggal(tanggal),
            waktu_sesi: `${waktuMulai} - ${waktuSelesai}`,
            jenjang: jenjang,
            kelas: kelas,
            id_mapel: mapelSelected.id,
            nama_mapel: mataPelajaran,
            id_materi: selectedMateriId,
            nama_materi: materi,
            lokasi: locationAddress,
            koordinat: userLocation,
          });
        }
      }
    } catch (error) {
      console.error('Error pada saat submit form:', error);
      Alert.alert(
        'Gagal Menyimpan',
        error.message || 'Gagal terhubung ke server backend.',
      );
    }
  };

  const openInGoogleMaps = () => {
    const url = userLocation
      ? `https://www.google.com/maps/search/?api=1&query=${userLocation.latitude},${userLocation.longitude}`
      : 'https://maps.google.com';

    Linking.canOpenURL(url)
      ? Linking.openURL(url)
      : Alert.alert('Error', 'Tidak dapat membuka Google Maps');
  };

  // === KONSTANTA DROPDOWN ===
  const ITEM_HEIGHT = 44;
  const TIME_ITEM_HEIGHT = 40;
  const MAX_VISIBLE = 5;

  // === FLOATING DROPDOWN DENGAN SEARCH ===
  const FloatingDropdown = ({
    label,
    value,
    placeholder,
    options,
    isOpen,
    onToggle,
    onSelect,
    zIndex = 10,
  }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = options.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const listHeight = Math.min(
      filtered.length * ITEM_HEIGHT,
      MAX_VISIBLE * ITEM_HEIGHT,
    );
    const actualHeight = listHeight + 48; // List height + Search bar height

    return (
      <View style={[
        styles.fieldContainer, 
        { zIndex, elevation: zIndex },
        isOpen && { paddingBottom: actualHeight, marginBottom: 14 - actualHeight }
      ]}>
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
            <View style={styles.searchBarWrap}>
              <Search size={18} color="#999" style={{ marginRight: 6 }} />
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
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={{ maxHeight: listHeight || ITEM_HEIGHT }}
              nestedScrollEnabled={true}
              bounces={false}
              showsVerticalScrollIndicator={filtered.length > MAX_VISIBLE}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.length === 0 ? (
                <View style={styles.emptyResult}>
                  <Text style={styles.emptyResultText}>
                    Tidak ada hasil untuk "{searchQuery}"
                  </Text>
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
                    onPress={() => {
                      onSelect(item);
                      onToggle(false);
                      setSearchQuery('');
                    }}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.floatingItemText,
                        value === item && styles.floatingItemTextSelected,
                      ]}
                    >
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

  // === TIME FLOATING DROPDOWN DENGAN SEARCH ===
  const TimeFloatingDropdown = ({
    value,
    placeholder,
    options,
    isOpen,
    onToggle,
    onSelect,
    zIndex = 10,
  }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = options.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const listHeight = Math.min(
      filtered.length * TIME_ITEM_HEIGHT,
      MAX_VISIBLE * TIME_ITEM_HEIGHT,
    );

    return (
      <View style={[
        styles.timeDropdownWrap, 
        { zIndex },
        isOpen && { paddingBottom: 240 }
      ]}>
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
          <Text
            style={isOpen ? styles.chevronUpSmall : styles.chevronDownSmall}
          >
            ▼
          </Text>
        </TouchableOpacity>

        {isOpen && options.length > 0 && (
          <View style={styles.floatingListTime}>
            <View style={styles.searchBarWrapSmall}>
              <Search size={16} color="#999" style={{ marginRight: 6 }} />
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
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

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
                    onPress={() => {
                      onSelect(item);
                      onToggle(false);
                      setSearchQuery('');
                    }}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.floatingItemText,
                        value === item && styles.floatingItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // === TEMPLATE HTML UNTUK MAPS GRATIS (LEAFLET + OPENSTREETMAP) ===
  const latitudeSesi = userLocation?.latitude
    ? userLocation.latitude.toString()
    : '-6.9744';
  const longitudeSesi = userLocation?.longitude
    ? userLocation.longitude.toString()
    : '107.6303';

  const mapHtmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            // Inisialisasi map berdasarkan koordinat dinamis dari GPS murid
            var map = L.map('map', { zoomControl: false }).setView([${latitudeSesi}, ${longitudeSesi}], 15);
            
            // Load peta dari OpenStreetMap gratis
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Tambahkan marker pin di lokasi koordinat murid
            L.marker([${latitudeSesi}, ${longitudeSesi}]).addTo(map);
          </script>
        </body>
        </html>
    `;

  return (
    <View style={styles.container}>
      <PageHeader title="Pesan Sesi" onBack={handleBackPress} />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        scrollEnabled={!openWaktuMulai && !openWaktuSelesai && !openJenjang && !openKelas && !openMapel && !openMateri}
      >
        {/* Tanggal & Waktu Row */}
        <View style={[
          styles.rowContainer, 
          { zIndex: 100, elevation: 100 },
          (openWaktuMulai || openWaktuSelesai) && { marginBottom: 4 - 236 }
        ]}>
          <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.fieldLabel}>Tanggal</Text>
            <TouchableOpacity
              style={styles.dropdownBox}
              onPress={() => {
                closeAllDropdowns();
                setShowCalendar(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !tanggal && styles.placeholderText,
                ]}
              >
                {tanggal ? formatTanggal(tanggal) : 'Pilih Tanggal'}
              </Text>
              <Text>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.fieldLabel}>Waktu Sesi</Text>
            <View style={styles.timeRow}>
              <TimeFloatingDropdown
                value={waktuMulai}
                placeholder="Mulai"
                options={timeSlots}
                isOpen={openWaktuMulai}
                onToggle={val => {
                  closeAllDropdowns('waktuMulai');
                  setOpenWaktuMulai(val);
                }}
                onSelect={val => {
                  setWaktuMulai(val);
                  setWaktuSelesai('');
                  setOpenWaktuMulai(false);
                }}
                zIndex={99}
              />
              <Text style={styles.timeSeparator}>-</Text>
              <TimeFloatingDropdown
                value={waktuSelesai}
                placeholder="Selesai"
                options={getFilteredEndTimes()}
                isOpen={openWaktuSelesai}
                onToggle={val => {
                  if (!waktuMulai) {
                    showCustomAlert(
                      'Pilih Waktu Mulai',
                      'Pilih waktu mulai terlebih dahulu.',
                    );
                    return;
                  }
                  closeAllDropdowns('waktuSelesai');
                  setOpenWaktuSelesai(val);
                }}
                onSelect={val => {
                  setWaktuSelesai(val);
                  setOpenWaktuSelesai(false);
                }}
                zIndex={98}
              />
            </View>
          </View>
        </View>

        {/* Jenjang */}
        <FloatingDropdown
          label="Jenjang"
          value={jenjang}
          placeholder="Pilih Jenjang"
          options={jenjangOptions}
          isOpen={openJenjang}
          onToggle={val => {
            closeAllDropdowns('Jenjang');
            setOpenJenjang(val);
          }}
          onSelect={val => {
            setJenjang(val);
            setKelas('');
            setMataPelajaran('');
            setMateri('');
            setMapelSelected(null);
            setSelectedMateriId(null);
            setOpenJenjang(false);
          }}
          zIndex={90}
        />

        {/* Kelas */}
        {jenjang !== '' && (
          <FloatingDropdown
            label="Kelas"
            value={kelas}
            placeholder="Pilih Kelas"
            options={getKelasOptions()}
            isOpen={openKelas}
            onToggle={val => {
              closeAllDropdowns('Kelas');
              setOpenKelas(val);
            }}
            onSelect={val => {
              setKelas(val);
              setMateri('');
              setSelectedMateriId(null);
              setOpenKelas(false);
            }}
            zIndex={80}
          />
        )}

        {/* Mata Pelajaran */}
        <FloatingDropdown
          label="Mata Pelajaran"
          value={mataPelajaran}
          placeholder={
            loadingMapel
              ? 'Memuat mapel...'
              : !jenjang
                ? 'Pilih Jenjang dulu'
                : 'Pilih Mata Pelajaran'
          }
          options={daftarMapelDB.map(m => m.namaMapel)}
          isOpen={openMapel}
          onToggle={val => {
            if (!jenjang) {
              showCustomAlert('Pilih Jenjang', 'Pilih jenjang terlebih dahulu.');
              return;
            }
            closeAllDropdowns('Mata Pelajaran');
            setOpenMapel(val);
          }}
          onSelect={val => {
            const found = daftarMapelDB.find(m => m.namaMapel === val);
            setMataPelajaran(val);
            setMapelSelected(
              found ? { id: found.id, namaMapel: found.namaMapel } : null,
            );
            setMateri('');
            setMateriSelected(null);
            setOpenMapel(false);
          }}
          zIndex={70}
        />

        {/* Materi */}
        <FloatingDropdown
          label="Materi"
          value={materi}
          placeholder={
            loadingMateri
              ? 'Memuat materi...'
              : !mapelSelected || !kelas
                ? 'Pilih Mapel & Kelas dulu'
                : 'Pilih Materi'
          }
          options={daftarMateriDB.map(m => m.nama_materi)}
          isOpen={openMateri}
          onToggle={val => {
            if (!mapelSelected || !kelas) {
              showCustomAlert(
                'Belum Lengkap',
                'Pilih mata pelajaran dan kelas terlebih dahulu.',
              );
              return;
            }
            closeAllDropdowns('Materi');
            setOpenMateri(val);
          }}
          onSelect={val => {
            const found = daftarMateriDB.find(m => m.nama_materi === val);
            setMateri(val);
            setMateriSelected(found || null);
            setSelectedMateriId(found?.id_materi || null);
            setOpenMateri(false);
          }}
          zIndex={60}
        />

        {/* Map Section - Atas: Visual Peta, Bawah: Keterangan Alamat */}
        <View style={[styles.mapSection, { zIndex: 1 }]}>
          <View style={styles.mapsContainerWrapper}>
            {loadingLocation ? (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#284B7A" />
                <Text style={styles.mapLoadingText}>
                  Mengambil lokasi GPS...
                </Text>
              </View>
            ) : userLocation ? (
              /* 🗺️ VISUAL MAP: Menampilkan peta jalan nyata */
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                    html, body, #map { height: 100%; margin: 0; padding: 0; background-color: #FAFAFA; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    var map = L.map('map', { zoomControl: false, attributionControl: false })
                               .setView([${userLocation.latitude}, ${userLocation.longitude}], 16);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    L.marker([${userLocation.latitude}, ${userLocation.longitude}]).addTo(map);
                </script>
            </body>
            </html>
          `,
                }}
                style={styles.mapsStaticImageMedia}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.mapPreviewFallback}>
                <Text style={styles.mapPinEmoji}>⚠️</Text>
                <Text style={styles.mapTapText}>Lokasi belum tersedia</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={requestLocation}
                >
                  <Text style={styles.retryBtnText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 📍 KETERANGAN ALAMAT: Menampilkan locationAddress, bukan koordinat */}
          <TouchableOpacity
            style={styles.lokasiRow}
            onPress={openInGoogleMaps}
            activeOpacity={0.8}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E9F0F8', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={18} color="#284B7A" />
            </View>
            <View style={[styles.lokasiTextWrap, { marginLeft: 12 }]}>
              <Text style={styles.lokasiTitle}>
                Lokasi Sesi (Ketuk untuk Buka Rute)
              </Text>
              <Text style={styles.lokasiAddress} numberOfLines={2}>
                {locationAddress}
              </Text>
            </View>
            <View style={{ width: 24, alignItems: 'center', transform: [{ rotate: '180deg' }] }}>
              <Back size={14} color="#999" />
            </View>
          </TouchableOpacity>

          {/* Tombol ubah lokasi */}
          <TouchableOpacity
            style={styles.ubahLokasiBtn}
            onPress={() => setShowLocationPicker(true)}
            activeOpacity={0.8}
          >
            <MapsSVG size={14} color="#284B7A" />
            <Text style={styles.ubahLokasiBtnText}>Ubah Lokasi</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Tombol Konfirmasi */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <DimmedModal
        visible={showCalendar}
        onRequestClose={() => setShowCalendar(false)}
        placement="center"
        size="wide"
      >
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={prevMonth}
              style={styles.calendarNavBtn}
            >
              <Text style={styles.calendarNavText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>
              {MONTHS[calendarMonth]} {calendarYear}
            </Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={styles.calendarNavBtn}
            >
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
                onPress={() => item.day && selectDate(item.day)}
                disabled={isDateDisabled(item.day)}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isDateSelected(item.day) &&
                    styles.calendarDayTextSelected,
                    isDateDisabled(item.day) &&
                    styles.calendarDayTextDisabled,
                  ]}
                >
                  {item.day || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setShowCalendar(false)}
          >
            <Text style={styles.modalCloseBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </DimmedModal>
      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        initialLocation={userLocation}
        onConfirm={({ location, address }) => {
          setUserLocation(location);
          setLocationAddress(address);
          setShowLocationPicker(false);
        }}
        onCancel={() => setShowLocationPicker(false)}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type="gagal"
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  rowContainer: { flexDirection: 'row', marginBottom: 4 },
  fieldContainer: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
  },

  // Dropdown box
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  dropdownBoxOpen: {
    borderColor: '#284B7A',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: { fontSize: 14, color: '#333', flex: 1 },
  placeholderText: { color: '#AAAAAA' },
  chevronDown: { fontSize: 11, color: '#999' },
  chevronUp: {
    fontSize: 11,
    color: '#284B7A',
    transform: [{ rotate: '180deg' }],
  },

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
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    flex: 1,
    fontSize: 13,
    color: '#333',
    paddingVertical: 4,
    height: 36,
  },
  searchClear: {
    fontSize: 13,
    color: '#999',
    paddingHorizontal: 6,
    fontWeight: 'bold',
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
  emptyResult: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyResultText: { fontSize: 12, color: '#999', fontStyle: 'italic' },

  // Time row
  timeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeDropdownWrap: { flex: 1, position: 'relative' },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    gap: 4,
  },
  timeBoxOpen: {
    borderColor: '#284B7A',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  timeText: { fontSize: 12, color: '#2D9CDB', fontWeight: '600' },
  timeSeparator: {
    marginHorizontal: 4,
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
    paddingTop: 12,
  },
  chevronDownSmall: { fontSize: 8, color: '#999' },
  chevronUpSmall: {
    fontSize: 8,
    color: '#284B7A',
    transform: [{ rotate: '180deg' }],
  },

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
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingVertical: 2,
    height: 32,
  },

  // Style Baru untuk Map Section dan WebView Leaflet
  mapSection: {
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  mapsContainerWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapsStaticImageMedia: { width: '100%', height: '100%' },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  mapLoadingText: { marginTop: 10, fontSize: 13, color: '#666' },
  mapPreviewFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  mapPinEmoji: { fontSize: 40, marginBottom: 8 },
  mapTapText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  retryBtn: {
    marginTop: 12,
    backgroundColor: '#284B7A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  lokasiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  lokasiIcon: { fontSize: 20, marginRight: 10 },
  lokasiTextWrap: { flex: 1, marginhorizontal: 10 },
  lokasiTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  lokasiAddress: {
    fontSize: 12,
    color: '#666', // Warna teks alamat agar lebih terbaca
    marginTop: 2,
    lineHeight: 18,
  },
  locationChevronRightIcon: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    marginLeft: 8,
    alignSelf: 'center',
  },

  // Bottom button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#387C65',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#387C65',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Calendar
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
  calendarDaySelected: { backgroundColor: '#387C65', borderRadius: 20 },
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
  centeredLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  // Tambahkan baris ini di dalam StyleSheet.create({ ... })
  locationChevronRightIcon: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    marginLeft: 8,
    alignSelf: 'center',
  },
  ubahLokasiBtn: {
    flexDirection: 'row',       // ← tambah ini
    alignItems: 'center',
    justifyContent: 'center',   // ← tambah ini
    gap: 6,                     // ← jarak antara icon dan teks
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 19,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#284B7A',
    backgroundColor: '#F0F5FF',
  },
  ubahLokasiBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#284B7A',
  },
});

export default PesanSesiPage;
