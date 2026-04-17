const express = require('express');
const cors = require('cors');
const apiRoutes = require('./appRouting');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Backend Humana berjalan di http://localhost:${PORT}`);
});