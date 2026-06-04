const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'src/.env') });

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./appRouting');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/api', apiRoutes);
// Tambah baris ini setelah inisialisasi app
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Backend Humana berjalan di http://10.0.2.2:${PORT}`);
});