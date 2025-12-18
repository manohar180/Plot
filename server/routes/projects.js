const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Plot = require('../models/Plot');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET plots for a specific project
router.get('/:id/plots', async (req, res) => {
  try {
    const plots = await Plot.find({ projectId: req.params.id }).sort({ plotNumber: 1 });
    res.json(plots);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Create Project
router.post('/', async (req, res) => {
  try {
    const { name, location, totalPlots } = req.body;
    const project = new Project({ name, location, totalPlots });
    await project.save();

    // Auto-generate plots
    const plots = [];
    for (let i = 1; i <= totalPlots; i++) {
      plots.push({ projectId: project._id, plotNumber: i });
    }
    await Plot.insertMany(plots);

    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Project (And all its plots)
router.delete('/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        await Plot.deleteMany({ projectId: req.params.id }); // Clean up plots
        res.json({ message: "Project and Plots Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;