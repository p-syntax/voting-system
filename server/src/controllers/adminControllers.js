import { validateDescriptor } from "../utilis/faceMatch.js"
import {User,Contestant} from "../models/user.js"
import { Contestant } from "../models/Contestants.js";
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
export const addContestant = async(req,res)=>{
    try{
        const{registrationNumber,name,image,position,department} = req.body;

        //validate required  fields 
        if(!registrationNumber || !name || !image ||!position || !department){
            return res.status(400).json({
                error:'All fields are required '
            });
        }
        const existingContestant = await Contestant.findOne({registrationNumber});
        if(existingContestant){
            return res.status(400).json({
                error:"contestant already exists "
            })
        }
        const Contestant = new Contestant({
            registrationNumber,
            name,
            image,
            position,
            department,
        });
        await Contestant.save()
        res.status(201).json({
            message:"contestant added successfully"
        })

    }catch(error){
        console.error("create contestant error",error);
        res.status(500).json({
            error:"failed to create contestant",
            message:error.message,
        });
    }   
}
export const getContestants = async (req, res) => {
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