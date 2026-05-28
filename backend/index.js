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
const timeTetrisRouter = require('./routes/timeTetris');

app.use('/api/agents', actionBiasRouter);
app.use('/api/agents', timeTetrisRouter);

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
