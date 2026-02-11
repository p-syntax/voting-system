import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
//generate a jwt token 
export const generateToken =  (payload)=>{
    return jwt.sign(payload,JWT_SECRET,{
        expiresIn:JWT_EXPIRES_IN
    });
};
//verify the token
export const verifyToken =(token)=>{
    try{
        return jwt.verify(token,JWT_SECRET)
    }catch(error){
        throw new Error('invalid or expired token ')
    }
}
//create an auth token for a user based on their role 
export const createAuthToken = (user)=>{
    const payload ={
        id:user.id,
        role:user.role,
    }
    // adding role specific data to the token 
    if(user.role ==='admin'){
        payload.username = user.username
    }else if (user.role==='voter'){
        payload.registrationNumber = user.registrationNumber
        payload.hasVoted = user.hasVoted
    }
    const token = generateToken(payload)
    return{
        token,
        user:user.toPublicJSON(),
    };
};
//extract a token from the request
export const extractToken = (req)=>{
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        return req.headers.authorization.split(" ")[1]
    }
    return null;
};