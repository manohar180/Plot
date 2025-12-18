const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['MD', 'Agent'], 
    default: 'Agent' 
  },
  // Agents are 'Pending' until MD approves them
  status: { 
    type: String, 
    enum: ['Active', 'Pending'], 
    default: 'Pending' 
  }
});

module.exports = mongoose.model('User', userSchema);