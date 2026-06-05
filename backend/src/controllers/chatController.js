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

        // Fix BigInt serialization dari COUNT(*)
        const sanitized = JSON.parse(JSON.stringify(formattedData, (key, value) =>
            typeof value === 'bigint' ? Number(value) : value
        ));

        res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
        console.error("Error di getChatList:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};

// frontend/components/BottomNavbar.jsx atau file route terkait

exports.getMessages = async (req, res) => {
    try {
        const { id_guru, id_murid } = req.params;
        // 1. Ambil role user yang sedang membuka chat dari query parameter
        const { role } = req.query;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Parameter role (pembaca) wajib dikirim via query string"
            });
        }

        console.log(`getMessages dipanggil - Guru: ${id_guru} | Murid: ${id_murid} | Pembaca: ${role}`);

        const messages = await chatService.getAllMessagesByChatId(id_guru, id_murid);

        // 2. Oper parameter role ke service agar query UPDATE tahu siapa yang sedang membaca
        await chatService.markAsRead(id_guru, id_murid, role);

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

        await chatService.saveMessage(id_guru, id_murid, pengirim_role, isi_pesan);
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
        const room = await chatService.findOrCreateChatRoom(id_guru, id_murid);
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        console.error("❌ ERROR createOrGetChatRoom:", error.message, error.sqlMessage);
        res.status(500).json({ success: false, message: "Gagal membuat room chat" });
    }
};