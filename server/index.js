const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const path = require('path');
require('dotenv').config({ silent: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use('/productImages', express.static(path.join(__dirname, 'public/productImages')));

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://suyambufoodproducts-demohost.vercel.app',
    'http://localhost:5000',
    'https://www.suyambufoods.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test API
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Server is running successfully' });
});

// ------------------ API ROUTES ------------------
// Add `/api` prefix to match frontend/Nginx
app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

// ------------------ DB CHECK ------------------
async function checkDbConnection() {
  try {
    await db.query('SELECT 1');
    console.log('Database connection to suyambu_stores successful');
    return true;
  } catch (error) {
    console.error('Database connection to suyambu_stores failed:', error.message);
    return false;
  }
}

// ------------------ START SERVER ------------------
async function startServer() {
  const isDbConnected = await checkDbConnection();
  if (isDbConnected) {
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  } else {
    console.error('Server failed to start due to DB connection error.');
    process.exit(1);
  }
}

// NEW: Global error handler to force JSON responses (prevents HTML errors)
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

startServer();