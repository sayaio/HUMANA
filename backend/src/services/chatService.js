// Ambil daftar chat terbaru per pasangan guru-murid
const db = require('../database');
const getLatestChatList = async (userId, role) => {
  const field = role === 'murid' ? 'id_murid' : 'id_guru';
  const senderField = role === 'murid' ? 'guru' : 'murid';

  const query = `
  SELECT c.*, G.nama_guru, M.nama_murid,
    DATE_FORMAT(CONVERT_TZ(c.timestamp, '+00:00', '+07:00'), '%H:%i') AS waktu_chat,
    CAST((
      SELECT COUNT(*) FROM Chat unread
      WHERE unread.id_guru = c.id_guru
      AND unread.id_murid = c.id_murid
      AND unread.is_read = 0
      AND unread.pengirim_role = ?
    ) AS UNSIGNED) AS unread_count
  FROM Chat c
  JOIN Guru G ON c.id_guru = G.id_guru
  JOIN Murid M ON c.id_murid = M.id_murid
  WHERE c.id_chat IN (
    SELECT MAX(id_chat) 
    FROM Chat 
    WHERE ${field} = ?
    GROUP BY id_guru, id_murid
  )
  AND EXISTS (
    SELECT 1 FROM Pemesanan p
    WHERE p.id_guru = c.id_guru 
    AND p.id_murid = c.id_murid
    AND (
      p.status_pemesanan IN ('dikonfirmasi', 'menunggu konfirmasi', 'berlangsung', 'menunggu pembayaran')
      OR (
        p.status_pemesanan = 'selesai' 
        AND TIMESTAMPDIFF(HOUR, p.waktu_selesai, NOW()) <= 48
      )
    )
  )
  ORDER BY c.timestamp DESC
  `;

  return await db.query(query, [senderField, userId]);
};

// Ambil semua pesan dalam satu percakapan
const getAllMessagesByChatId = async (id_guru, id_murid) => {
  const query = `
    SELECT *,
      DATE_FORMAT(CONVERT_TZ(timestamp, '+00:00', '+07:00'), '%H:%i') AS waktu_pesan
    FROM Chat 
    WHERE id_guru = ? AND id_murid = ? 
    ORDER BY timestamp ASC
  `;
  const rows = await db.query(query, [id_guru, id_murid]);
  return rows;
};

// Simpan pesan baru
const saveMessage = async (id_guru, id_murid, pengirim_role, isi_pesan) => {
  const query = `
    INSERT INTO Chat (id_guru, id_murid, pengirim_role, isi_pesan, is_read, timestamp) 
    VALUES (?, ?, ?, ?, 0, NOW())
  `; // 👈 Kuncinya di sini: Tambahkan kolom is_read dan isi dengan angka 0

  const result = await db.query(query, [id_guru, id_murid, pengirim_role, isi_pesan]);
  return result;
};

// Tandai pesan sebagai sudah dibaca
// ... (kode atas seperti getLatestChatList, getAllMessagesByChatId, saveMessage tetap sama)

// Tandai pesan sebagai sudah dibaca (Hanya untuk pesan dari lawan bicara)
const markAsRead = async (id_guru, id_murid, pembacaRole) => {
  const query = `
    UPDATE Chat 
    SET is_read = 1 
    WHERE id_guru = ? 
      AND id_murid = ? 
      AND pengirim_role != ?
  `;
  // Jika pembacaRole adalah 'murid', maka pengirim_role != 'murid' (artinya pesan dari guru yang di-mark)
  const result = await db.query(query, [id_guru, id_murid, pembacaRole]);
  return result;
};

const findOrCreateChatRoom = async (id_guru, id_murid) => {
  // Cek apakah sudah ada row untuk pasangan ini
  const existing = await db.query(
    'SELECT * FROM Chat WHERE id_guru = ? AND id_murid = ? LIMIT 1',
    [id_guru, id_murid]
  );
  if (existing.length > 0) return existing[0];

  // Belum ada, insert row baru dengan pesan placeholder
  await db.query(
    `INSERT INTO Chat (id_guru, id_murid, pengirim_role, isi_pesan, timestamp) 
      VALUES (?, ?, 'guru', 'Sesi telah dikonfirmasi. Silakan mulai percakapan!', NOW())`,
    [id_guru, id_murid]
  );

  const newRoom = await db.query(
    'SELECT * FROM Chat WHERE id_guru = ? AND id_murid = ? LIMIT 1',
    [id_guru, id_murid]
  );
  return newRoom[0];
};

module.exports = {
  getLatestChatList,
  getAllMessagesByChatId,
  saveMessage,
  markAsRead, // ← Expose fungsi yang sudah di-update
  findOrCreateChatRoom
};