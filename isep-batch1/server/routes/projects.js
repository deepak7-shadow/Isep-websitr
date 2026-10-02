const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const verifyToken = require('../middleware/auth');

// ────────────────────────────────────────────────────────────────────────────
// Fallback data when MongoDB is offline
// ────────────────────────────────────────────────────────────────────────────
let fallbackProjects = [
  {
    _id: 'proj_01',
    userId: 'usr_01',
    projectName: 'ISEP Portal',
    description: 'A full-stack member management portal for ISEP Batch 1.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    projectImage: '',
    githubLink: 'https://github.com/example/isep-portal',
    liveLink: '',
    createdAt: new Date('2024-03-01')
  }
];

/**
 * @route   POST /api/projects
 * @desc    Add a new project (M8 Task 2a)
 * @access  Private
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { projectName, description, technologies, projectImage, githubLink, liveLink } = req.body;

    if (!projectName) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }

    try {
      const project = await Project.create({
        userId,
        projectName,
        description,
        technologies: technologies || [],
        projectImage: projectImage || '',
        githubLink: githubLink || '',
        liveLink: liveLink || ''
      });
      return res.status(201).json({ success: true, message: 'Project added successfully.', data: project });
    } catch (dbErr) {}

    // Fallback
    const newProject = {
      _id: `proj_${Date.now()}`,
      userId,
      projectName,
      description,
      technologies: technologies || [],
      projectImage: projectImage || '',
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      createdAt: new Date()
    };
    fallbackProjects.push(newProject);
    return res.status(201).json({ success: true, message: 'Project added (demo mode).', data: newProject });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/projects/user/:userId
 * @desc    Get all projects for a specific user (M8 Task 2b)
 * @access  Private
 */
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const projects = await Project.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: projects.length, data: projects });
    } catch (dbErr) {}

    const projects = fallbackProjects.filter(p => p.userId === userId);
    return res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Edit own project — ownership enforced (M8 Task 2c)
 * @access  Private (owner only)
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    const { projectName, description, technologies, projectImage, githubLink, liveLink } = req.body;

    try {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

      // Ownership check
      if (project.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own projects.' });
      }

      if (projectName !== undefined) project.projectName = projectName;
      if (description !== undefined) project.description = description;
      if (technologies !== undefined) project.technologies = technologies;
      if (projectImage !== undefined) project.projectImage = projectImage;
      if (githubLink !== undefined) project.githubLink = githubLink;
      if (liveLink !== undefined) project.liveLink = liveLink;

      await project.save();
      return res.json({ success: true, message: 'Project updated successfully.', data: project });
    } catch (dbErr) {}

    // Fallback
    const project = fallbackProjects.find(p => p._id === id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (project.userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });

    Object.assign(project, { projectName, description, technologies, projectImage, githubLink, liveLink });
    return res.json({ success: true, message: 'Project updated (demo mode).', data: project });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete own project — ownership enforced (M8 Task 2d)
 * @access  Private (owner only)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    try {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

      if (project.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own projects.' });
      }

      await project.deleteOne();
      return res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (dbErr) {}

    // Fallback
    const index = fallbackProjects.findIndex(p => p._id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Project not found.' });
    if (fallbackProjects[index].userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });

    fallbackProjects.splice(index, 1);
    return res.json({ success: true, message: 'Project deleted (demo mode).' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
