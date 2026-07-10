const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const galleryRoutes = require('./src/routes/galleryRoutes');
const programRoutes = require('./src/routes/programRoutes');
const prokerRoutes = require('./src/routes/prokerRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const relawanRoutes = require('./src/routes/relawanRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const heroRoutes = require('./src/routes/heroRoutes');
const departemenRoutes = require('./src/routes/departemenRoutes');
const pengurusRoutes = require('./src/routes/pengurusRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const kaderRoutes = require('./src/routes/kaderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/proker', prokerRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/relawan', relawanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/departemen', departemenRoutes);
app.use('/api/pengurus', pengurusRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pesan', messageRoutes);
app.use('/api/kader', kaderRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('LISAN API is running...');
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
