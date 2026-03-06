import mongoose from 'mongoose';

const voteRecordSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contestant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contestant',
    required: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

voteRecordSchema.index({ voter: 1, position: 1 }, { unique: true });

voteRecordSchema.index({ contestant: 1 });

voteRecordSchema.index({ votedAt: -1 });

export const VoteRecord = mongoose.model('VoteRecord', voteRecordSchema);