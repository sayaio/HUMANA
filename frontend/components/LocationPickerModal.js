// src/components/LocationPickerModal.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
  FlatList,
  Keyboard,
} from 'react-native';
import { WebView } from 'react-native-webview';

const LocationPickerModal = ({ visible, initialLocation, onConfirm, onCancel }) => {
  // === STATE ===
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || { latitude: -6.9744, longitude: 107.6303 }
  );
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const webViewRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // === REVERSE GEOCODE (koordinat → alamat) ===
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'User-Agent': 'HumanaApp/1.0' } }
      );
      const data = await res.json();
      if (data?.display_name) {
        setSelectedAddress(data.display_name);
      } else {
        setSelectedAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      setSelectedAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // === SEARCH ALAMAT (teks → daftar hasil) ===
  const searchAddress = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=id`,
        { headers: { 'User-Agent': 'HumanaApp/1.0' } }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search saat user ketik
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchAddress(text), 600);
  };

  // Pilih hasil search → pindahkan marker di peta
  const handleSelectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const newLocation = { latitude: lat, longitude: lng };

    setSelectedLocation(newLocation);
    setSelectedAddress(item.display_name);
    setSearchResults([]);
    setSearchQuery('');
    Keyboard.dismiss();

    // Kirim perintah ke WebView untuk pindah marker
    webViewRef.current?.injectJavaScript(`
      moveMarker(${lat}, ${lng});
      true;
    `);
  };

  // Terima pesan dari WebView saat user tap/drag marker
  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerMoved') {
        const newLoc = { latitude: data.lat, longitude: data.lng };
        setSelectedLocation(newLoc);
        reverseGeocode(data.lat, data.lng);
      } else if (data.type === 'mapReady') {
        setMapReady(true);
        // Reverse geocode lokasi awal
        reverseGeocode(
          initialLocation?.latitude ?? -6.9744,
          initialLocation?.longitude ?? 107.6303
        );
      }
    } catch {}
  }, [reverseGeocode, initialLocation]);

  const handleConfirm = () => {
    onConfirm({
      location: selectedLocation,
      address: selectedAddress,
    });
  };

  // === HTML PETA LEAFLET dengan marker draggable + tap-to-move ===
  const initLat = initialLocation?.latitude ?? -6.9744;
  const initLng = initialLocation?.longitude ?? 107.6303;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .crosshair-hint {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          z-index: 1000;
          pointer-events: none;
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="crosshair-hint">📍 Tap peta atau drag marker</div>
      <script>
        var map = L.map('map', { zoomControl: true, attributionControl: false })
                   .setView([${initLat}, ${initLng}], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Marker draggable
        var marker = L.marker([${initLat}, ${initLng}], { draggable: true }).addTo(map);

        function sendLocation(lat, lng) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerMoved',
            lat: lat,
            lng: lng
          }));
        }

        // Drag marker selesai
        marker.on('dragend', function(e) {
          var pos = marker.getLatLng();
          sendLocation(pos.lat, pos.lng);
        });

        // Tap di peta → pindah marker
        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          sendLocation(e.latlng.lat, e.latlng.lng);
        });

        // Fungsi dipanggil dari React Native (saat search dipilih)
        function moveMarker(lat, lng) {
          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 16);
          sendLocation(lat, lng);
        }

        // Beritahu RN bahwa map sudah siap
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      </script>
    </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>✕ Batal</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilih Lokasi</Text>
          <View style={styles.headerBtn} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari alamat atau nama tempat..."
              placeholderTextColor="#AAAAAA"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCorrect={false}
              returnKeyType="search"
            />
            {(isSearching) ? (
              <ActivityIndicator size="small" color="#284B7A" />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Dropdown hasil search */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.place_id?.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.searchResultIcon}>📍</Text>
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Peta */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            onMessage={handleWebViewMessage}
            scrollEnabled={false}
            style={styles.map}
          />
          {!mapReady && (
            <View style={styles.mapOverlayLoading}>
              <ActivityIndicator size="large" color="#284B7A" />
              <Text style={styles.mapLoadingText}>Memuat peta...</Text>
            </View>
          )}
        </View>

        {/* Panel bawah: preview alamat + tombol konfirmasi */}
        <View style={styles.bottomPanel}>
          <View style={styles.addressPreview}>
            
            <View style={styles.addressTextWrap}>
              <Text style={styles.addressLabel}>Lokasi dipilih:</Text>
              {isGeocoding ? (
                <View style={styles.geocodingRow}>
                  <ActivityIndicator size="small" color="#284B7A" />
                  <Text style={styles.geocodingText}>  Mendapatkan alamat...</Text>
                </View>
              ) : (
                <Text style={styles.addressText} numberOfLines={2}>
                  {selectedAddress || 'Tap peta untuk memilih lokasi'}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, (!selectedAddress || isGeocoding) && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!selectedAddress || isGeocoding}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>Gunakan Lokasi Ini</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 45 : 50,
  },
  headerBtn: { width: 80 },
  headerBtnText: { fontSize: 14, color: '#E74C3C', fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    elevation: 100,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 2 },
  searchClear: { fontSize: 13, color: '#999', fontWeight: 'bold', paddingHorizontal: 4 },

  searchResultsContainer: {
    position: 'absolute',
    top: 62,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 220,
    zIndex: 200,
    elevation: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultIcon: { fontSize: 14, marginRight: 8, marginTop: 1 },
  searchResultText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 18 },

  // Map
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  mapOverlayLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: { marginTop: 10, fontSize: 13, color: '#666' },

  // Bottom panel
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 45 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  addressPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  addressIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  addressTextWrap: { flex: 1 },
  addressLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 3 },
  addressText: { fontSize: 13, color: '#333', lineHeight: 18 },
  geocodingRow: { flexDirection: 'row', alignItems: 'center' },
  geocodingText: { fontSize: 13, color: '#999', fontStyle: 'italic' },

  confirmBtn: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmBtnDisabled: { backgroundColor: '#AAAAAA', shadowOpacity: 0 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default LocationPickerModal;