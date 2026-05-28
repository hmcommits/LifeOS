const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LifeOS Backend is running' });
});

const actionBiasRouter = require('./routes/actionBias');
app.use('/api/agents', actionBiasRouter);

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
