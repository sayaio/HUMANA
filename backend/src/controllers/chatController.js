const { fetchQuery, executeQuery } = require('../utils/dbHelper');

exports.getChatList = async (req, res) => {
    try {
        const { userId, role } = req.query;

        if (!userId || !role) {
            return res.status(400).json({
                success: false,
                message: "Parameter userId dan role wajib diisi"
            });
        }

        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

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
              p.status_pemesanan IN ('dikonfirmasi', 'menunggu konfirmasi')
              OR (
                p.status_pemesanan = 'selesai' 
                AND TIMESTAMPDIFF(HOUR, p.waktu_selesai, NOW()) <= 48
              )
            )
          )
          ORDER BY c.timestamp DESC
          LIMIT ? OFFSET ?
        `;

        const data = await fetchQuery(query, [senderField, userId, limit, offset]);

        console.log('sample data[0]:', data[0]);
        const formattedData = Array.isArray(data) ? data : (data ? [data] : []);
        
        // Convert BigInt to Number
        const serializedData = formattedData.map(item => {
            const newItem = { ...item };
            for (const key in newItem) {
                if (typeof newItem[key] === 'bigint') {
                    newItem[key] = Number(newItem[key]);
                }
            }
            return newItem;
        });

        res.status(200).json({ success: true, data: serializedData });
    } catch (error) {
        console.error("Error di getChatList:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { id_guru, id_murid } = req.params;
        const { role } = req.query;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Parameter role (pembaca) wajib dikirim via query string"
            });
        }

        console.log(`getMessages dipanggil - Guru: ${id_guru} | Murid: ${id_murid} | Pembaca: ${role}`);

        const queryMessages = `
            SELECT *,
              DATE_FORMAT(CONVERT_TZ(timestamp, '+00:00', '+07:00'), '%H:%i') AS waktu_pesan
            FROM Chat 
            WHERE id_guru = ? AND id_murid = ? 
            ORDER BY timestamp ASC
        `;
        const messages = await fetchQuery(queryMessages, [id_guru, id_murid]);

        const queryUpdate = `
            UPDATE Chat 
            SET is_read = 1 
            WHERE id_guru = ? 
              AND id_murid = ? 
              AND pengirim_role != ?
        `;
        await executeQuery(queryUpdate, [id_guru, id_murid, role]);

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error di getMessages:", error);
        res.status(500).json({ success: false, message: "Gagal memuat pesan" });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { id_guru, id_murid, pengirim_role, isi_pesan } = req.body;
        console.log("sendMessage payload:", req.body);

        if (!id_guru || !id_murid || !pengirim_role || !isi_pesan || !isi_pesan.trim()) {
            return res.status(400).json({ success: false, message: "Data pesan tidak lengkap" });
        }

        const validRoles = ['guru', 'murid'];
        if (!validRoles.includes(pengirim_role)) {
            return res.status(400).json({ success: false, message: "Role tidak valid" });
        }

        const query = `
            INSERT INTO Chat (id_guru, id_murid, pengirim_role, isi_pesan, is_read, timestamp) 
            VALUES (?, ?, ?, ?, 0, NOW())
        `;
        await executeQuery(query, [id_guru, id_murid, pengirim_role, isi_pesan]);

        res.status(201).json({ success: true, message: "Pesan berhasil dikirim" });
    } catch (error) {
        console.error("Error di sendMessage:", error);
        res.status(500).json({ success: false, message: "Gagal mengirim pesan" });
    }
};

exports.createOrGetChatRoom = async (req, res) => {
    try {
        const { id_guru, id_murid } = req.body;
        if (!id_guru || !id_murid) {
            return res.status(400).json({ success: false, message: "id_guru dan id_murid wajib diisi" });
        }
        
        const existing = await fetchQuery(
            'SELECT * FROM Chat WHERE id_guru = ? AND id_murid = ? LIMIT 1',
            [id_guru, id_murid]
        );
        let room;
        if (existing.length > 0) {
            room = existing[0];
        } else {
            await executeQuery(
                `INSERT INTO Chat (id_guru, id_murid, pengirim_role, isi_pesan, timestamp) 
                 VALUES (?, ?, 'guru', 'Sesi telah dikonfirmasi. Silakan mulai percakapan!', NOW())`,
                [id_guru, id_murid]
            );
            const newRoom = await fetchQuery(
                'SELECT * FROM Chat WHERE id_guru = ? AND id_murid = ? LIMIT 1',
                [id_guru, id_murid]
            );
            room = newRoom[0];
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        console.error("❌ ERROR createOrGetChatRoom:", error.message, error.sqlMessage);
        res.status(500).json({ success: false, message: "Gagal membuat room chat" });
    }
};