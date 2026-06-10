export const mapService = {
  /**
   * Mengambil alamat lengkap berdasarkan latitude dan longitude (Geocoding)
   * Menggunakan layanan eksternal Nominatim OpenStreetMap
   */
  getAlamatByKoordinat: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'HumanaApp/1.0' } }
      );
      
      if (!response.ok) {
         throw new Error(`Nominatim returned status ${response.status}`);
      }
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Nominatim returned invalid JSON');
      }
      
      if (data && data.display_name) {
        return { success: true, alamat: data.display_name };
      }
      return { success: false, alamat: `${lat}, ${lng}` };
    } catch (error) {
      console.error('Error in getAlamatByKoordinat:', error);
      return { success: false, alamat: `${lat}, ${lng}`, error: error.message };
    }
  },

  /**
   * Mengambil koordinat berdasarkan alamat lengkap (Geocoding / Search)
   * Menggunakan layanan eksternal Nominatim OpenStreetMap
   */
  searchAlamat: async (alamatText) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(alamatText)}&limit=1`,
        { headers: { 'User-Agent': 'HumanaApp/1.0' } }
      );
      
      if (!response.ok) {
         throw new Error(`Nominatim returned status ${response.status}`);
      }
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Nominatim returned invalid JSON');
      }
      
      if (data && data.length > 0) {
        return { 
          success: true, 
          latitude: parseFloat(data[0].lat), 
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Error in searchAlamat:', error);
      return { success: false, error: error.message };
    }
  }
};
