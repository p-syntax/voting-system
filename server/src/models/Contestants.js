import mongoose from "mongoose";

const contestantSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  party: {
    type: String,
    required: true,
    trim: true,
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// indexes for faster queries
contestantSchema.index({ position: 1 });
contestantSchema.index({ department: 1 });
contestantSchema.index({ isActive: 1 });

// compound index for position-based queries
contestantSchema.index({ position: 1, isActive: 1 });

export const Contestant = mongoose.model('Contestant', contestantSchema);