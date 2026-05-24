const chatService = require('../services/chatService');

/**
 * Mengambil daftar chat terakhir untuk User (Guru/Murid)
 */
exports.getChatList = async (req, res) => {
    try {
        const { userId, role } = req.query;

        // Validasi input
        if (!userId || !role) {
            return res.status(400).json({
                success: false,
                message: "Parameter userId dan role wajib diisi"
            });
        }

        const data = await chatService.getLatestChatList(userId, role);

        // Memastikan hasil selalu berupa array
        const formattedData = Array.isArray(data) ? data : (data ? [data] : []);

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Error di getChatList:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};

/**
 * Mengambil semua pesan di dalam satu ruang chat
 */
exports.getMessages = async (req, res) => {
    try {
        const { id_guru, id_murid } = req.params; // Mengambil dua parameter
        const messages = await chatService.getAllMessagesByChatId(id_guru, id_murid);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal memuat pesan" });
    }
};

/**
 * Mengirim pesan baru ke database
 */
exports.sendMessage = async (req, res) => {
    try {
        const { id_chat, pengirim_id, pengirim_role, isi_pesan } = req.body;

        // Validasi data
        if (!id_chat || !pengirim_id || !isi_pesan || !isi_pesan.trim()) {
            return res.status(400).json({
                success: false,
                message: "Data pesan tidak lengkap atau kosong"
            });
        }

        // Validasi role sederhana
        const validRoles = ['guru', 'murid'];
        if (pengirim_role && !validRoles.includes(pengirim_role)) {
            return res.status(400).json({ success: false, message: "Role tidak valid" });
        }

        const newMessage = await chatService.saveMessage(id_chat, pengirim_id, pengirim_role, isi_pesan);

        res.status(201).json({
            success: true,
            message: "Pesan berhasil dikirim",
            data: newMessage
        });
    } catch (error) {
        console.error("Error di sendMessage:", error);
        res.status(500).json({ success: false, message: "Gagal mengirim pesan" });
    }
};