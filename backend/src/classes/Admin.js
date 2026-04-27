const User = require('./User');

class Admin extends User{
  #adminLevel;
  constructor(username, email, password, namaUser, adminLevel) {
    super(username, email, password, namaUser)
    this.#adminLevel = adminLevel;
  }
  
  tambahMateri(daftarMateri, id, judul, konten) {
    // 1. Validasi: Cek apakah ID sudah ada di sistem
    const isExist = daftarMateri.some(m => m.id === id);
        
    if (isExist) {
      console.error(`Gagal: Materi dengan ID ${id} sudah ada!`);
        return false;
    }

    const materiBaru = new Materi(id, judul, konten, this.namaUser);

    // 3. Masukkan ke dalam daftar
    daftarMateri.push(materiBaru);

    console.log(`Sukses: Materi "${judul}" berhasil ditambahkan oleh Admin ${this.namaUser}.`);
    return true;
    }
  
  
  editMateri(daftarMateri, idMateri, dataBaru) {
    // 1. Cari objek materi berdasarkan ID-nya
    const materi = daftarMateri.find(m => m.id === idMateri);

    // 2. Jika materi tidak ditemukan, hentikan proses
    if (!materi) {
        console.error(`Gagal: Materi dengan ID ${idMateri} tidak ditemukan.`);
        return false;
    }

    // 3. Perbarui properti secara selektif
    // Jika dataBaru tidak memberikan nilai, gunakan nilai lama (|| materi.judul)
    materi.judul = dataBaru.judul || materi.judul;
    materi.konten = dataBaru.konten || materi.konten;
    
    // 4. Tambahkan jejak audit (opsional namun sangat disarankan)
    materi.terakhirDiedit = new Date().toLocaleString();
    materi.dieditOleh = this.namaUser;

    console.log(`Sukses: Materi ID ${idMateri} telah diperbarui oleh Admin ${this.namaUser}.`);
    return true;
  }

  
  hapusMateri(daftarMateri, idMateri) {
      // 1. Cari indeks (posisi) materi di dalam array berdasarkan ID
      const index = daftarMateri.findIndex(m => m.id === idMateri);

     // 2. Jika materi ditemukan (indeks tidak sama dengan -1)
      if (index !== -1) {
          // Ambil judul untuk keperluan log/notifikasi sebelum dihapus
          const judulTerhapus = daftarMateri[index].judul;
        
          // 3. Hapus 1 elemen dari posisi index tersebut
         daftarMateri.splice(index, 1);
        
          console.log(`Sukses: Materi "${judulTerhapus}" (ID: ${idMateri}) telah dihapus oleh Admin ${this.namaUser}.`);
         return true;
      }

    // 4. Jika tidak ditemukan
    console.error(`Gagal: Materi dengan ID ${idMateri} tidak ditemukan.`);
    return false;
  }

  getAllMateri(daftarMateri) {
     // 1. Validasi apakah daftar materi tersedia dan tidak kosong
     if (!daftarMateri || daftarMateri.length === 0) {
          console.log("Sistem: Belum ada materi yang tersedia untuk ditampilkan.");
         return [];
      }

      // 2. Berikan informasi jumlah materi yang ditemukan (audit log)
      console.log(`Sistem: Berhasil mengambil ${daftarMateri.length} materi.`);

      // 3. Kembalikan seluruh array materi
     return daftarMateri;
  }

  
  getAllHistoriSesi(daftarSesi) {
    console.log(`Sistem: Mengambil ${daftarSesi.length} riwayat sesi.`);
      return daftarSesi;
  }

  
  getAllUser(daftarUser) {
    // 1. Validasi: Cek apakah array daftarUser ada dan memiliki isi
    if (!daftarUser || daftarUser.length === 0) {
        console.log("Sistem: Belum ada pengguna yang terdaftar.");
        return [];
    }

    // 2. Berikan informasi jumlah pengguna yang ditemukan
    console.log(`Sistem: Ditemukan ${daftarUser.length} pengguna terdaftar.`);

    // 3. Kembalikan seluruh array user
    return daftarUser;
  }
}

module.exports = Admin;
