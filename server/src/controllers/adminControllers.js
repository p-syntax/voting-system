import { validateDescriptor } from "../utilis/faceMatch.js"
import {User} from "../models/user.js"
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
// create contestant
export const addContestant = async(req,res)=>{
    
    
}