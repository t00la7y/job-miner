
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
const connectDB = require('./config/db');
const jobRoutes = require('./routes/jobs');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Job Miner API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
