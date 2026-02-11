import {User} from "./models/user.js"
export const adminLogin =(req,res)=>{
    const {username, password } = req.body;
    try{
        if (!username || !password){
            return res.status(400).json({message:"username and password are required "})
        }
        const Admin = User.findAdmin(username);
        if(!Admin){
            return res.status(400).json({error:"Admin not found "})
        }
        const isVerified = Admin.comparePassword(password)
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

}