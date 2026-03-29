
import { VotingWindow } from "../models/setVoteTime.js";
export const checkVotingWindow = async (req, res, next) => {
  try {
    const window = await VotingWindow.findOne({ singleton: "voting_window" });

    if (!window) {
      return res.status(403).json({
        error: "Voting has not been scheduled yet please wait .",
      });
    }

    const now = new Date();

    if (now < window.startTime) {
      return res.status(403).json({
        error: "Voting has not started yet.",
        startTime: window.startTime,
      });
    }

    if (now > window.endTime) {
      return res.status(403).json({
        error: "Time has elapsed for voting.",
        endTime: window.endTime,
      });
    }

    req.votingWindow = window;
    next();
  } catch (err) {
    console.error("checkVotingWindow error:", err.message);
    return res.status(500).json({ error: "Server error checking voting window." });
  }
};

