const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// POST /api/scores - Record a completed game score
router.post('/', async (req, res) => {
  try {
    const {
      playerName,
      name,
      score,
      km,
      distance,
      coins,
      coconuts,
      location,
      controlMode
    } = req.body;

    const resolvedName = (playerName || name || '').trim() || 'Anonymous Runner';
    const parsedScore = typeof score === 'number' ? score : parseInt(score || '0', 10);
    const parsedDistance = typeof distance === 'number' ? distance : parseFloat(distance || '0');
    const parsedCoins = typeof coins === 'number' ? coins : parseInt(coins || '0', 10);
    const parsedCoconuts = typeof coconuts === 'number' ? coconuts : parseInt(coconuts || '0', 10);

    let resolvedLocation = 'Kerala';
    if (typeof location === 'string' && location.trim()) {
      resolvedLocation = location.trim();
    } else if (location && typeof location === 'object' && location.name) {
      resolvedLocation = location.name;
    }

    const newScore = new Score({
      playerName: resolvedName,
      score: isNaN(parsedScore) ? 0 : parsedScore,
      km: km ? km.toString() : '0.00',
      distance: isNaN(parsedDistance) ? 0 : parsedDistance,
      coins: isNaN(parsedCoins) ? 0 : parsedCoins,
      coconuts: isNaN(parsedCoconuts) ? 0 : parsedCoconuts,
      location: resolvedLocation,
      controlMode: controlMode || 'HALF_BODY'
    });

    const saved = await newScore.save();

    return res.status(201).json({
      success: true,
      message: 'Score saved successfully',
      data: saved
    });
  } catch (error) {
    console.error('Error saving game score:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save score',
      error: error.message
    });
  }
});

// GET /api/scores - Get leaderboard rankings (sorted by highest score)
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const scores = await Score.find()
      .sort({ score: -1, createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    console.error('Error fetching leaderboard scores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard scores',
      error: error.message
    });
  }
});

// GET /api/scores/recent - Get latest runs
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const recent = await Score.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: recent.length,
      data: recent
    });
  } catch (error) {
    console.error('Error fetching recent scores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recent scores',
      error: error.message
    });
  }
});

module.exports = router;
