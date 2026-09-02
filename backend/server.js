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
const korwilRoutes = require('./src/routes/korwilRoutes');

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
app.use('/api/korwil', korwilRoutes);

// Health and Diagnostic Route
app.get('/api/health', async (req, res) => {
  const pool = require('./config/db');
  const hasDbUrl = Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL);
  let dbStatus = 'disconnected';
  let dbError = null;
  try {
    const [result] = await pool.query('SELECT 1 as test');
    dbStatus = 'connected';
  } catch (err) {
    dbError = err.message;
  }

  res.json({
    status: 'ok',
    isSupabase: pool.isSupabase,
    hasDatabaseUrl: hasDbUrl,
    dbStatus,
    dbError
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('LISAN API is running...');
});

// Centralized Error Handler
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

