const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/plots', require('./routes/plots'));
app.use('/api/plots', require('./routes/plots'));

// DB & Seed MD
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    // Seed MD
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
  })
  .catch(err => console.log(err));

app.listen(process.env.PORT, () => console.log(`🚀 Server on port ${process.env.PORT}`));