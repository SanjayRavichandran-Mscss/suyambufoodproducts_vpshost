// const express = require('express');
// const cors = require('cors');
// const db = require('./config/db');
// const adminRoutes = require('./routes/adminRoutes');
// const customerRoutes = require('./routes/customerRoutes');
// const path = require('path');
// require('dotenv').config({ silent: true });
// const listEndpoints = require('express-list-endpoints'); // ✅ for debugging

// const app = express();
// const PORT = process.env.PORT || 5000;

// console.log("🚀 Starting server...");

// // Serve static files
// app.use('/productImages', express.static(path.join(__dirname, 'public/productImages')));

// app.use(cors({
//   origin: ['http://localhost:5173','https://suyambufoodproducts-demohost.vercel.app','https://suyambufoods.com/api','https://www.suyambufoods.com'],
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());

// // Test API
// app.get('/test', (req, res) => {
//   console.log("✅ /api/test called");
//   res.status(200).json({ message: 'Server is running successfully' });
// });

// // Routes
// console.log("✅ Mounting routes...");
// app.use('/admin', adminRoutes);
// app.use('/customer', customerRoutes);

// // DB check
// async function checkDbConnection() {
//   try {
//     await db.query('SELECT 1');
//     console.log('✅ Database connection successful');
//     return true;
//   } catch (error) {
//     console.error('❌ Database connection failed:', error.message);
//     return false;
//   }
// }

// // Start
// async function startServer() {
//   const isDbConnected = await checkDbConnection();
//   if (isDbConnected) {
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);

//       // ✅ print endpoints
//       const endpoints = listEndpoints(app);
//       console.log("✅ Registered endpoints:");
//       console.table(endpoints);
//     });
//   } else {
//     console.error('❌ Server failed to start due to DB connection error.');
//     process.exit(1);
//   }
// }

// startServer();












const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const path = require('path');
require('dotenv').config({ silent: true });
const listEndpoints = require('express-list-endpoints');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting server...");

// Serve static files
app.use('/productImages', express.static(path.join(__dirname, 'public/productImages')));

// CORS setup (added IP fallback and HTTPS for prod)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://72.60.202.205:5173',
    'https://suyambufoodproducts-demohost.vercel.app',
    'https://suyambufoods.com',
    'https://www.suyambufoods.com',
    'http://72.60.202.205'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // Enable if using cookies/auth; otherwise, set to false
}));

// Body parsers for JSON and URL-encoded (essential for multipart/form-data handling)
app.use(express.json({ limit: '50mb' }));  // Increased limit for files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));  // For form data

// Optional: Global multer setup for any file uploads (but recommend per-route for security)
// If you want global handling for any multipart, uncomment below (adjust fileFilter for "any kind")
// const multer = require('multer');
// const upload = multer({ 
//   dest: 'public/uploads/',  // Or custom storage
//   limits: { fileSize: 100 * 1024 * 1024 },  // 100MB max
//   fileFilter: (req, file, cb) => {
//     // Accept any file type (no filter – "any kind")
//     cb(null, true);
//   }
// });
// app.use(upload.any());  // Parses any files in multipart requests

// Test API
app.get('/api/test', (req, res) => {
  console.log("✅ /api/test called");
  res.status(200).json({ message: 'Server is running successfully' });
});

// ------------------ API ROUTES ------------------
// Prefix with /api to match Nginx proxy
app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);

// ------------------ DB CHECK ------------------
async function checkDbConnection() {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// ------------------ START SERVER ------------------
async function startServer() {
  const isDbConnected = await checkDbConnection();
  if (isDbConnected) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      const endpoints = listEndpoints(app);
      console.log("✅ Registered endpoints:");
      console.table(endpoints);
    });
  } else {
    console.error('❌ Server failed to start due to DB connection error.');
    process.exit(1);
  }
}

startServer();