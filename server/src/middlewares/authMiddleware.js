import { extractToken,verifyToken } from "../utilis/jwt.js";
import { User } from "../models/user.js";

// authenticate  and verify token 
export const authenticate =async(req,res,next)=>{
    try{
        // obtain token from req using the extract token from the jwt file
        const token = extractToken(req)
        if(!token){
            return res.status(400).json({
                message:"user not logged in, no token issued "
            })
        }
        //verify token 
        let decoded;
        try{
            decoded = verifyToken(token);

        }catch(error){
            return res.status(401).json({
                message:"could not verify token"
            })
        }
        //fetch a user from the database 
        const user= await User.findById(decoded.id)
        if(!user){
            return res.status(401).json({
                message:"user not found"
            })
        }
        if(!user.isActive){
            return res.status(400).json({
                message:"user is not active"
            })
        }
        req.user = user
        req.token = token;
        next()
        
    }catch(error){
        return res.status(500).json({
            message:"token authentication error "
        })
    }

}
