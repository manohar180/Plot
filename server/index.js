const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/user'); // Ensure filename matches exactly (User.js)

dotenv.config();
const app = express();

// --- 1. DEPLOYMENT CONFIG: CORS ---
// Allow requests from anywhere (*) so Vercel can talk to Render
app.use(cors({
    origin: '*', 
    credentials: true
}));

app.use(express.json());

// --- 2. ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/plots', require('./routes/plots')); // Removed duplicate line

// --- 3. DYNAMIC PORT (REQUIRED FOR RENDER) ---
const PORT = process.env.PORT || 5000;

// --- 4. DB CONNECTION & START SERVER ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    
    // Seed MD (Admin) if not exists
    const md = await User.findOne({ role: 'MD' });
    if (!md) {
      const hash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Chaitanya MD',
        email: 'admin@chaitanya.com',
        password: hash,
        role: 'MD',
        status: 'Active'
      });
      console.log("👑 MD Created: admin@chaitanya.com / admin123");
    }

    // Start Listening
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log("❌ DB Connection Error:", err));