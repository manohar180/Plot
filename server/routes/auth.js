const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'Agent', status: 'Pending' });
    
    await user.save();
    res.status(201).json({ message: "Registration successful. Wait for MD approval." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status !== 'Active') return res.status(403).json({ message: "Account Pending Approval" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });

  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. GET PENDING AGENTS
router.get('/pending-agents', async (req, res) => {
    try {
        const agents = await User.find({ role: 'Agent', status: 'Pending' });
        res.json(agents);
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// 4. APPROVE AGENT
router.put('/approve-agent/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { status: 'Active' });
        res.json({ message: "Agent Approved" });
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// 5. GET ACTIVE AGENTS
router.get('/active-agents', async (req, res) => {
    try {
        const agents = await User.find({ role: 'Agent', status: 'Active' }).select('name _id');
        res.json(agents);
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// 6. UPDATE PROFILE (NEW!)
router.put('/update-profile/:id', async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect Current Password" });

    // 2. Update Details
    if(name) user.name = name;
    if(email) user.email = email;

    // 3. Update Password if provided
    if (newPassword && newPassword.length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: "Profile Updated Successfully" });
  } catch (err) { 
      console.error(err);
      res.status(500).json({ message: err.message }); 
  }
});

module.exports = router;