const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Plot = require('../models/Plot');

// GET all pending requests (Sorted by Newest)
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Pending' })
      .populate('projectId', 'name')     
      .populate('plotId', 'plotNumber')
      .sort({ createdAt: -1 }); // <--- UPDATED: Newest first

    // Filter out corrupted requests
    const validRequests = requests.filter(req => req.projectId && req.plotId);

    res.json(validRequests);
  } catch (err) { 
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: err.message }); 
  }
});

// POST create request (Agent)
router.post('/', async (req, res) => {
  try {
    const { agentId, agentName, projectId, plotId, requestedStatus, customerName, customerMobile } = req.body;

    // Check duplicate pending requests
    const existing = await Request.findOne({ plotId, status: 'Pending' });
    if (existing) {
        return res.status(400).json({ message: "A request for this plot is already pending." });
    }

    const newRequest = new Request({
        agentId, agentName, projectId, plotId, requestedStatus, customerName, customerMobile
    });

    await newRequest.save();
    res.json(newRequest);
  } catch (err) { 
      console.error("Error creating request:", err);
      res.status(500).json({ error: err.message }); 
  }
});

// PUT Approve/Reject Request (MD)
router.put('/:id/action', async (req, res) => {
  try {
    const { action } = req.body; 
    const request = await Request.findById(req.params.id);
    
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (action === 'Approved') {
      await Plot.findByIdAndUpdate(request.plotId, {
        status: request.requestedStatus,
        customerName: request.customerName,
        customerMobile: request.customerMobile,
        soldBy: request.agentName, 
        lastUpdated: new Date()
      });
      request.status = 'Approved';
    } else {
      request.status = 'Rejected';
    }
    
    await request.save();
    res.json({ message: `Request ${action}` });
  } catch (err) { 
      console.error("Error processing request:", err);
      res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;