import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Contestant } from "../models/Contestants.js";
import { VoteRecord } from "../models/vote.js";

// voting for a contestant route 
export const Vote = async(req,res)=>{
    const session = await mongoose.startSession()
    //ensures that all operation must be complete before updating the db 
    session.startTransaction();

    try{
         const {contestantId} = req.body;
    const voterId =req.user._id;
    // validate contestants id 
    if(!contestantId || !mongoose.Types.ObjectId.isValid(contestantId)){
        await session.abortTransaction();
        return res.status(400).json({
            success:false,
            error:"valid contestant required"
        })

    }
    //check if the voter has already voted 
    if(req.user.hasVoted){
        await session.abortTransaction();
        return res.status(403).json({
            message:"you have already completed voting"
        })
    }
    //find the contestant inside the transaction
    const contestant = await Contestant.findById(contestantId).session(session);
    if(!contestant){
        await session.abortTransaction();
        res.status(400).json({
            success:false,
            error:"contestant not available "
        })
    }
    //prevent double voting for a single position 
    const existingVote = await VoteRecord.findOne({
        voter:voterId,
        position:contestant.position,
    }).session(session)
    if(existingVote){
        await session.abortTransaction();
        return res.json({
            error:`you have already voted for ${contestant.position}`
        })
    }
    //create the vote record 
    await VoteRecord.create([{
        voter:voterId,
        contestant:contestantId,
        position:contestant.position
    }],{session});
    //increament the contestant vote count 
    contestant.votes +=1;
    await contestant.save({session})
    //track voted positions 
    await User.findByIdAndUpdate(
      voterId,
      { $addToSet: { votedPositions: contestant.position } },
      { session }
    );
    //commit the transaction
    await session.commitTransaction();
    res.json({
    success: true,
    message: 'Vote cast successfully',
    contestant: {
        id: contestant._id,
        name: contestant.name,
        position: contestant.position,
    },
    endTime: req.votingWindow.endTime 

    });
    }catch(error){
        await session.abortTransaction();
        console.error("vote error",error)
        res.status(500).json({
            success:false,
            error:"failed to vote",
          
             })
    }finally{
        session.endSession();
    }
}
//get contestants and group them based on their positions 
export const getContestants = async(req,res)=>{
    // identifying which positions a user has voted helps 
    
    try{
        const voterId = req.user._id;
        const contestants = await Contestant.aggregate([
            { $match: { isActive: true } },
            {
        $group: {
          _id: '$position',
          contestants: {
            $push: {
              id: '$_id',
              registrationNumber: '$registrationNumber',
              name: '$name',
              image: '$image',
              department: '$department',
              votes: '$votes',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get positions the voter has already voted for
    const votedPositions = await VoteRecord.find({ voter: voterId })
      .distinct('position');

    // Transform to object format
    const positions = {};
    contestants.forEach(item => {
      positions[item._id] = {
        contestants: item.contestants,
        hasVoted: votedPositions.includes(item._id),
      };
    });

    res.json({
      success: true,
      positions,
      votedPositions,
      endTime: req.votingWindow.endTime 

    });

  } catch (error) {
    console.error('Get contestants for voting error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contestants',
    });
  }
};

// complete voting session
export const completeVoting = async (req,res)=>{
    try{
        const voterId= req.user._id;
        //check if voter has voted for all positions 
        const allPositions = await Contestant.distinct('position',{isActive:true});
        const votedPositions = await VoteRecord.find({voter:voterId}).distinct('position');
        if(votedPositions.length< allPositions.length){
            return res.status(400).json({
                success:false,
                error:"you have not voted for all positions yet"
            })
        }
        await User.findByIdAndUpdate(voterId,{
            hasVoted:true,
            votedAt:new Date(),
        });
        res.json({
            success:true,
            message:"voting completed successfully ",
            endTime: req.votingWindow.endTime 

        })
    }catch(error){
        console.error('complete voting error')
        res.status(500).json({
            success:false,
            error:"failed to complete voting "
        })
    }
}
