const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      maxlength: [50, 'Player name cannot exceed 50 characters'],
      default: 'Anonymous Runner'
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
      default: 0
    },
    km: {
      type: String,
      default: '0.00'
    },
    distance: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    },
    coconuts: {
      type: Number,
      default: 0
    },
    location: {
      type: String,
      default: 'Kerala'
    },
    controlMode: {
      type: String,
      default: 'HALF_BODY'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast leaderboard querying
scoreSchema.index({ score: -1, createdAt: -1 });
scoreSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);
