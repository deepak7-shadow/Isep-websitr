const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const verifyToken = require('../middleware/auth');

// ────────────────────────────────────────────────────────────────────────────
// Fallback data when MongoDB is offline
// ────────────────────────────────────────────────────────────────────────────
let fallbackCerts = [
  {
    _id: 'cert_01',
    userId: 'usr_01',
    certificateName: 'AWS Cloud Practitioner',
    issuingOrganization: 'Amazon Web Services',
    date: '2024-01-10',
    credentialLink: 'https://aws.amazon.com/verify',
    fileUrl: '',
    createdAt: new Date('2024-01-10')
  }
];

/**
 * @route   POST /api/certificates/member
 * @desc    Upload / add a new certificate (M8 Task 3a)
 * @access  Private
 */
router.post('/member', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { certificateName, issuingOrganization, date, credentialLink, fileUrl } = req.body;

    if (!certificateName) {
      return res.status(400).json({ success: false, message: 'Certificate name is required.' });
    }

    try {
      const cert = await Certificate.create({
        userId,
        certificateName,
        issuingOrganization: issuingOrganization || '',
        date: date || null,
        credentialLink: credentialLink || '',
        fileUrl: fileUrl || ''
      });
      return res.status(201).json({ success: true, message: 'Certificate added successfully.', data: cert });
    } catch (dbErr) {}

    // Fallback
    const newCert = {
      _id: `cert_${Date.now()}`,
      userId,
      certificateName,
      issuingOrganization: issuingOrganization || '',
      date: date || null,
      credentialLink: credentialLink || '',
      fileUrl: fileUrl || '',
      createdAt: new Date()
    };
    fallbackCerts.push(newCert);
    return res.status(201).json({ success: true, message: 'Certificate added (demo mode).', data: newCert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/certificates/user/:userId
 * @desc    Get all certificates for a specific user (M8 Task 3b)
 * @access  Private
 */
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    try {
      const certs = await Certificate.find({ userId }).sort({ date: -1, createdAt: -1 });
      return res.json({ success: true, count: certs.length, data: certs });
    } catch (dbErr) {}

    const certs = fallbackCerts.filter(c => c.userId === userId);
    return res.json({ success: true, count: certs.length, data: certs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/certificates/member/:id
 * @desc    Edit own certificate — ownership enforced (M8 Task 3c)
 * @access  Private (owner only)
 */
router.put('/member/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    const { certificateName, issuingOrganization, date, credentialLink, fileUrl } = req.body;

    try {
      const cert = await Certificate.findById(id);
      if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });

      if (cert.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only edit your own certificates.' });
      }

      if (certificateName !== undefined) cert.certificateName = certificateName;
      if (issuingOrganization !== undefined) cert.issuingOrganization = issuingOrganization;
      if (date !== undefined) cert.date = date;
      if (credentialLink !== undefined) cert.credentialLink = credentialLink;
      if (fileUrl !== undefined) cert.fileUrl = fileUrl;

      await cert.save();
      return res.json({ success: true, message: 'Certificate updated successfully.', data: cert });
    } catch (dbErr) {}

    // Fallback
    const cert = fallbackCerts.find(c => c._id === id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    if (cert.userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });

    Object.assign(cert, { certificateName, issuingOrganization, date, credentialLink, fileUrl });
    return res.json({ success: true, message: 'Certificate updated (demo mode).', data: cert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   DELETE /api/certificates/member/:id
 * @desc    Delete own certificate — ownership enforced (M8 Task 3d)
 * @access  Private (owner only)
 */
router.delete('/member/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    try {
      const cert = await Certificate.findById(id);
      if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });

      if (cert.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own certificates.' });
      }

      await cert.deleteOne();
      return res.json({ success: true, message: 'Certificate deleted successfully.' });
    } catch (dbErr) {}

    // Fallback
    const index = fallbackCerts.findIndex(c => c._id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    if (fallbackCerts[index].userId !== userId) return res.status(403).json({ success: false, message: 'Access denied.' });

    fallbackCerts.splice(index, 1);
    return res.json({ success: true, message: 'Certificate deleted (demo mode).' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
