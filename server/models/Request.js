const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentName: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  plotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plot' },
  
  // The data the agent WANTS to change
  requestedStatus: { type: String },
  customerName: { type: String },
  customerMobile: { type: String },
  
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);