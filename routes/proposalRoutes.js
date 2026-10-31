const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Proposal = require('../models/Proposal');

// Helper to generate a clean, URL-safe unique ID
function generateUniqueId(partnerName) {
  const cleanName = (partnerName || 'love')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15) || 'love';
  const randomSuffix = crypto.randomBytes(4).toString('hex'); // 8 hex characters
  return `${cleanName}-${randomSuffix}`;
}

// POST /api/proposals - Create a new proposal and generate unique shareable link
router.post('/', async (req, res) => {
  try {
    const {
      partnerName,
      proposerName,
      proposalType,
      customNote,
      frontendUrl
    } = req.body;

    if (!partnerName || !partnerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Partner name is required'
      });
    }

    if (!proposerName || !proposerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Proposer name is required'
      });
    }

    // Generate unique slug
    let uniqueId = generateUniqueId(partnerName);
    let attempts = 0;
    while (await Proposal.exists({ uniqueId }) && attempts < 5) {
      uniqueId = generateUniqueId(partnerName);
      attempts++;
    }

    // Determine the base URL for the proposal link
    const baseUrl = (frontendUrl || req.headers.origin || 'http://localhost:3000').replace(/\/$/, '');
    const uniqueUrl = `${baseUrl}/?p=${uniqueId}`;

    const newProposal = new Proposal({
      uniqueId,
      uniqueUrl,
      partnerName: partnerName.trim(),
      proposerName: proposerName.trim(),
      proposalType: proposalType || 'PARTNER',
      customNote: (customNote || '').trim() || undefined,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    const saved = await newProposal.save();

    return res.status(201).json({
      success: true,
      message: 'Proposal created and saved to database successfully!',
      data: saved
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create proposal',
      error: error.message
    });
  }
});

// GET /api/proposals/:id - Fetch proposal details by unique ID (or Mongo _id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Search by uniqueId first, or fallback to _id if valid ObjectId
    let proposal = await Proposal.findOne({ uniqueId: id });
    if (!proposal && id.match(/^[0-9a-fA-F]{24}$/)) {
      proposal = await Proposal.findById(id);
    }

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Increment views count asynchronously
    proposal.viewsCount = (proposal.viewsCount || 0) + 1;
    if (proposal.responseStatus === 'PENDING') {
      proposal.responseStatus = 'VIEWED';
    }
    await proposal.save();

    return res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal details',
      error: error.message
    });
  }
});

// PATCH /api/proposals/:id/accept - Record that the partner clicked YES!
router.patch('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { noDodgedCount } = req.body;

    let proposal = await Proposal.findOne({ uniqueId: id });
    if (!proposal && id.match(/^[0-9a-fA-F]{24}$/)) {
      proposal = await Proposal.findById(id);
    }

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    proposal.responseStatus = 'ACCEPTED';
    proposal.acceptedAt = new Date();
    if (typeof noDodgedCount === 'number') {
      proposal.noDodgedCount = noDodgedCount;
    }

    await proposal.save();

    return res.status(200).json({
      success: true,
      message: 'Proposal accepted celebration recorded!',
      data: proposal
    });
  } catch (error) {
    console.error('Error recording acceptance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record acceptance',
      error: error.message
    });
  }
});

// GET /api/proposals - List latest proposals
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const proposals = await Proposal.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching proposals list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals',
      error: error.message
    });
  }
});

module.exports = router;

