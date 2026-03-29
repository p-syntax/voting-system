import { validateDescriptor } from "../utilis/faceMatch.js"
import {User} from "../models/user.js"
import { Contestant } from "../models/Contestants.js";
import { VotingWindow } from "../models/setVoteTime.js";
export const voterRegistration = async(req,res) =>{
    try{
        const {faceDescriptor,fullName,registrationNumber} = req.body;
        //validate input data 
        if(!faceDescriptor || !fullName || !registrationNumber){
            return res.status(400).json({
                success:false,
                message:"all fields are required "
            })
        }
        //validate descriptor 
        const validDescriptor = await validateDescriptor(faceDescriptor)
        if(!validDescriptor.valid){
            return res.status(400).json({
                error:validDescriptor.error
            })
        }
        // check if the user already exist in  the database 
        const voterExists = await User.findVoter(registrationNumber)
        if(voterExists){
            return res.status(400).json({
                error:"voter already exists"
            })
        }
        //creating a new voter and saving the voter to the database 
        const voter = new User({
            role:'voter',
            registrationNumber,
            faceDescriptor,
            fullName,
        })
        await voter.save()
        res.status(200).json({
            success:true,
            message:"user successfully created ",
            voter:voter.toPublicJSON
        })
    }catch(error){
        console.error("error creating voter ")
        res.status(400).json({
            message:error.message
        })

    }
}
export const getVoters=async(req,res)=>{
    try{
        const{page=1,limit=50,search} =req.query
        const query ={role:'voter'}
        if(search){
            query.$or=[
                {registrationNumber:{$regex:search,$options:'i'}},
                {fullName:{$regex:search,$options:'i'}}
            ]
        }
    
        //fetching voter 
        const voters = await User.find(query)
        .select('-faceDescriptor')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
        success: true,
        voters,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        },
        });

    }
    catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voters',
    });
  }
}
//update voter 
export const updateVoter = async (req, res) => {
  try {
    const { id } = req.params;
    const { registrationNumber, fullName, faceDescriptor, isActive } = req.body;

    // Validate voter ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voter ID',
      });
    }

    // Find voter
    const voter = await User.findOne({ _id: id, role: 'voter' });

    if (!voter) {
      return res.status(404).json({
        success: false,
        error: 'Voter not found',
      });
    }

    // Check if voter has already voted (optional - prevent updates after voting)
    if (voter.hasVoted) {
      return res.status(403).json({
        success: false,
        error: 'Cannot update voter details after they have voted',
      });
    }

    // If updating registration number, check if it's unique
    if (registrationNumber && registrationNumber !== voter.registrationNumber) {
      const existingVoter = await User.findOne({
        registrationNumber: registrationNumber.toUpperCase(),
        _id: { $ne: id }, // Exclude current voter
        role: 'voter',
      });

      if (existingVoter) {
        return res.status(400).json({
          success: false,
          error: 'Registration number already exists',
        });
      }
    }

    // Validate face descriptor if provided
    if (faceDescriptor) {
      const validDescriptor = validateDescriptor(faceDescriptor);
      if (!validDescriptor.isValid) {
        return res.status(400).json({
          success: false,
          error: validDescriptor.error,
        });
      }
    }

    // Update fields
    if (registrationNumber) {
      voter.registrationNumber = registrationNumber.toUpperCase();
    }
    if (fullName) {
      voter.fullName = fullName;
    }
    if (faceDescriptor) {
      voter.faceDescriptor = faceDescriptor;
    }
    if (isActive !== undefined) {
      voter.isActive = isActive;
    }

    // Save updated voter
    await voter.save();

    res.json({
      success: true,
      message: 'Voter updated successfully',
      voter: voter.toPublicJSON(),
    });

  } catch (error) {
    console.error('Update voter error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update voter',
      message: error.message,
    });
  }
};
// create contestant
export const addContestant = async (req, res) => {
  try {
    const { registrationNumber, name, position, department, party } = req.body;

    // Validate required fields
    if (!registrationNumber || !name || !position || !department || !party) {
      return res.status(400).json({
        error: "All fields including party are required",
      });
    }

    console.log("BODY:", req.body);

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        error: "Image is required",
      });
    }

    // Check if contestant already exists
    const existingContestant = await Contestant.findOne({ registrationNumber });
    if (existingContestant) {
      return res.status(400).json({ error: "Contestant already exists" });
    }

    // Cloudinary image URL
    const imageUrl = req.file.path;
    console.log("FILE:", req.file);

    const contestant = new Contestant({
      registrationNumber,
      name,
      image: imageUrl,
      position,
      department,
      party,
    });

    await contestant.save();

    res.status(201).json({
      message: "Contestant added successfully",
      contestant,
    });
  } catch (error) {
    console.error("Add contestant error:", error);
    res.status(500).json({
      error: "Failed to create contestant",
      message: error.message,
    });
  }
};
export const updateContestant = async (req, res) => {
  try {
    const { id } = req.params;
    const { registrationNumber, name, position, department, party } = req.body;

    // Check if contestant exists
    const contestant = await Contestant.findById(id);
    if (!contestant) {
      return res.status(404).json({
        error: "Contestant not found",
      });
    }

    // If registrationNumber is being updated, check uniqueness
    if (registrationNumber && registrationNumber !== contestant.registrationNumber) {
      const existing = await Contestant.findOne({ registrationNumber });
      if (existing) {
        return res.status(400).json({
          error: "Registration number already in use",
        });
      }
    }

    // Update fields (only if provided)
    if (registrationNumber) contestant.registrationNumber = registrationNumber;
    if (name) contestant.name = name;
    if (position) contestant.position = position;
    if (department) contestant.department = department;
    if (party) contestant.party = party;

    // Handle image update (optional)
    if (req.file) {
      contestant.image = req.file.path;
    }

   
    await contestant.save();

    res.status(200).json({
      message: "Contestant updated successfully",
      contestant,
    });

  } catch (error) {
    console.error("Update contestant error:", error);
    res.status(500).json({
      error: "Failed to update contestant",
      message: error.message,
    });
  }
};
export const getContestant= async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    // Execute query with pagination
    const contestants = await Contestant.find(query)
      .sort({ position: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const total = await Contestant.countDocuments(query);

    res.json({
      success: true,
      count: contestants.length,
      total: total,
      contestants: contestants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get contestants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contestants',
      message: error.message
    });
  }
};
// controllers/adminController.js
export const deleteContestant = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contestant.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Contestant not found" });
    }

    return res.json({ message: "Contestant deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
export const setVotingTime = async(req,res) => {
  const {startTime,endTime} = req.body;
  if(!startTime || !endTime){
    return res.status(400).json({
      error:"start time and endtime are required "
    })
  }
  if(new Date(startTime) >=new Date(endTime)){
    return res.status(400).json({error:"start time must be before endtime "})
  }
  try{
    const window = await VotingWindow.findOneAndUpdate(
      {singleton:"voting_window"},

      {startTime:new Date(startTime),
        endTime:new Date(endTime)
      },
      {upsert:true,new:true,setDefaultsOnInsert:true}
    )
    res.json({
      message:"voting window set successfully "
    })
  }catch(err){
    res.status(500).json({error:err.message})
  }
}