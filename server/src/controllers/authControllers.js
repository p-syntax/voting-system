import {User} from "../models/user.js"
import { createAuthToken } from "../utilis/jwt.js";
import { FaceMatch,validateDescriptor} from "../utilis/faceMatch.js"

export const adminLogin =async (req,res)=>{
    const {username, password } = req.body;
    try{
        if (!username || !password){
            return res.status(400).json({message:"username and password are required "})
        }
        const Admin = await User.findAdmin(username);
        if(!Admin){
            return res.status(400).json({error:"Admin not found "})
        }
        const isVerified = await Admin.comparePassword(password)
        if(!isVerified){
            return res.status(400).json({success:"invalid Password  "})
        }
        //generate the admin token 
        const authData = createAuthToken(Admin)
        res.json({
            success:true,
            message:'login successfully',
            ...authData
        })
    }
    catch(error){
        console.error('Admin login error');
        res.status(500).json({error:error.message})
    }

};
export const voterLogin = async (req,res)=>{
    try{
        const { fullName, faceDescriptor, registrationNumber } = req.body;
        if (!fullName || !faceDescriptor || !registrationNumber) {
            return res.status(400).json({ message: 'error all fields required' });
        }
        // find voter by registration number 
    const voter = await User.findVoter(registrationNumber);
        if(!voter){
            return res.status(404).json({
                success: false,
                message:"voter not recognised "
            })}
        //validate the faceDescriptor 
        const descriptorValidation = await validateDescriptor(faceDescriptor);
        if (!descriptorValidation.valid) {
            return res.status(400).json({
                message: descriptorValidation.error,
            });
        }
        // verify name matches 
        if (voter.fullName.toLowerCase() !== fullName.toLowerCase().trim()) {
            return res.status(401).json({
                success:false,
                error:"invalid credentials ",
            })
        }
        //match the face descriptor 
        const faceThreshold = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.6;
        const matchFace = FaceMatch(faceDescriptor, voter.faceDescriptor, faceThreshold);
        if(!matchFace.isMatch){
            return res.status(401).json({
                success:false,
                error:"face verification failed"
            })
        }
        //generate a token for the voter 
        const authToken = createAuthToken(voter)
        res.status(200).json({
            success:true,
            message:"login successfully",
            ...authToken,

        })
    }catch(error){
        console.error("voter login error ")
        res.status(500).json({
            success:false,
            error:'login failed '
        })
    }
   
    }
