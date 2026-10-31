const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: [true, 'Unique ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    uniqueUrl: {
      type: String,
      required: [true, 'Unique URL is required'],
      trim: true
    },
    partnerName: {
      type: String,
      required: [true, 'Partner name is required'],
      trim: true,
      maxlength: [80, 'Partner name cannot exceed 80 characters']
    },
    proposerName: {
      type: String,
      required: [true, 'Proposer name is required'],
      trim: true,
      maxlength: [80, 'Proposer name cannot exceed 80 characters']
    },
    proposalType: {
      type: String,
      enum: ['VALENTINE', 'PARTNER', 'MARRIAGE', 'DATE'],
      default: 'PARTNER'
    },
    customNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Custom note cannot exceed 1000 characters'],
      default: 'You make my heart smile every single day. Life is just infinitely brighter, funnier, and more beautiful when you are around.'
    },
    responseStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'VIEWED'],
      default: 'PENDING'
    },
    noDodgedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'proposals' // Separate collection in database
  }
);

// Indexes for fast lookup
proposalSchema.index({ uniqueId: 1 });
proposalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Proposal', proposalSchema);

