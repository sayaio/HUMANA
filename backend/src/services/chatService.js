// Ambil daftar chat terbaru per pasangan guru-murid
const db = require('../database');
const getLatestChatList = async (userId, role) => {
  const field = role === 'murid' ? 'id_murid' : 'id_guru';
  const query = `
    SELECT c.*, G.nama_guru, M.nama_murid
    FROM Chat c
    JOIN Guru G ON c.id_guru = G.id_guru
    JOIN Murid M ON c.id_murid = M.id_murid
    WHERE c.id_chat IN (
      SELECT MAX(id_chat) 
      FROM Chat 
      WHERE ${field} = ?
      GROUP BY id_guru, id_murid
    )
    ORDER BY c.timestamp DESC
  `;
  const rows = await db.query(query, [userId]); // pakai query(), bukan execute()
  return rows;
};

// Ambil semua pesan dalam satu percakapan
const getAllMessagesByChatId = async (id_guru, id_murid) => {
  const query = `
    SELECT * FROM Chat 
    WHERE id_guru = ? AND id_murid = ? 
    ORDER BY timestamp ASC
  `;
  const rows = await db.query(query, [id_guru, id_murid]);
  return rows;
};

// Simpan pesan baru
const saveMessage = async (id_guru, id_murid, pengirim_role, isi_pesan) => {
  const query = `
    INSERT INTO Chat (id_guru, id_murid, pengirim_role, isi_pesan, timestamp) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  const result = await db.query(query, [id_guru, id_murid, pengirim_role, isi_pesan]);
  return result;
};

// Tandai pesan sebagai sudah dibaca
const markAsRead = async (id_guru, id_murid) => {
  const query = `
    UPDATE Chat SET is_read = 1 
    WHERE id_guru = ? AND id_murid = ?
  `;
  const result = await db.query(query, [id_guru, id_murid]);
  return result;
};

module.exports = {
  getLatestChatList,
  getAllMessagesByChatId,  // ← pastikan ada ini
  saveMessage,
  markAsRead
};