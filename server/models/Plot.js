const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  plotNumber: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Booked', 'Sold'], 
    default: 'Available' 
  },
  customerName: { type: String, default: '' },
  customerMobile: { type: String, default: '' },
  soldBy: { type: String, default: '' }, // Agent Name
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plot', plotSchema);