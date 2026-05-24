const db = require('../database');

const getLatestChatList = async (userId, role) => {
  const field = role === 'murid' ? 'id_murid' : 'id_guru';

  // Kita gunakan Subquery untuk mengambil ID chat terbaru per pasangan Guru-Murid
  const query = `
    SELECT c.*, G.nama_guru, M.nama_murid
    FROM Chat c
    JOIN Guru G ON c.id_guru = G.id_guru
    JOIN Murid M ON c.id_murid = M.id_murid
    WHERE c.id_chat IN (
      SELECT MAX(id_chat) 
      FROM Chat 
      GROUP BY id_guru, id_murid
    )
    AND c.${field} = ?
    ORDER BY c.id_chat DESC
  `;

  const [rows] = await db.execute(query, [userId]);
  return rows;
};

// Mengambil pesan dalam satu percakapan antara guru dan murid
const getAllMessagesByChatId = async (id_guru, id_murid) => {
  const query = "SELECT * FROM Chat WHERE id_guru = ? AND id_murid = ? ORDER BY id_chat ASC";
  const [rows] = await db.execute(query, [id_guru, id_murid]);
  return rows;
};

// Menyimpan pesan baru ke tabel Chat
const saveMessage = async (id_guru, id_murid, isi_pesan) => {
  const query = "INSERT INTO Chat (id_guru, id_murid, isi_pesan) VALUES (?, ?, ?)";
  const [result] = await db.execute(query, [id_guru, id_murid, isi_pesan]);
  return result;
};

module.exports = {
  getLatestChatList,
  getAllMessagesByChatId,
  saveMessage
};