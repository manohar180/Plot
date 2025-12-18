const express = require('express');
const router = express.Router();
const Plot = require('../models/Plot');
const Project = require('../models/Project');

// 1. UPDATE PLOT DETAILS (Existing)
router.put('/:id', async (req, res) => {
    try {
        const updatedPlot = await Plot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPlot);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. BULK ADD PLOTS (New!)
router.post('/bulk-add', async (req, res) => {
    try {
        const { projectId, count } = req.body;
        const numToAdd = parseInt(count);

        if (!numToAdd || numToAdd <= 0) return res.status(400).json({ message: "Invalid number" });

        // Find the current highest plot number
        const lastPlot = await Plot.findOne({ projectId }).sort({ plotNumber: -1 });
        let startNum = lastPlot ? lastPlot.plotNumber + 1 : 1;

        const plotsToInsert = [];
        for (let i = 0; i < numToAdd; i++) {
            plotsToInsert.push({
                projectId,
                plotNumber: startNum + i,
                status: 'Available'
            });
        }

        await Plot.insertMany(plotsToInsert);
        
        // Update Project Count
        await Project.findByIdAndUpdate(projectId, { $inc: { totalPlots: numToAdd } });

        res.json({ message: `Successfully added ${numToAdd} plots` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. BULK DELETE PLOTS (New!)
router.delete('/bulk-delete', async (req, res) => {
    try {
        const { projectId, count } = req.body;
        const numToDelete = parseInt(count);

        if (!numToDelete || numToDelete <= 0) return res.status(400).json({ message: "Invalid number" });

        // Find the last N plots
        const plotsToDelete = await Plot.find({ projectId })
            .sort({ plotNumber: -1 })
            .limit(numToDelete);

        if (plotsToDelete.length === 0) return res.status(400).json({ message: "No plots to delete" });

        // Security Check: Don't delete Sold plots blindly
        const soldPlots = plotsToDelete.filter(p => p.status !== 'Available');
        if (soldPlots.length > 0) {
            return res.status(400).json({ 
                message: `Cannot delete! Plot ${soldPlots[0].plotNumber} is already ${soldPlots[0].status}.` 
            });
        }

        const ids = plotsToDelete.map(p => p._id);
        await Plot.deleteMany({ _id: { $in: ids } });

        // Update Project Count
        await Project.findByIdAndUpdate(projectId, { $inc: { totalPlots: -ids.length } });

        res.json({ message: `Deleted last ${ids.length} plots.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. DELETE SINGLE PLOT (Keeping this for the modal button)
router.delete('/:id', async (req, res) => {
    try {
        const plot = await Plot.findById(req.params.id);
        if (plot) {
            await Project.findByIdAndUpdate(plot.projectId, { $inc: { totalPlots: -1 } });
            await Plot.findByIdAndDelete(req.params.id);
        }
        res.json({ message: "Plot Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;