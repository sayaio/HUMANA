const chatService = require('../services/chatService');

exports.getChatList = async (req, res) => {
    try {
        const { userId, role } = req.query;

        if (!userId || !role) {
            return res.status(400).json({
                success: false,
                message: "Parameter userId dan role wajib diisi"
            });
        }

        const data = await chatService.getLatestChatList(userId, role);
        const formattedData = Array.isArray(data) ? data : (data ? [data] : []);
        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Error di getChatList:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { id_guru, id_murid } = req.params;
        console.log("getMessages dipanggil - id_guru:", id_guru, "| id_murid:", id_murid); // tambah ini

        const messages = await chatService.getAllMessagesByChatId(id_guru, id_murid);
        console.log("Hasil query messages:", messages); // tambah ini

        await chatService.markAsRead(id_guru, id_murid);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error di getMessages:", error); // ubah ini agar tampil detail
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

        await chatService.saveMessage(id_guru, id_murid, pengirim_role, isi_pesan);

        // Langsung return success, tidak perlu cek hasil insert
        res.status(201).json({ success: true, message: "Pesan berhasil dikirim" });
    } catch (error) {
        console.error("Error di sendMessage:", error);
        res.status(500).json({ success: false, message: "Gagal mengirim pesan" });
    }
};