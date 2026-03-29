#!/usr/bin/env node
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './src/config/database.js';
import { Contestant } from './src/models/Contestants.js';
import { User } from './src/models/user.js';
import { VoteRecord } from './src/models/vote.js';

dotenv.config();

async function main() {
  await connectDB();

  try {
    console.log('Clearing existing seed data (contestants, vote records, voters)...');
    await VoteRecord.deleteMany({});
    await Contestant.deleteMany({});
    // remove voter users only; keep any existing admin(s)
    await User.deleteMany({ role: 'voter' });

    // --- Create contestants ---
   const contestants = [
    { registrationNumber: 'C001', name: 'Alice Johnson', image: 'https://placehold.co/300x300?text=Alice+Johnson', position: 'President', department: 'Science', party: 'Party A' },
    { registrationNumber: 'C002', name: 'Brian Smith', image: 'https://placehold.co/300x300?text=Brian+Smith', position: 'President', department: 'Arts', party: 'Party B' },

    { registrationNumber: 'C003', name: 'Clara Lopez', image: 'https://placehold.co/300x300?text=Clara+Lopez', position: 'Vice President', department: 'Science', party: 'Party A' },
    { registrationNumber: 'C004', name: 'Daniel Kim', image: 'https://placehold.co/300x300?text=Daniel+Kim', position: 'Vice President', department: 'Commerce', party: 'Party B' },

    { registrationNumber: 'C005', name: 'Eve Adams', image: 'https://placehold.co/300x300?text=Eve+Adams', position: 'Secretary', department: 'Science', party: 'Party C' },
    { registrationNumber: 'C006', name: 'Frank Zhang', image: 'https://placehold.co/300x300?text=Frank+Zhang', position: 'Secretary', department: 'Engineering', party: 'Party C' },
];
    const createdContestants = await Contestant.insertMany(contestants);
    console.log(`Inserted ${createdContestants.length} contestants`);

    // Collect unique positions
    const positions = [...new Set(createdContestants.map((c) => c.position))];

    // --- Create voters ---
    const voters = [
      { role: 'voter', registrationNumber: 'V001', fullName: 'Voter One' },
      { role: 'voter', registrationNumber: 'V002', fullName: 'Voter Two' },
      { role: 'voter', registrationNumber: 'V003', fullName: 'Voter Three' },
    ];

    const createdVoters = await User.insertMany(voters);
    console.log(`Inserted ${createdVoters.length} voter accounts`);

    // --- Create some sample votes ---
    // We'll make Voter One vote for President and Secretary, Voter Two vote for Vice President
    const findByReg = (arr, reg) => arr.find((x) => x.registrationNumber === reg);

    const sampleVotes = [
      { voterReg: 'V001', contestantReg: 'C001' }, // Alice - President
      { voterReg: 'V001', contestantReg: 'C005' }, // Eve - Secretary
      { voterReg: 'V002', contestantReg: 'C004' }, // Daniel - Vice President
    ];

    let votesCreated = 0;

    for (const v of sampleVotes) {
      const voter = findByReg(createdVoters, v.voterReg);
      const contestant = findByReg(createdContestants, v.contestantReg);
      if (!voter || !contestant) continue;

      // create vote record
      const vr = new VoteRecord({
        voter: voter._id,
        contestant: contestant._id,
        position: contestant.position,
      });
      await vr.save();

      // increment contestant vote count
      await Contestant.findByIdAndUpdate(contestant._id, { $inc: { votes: 1 } });

      // add voted position to voter
      await User.findByIdAndUpdate(voter._id, { $addToSet: { votedPositions: contestant.position } });

      votesCreated++;
    }

    console.log(`Created ${votesCreated} sample vote records`);

    // Mark voters who have voted all positions as hasVoted (optional)
    for (const voter of createdVoters) {
      const fresh = await User.findById(voter._id);
      const count = (fresh.votedPositions || []).length;
      if (count > 0 && count >= positions.length) {
        await User.findByIdAndUpdate(voter._id, { hasVoted: true, votedAt: new Date() });
      }
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
