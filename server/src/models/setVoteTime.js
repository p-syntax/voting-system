import mongoose from "mongoose";

const votingWindow = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    // Only one document should ever exist — use a singleton key
    singleton: {
      type: String,
      default: "voting_window",
      unique: true,
    },
  },
  { timestamps: true }
);

export const VotingWindow= mongoose.model("VotingWindow", votingWindow);
