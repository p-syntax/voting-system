export const requireRole=(...roles)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                error:"user must be logged in/authentication failed "
            })
        }
        if(!roles.includes(req.user.role)){
            res.status(403).json({
                success:false,
                message:"insufficient permission to accesss the service "
            })
        }
        next()
    }

}
export const admin = requireRole('admin')
export const voter = requireRole('voter')

// prevent voter from voting twice middleware
export const preventDoubleVoting=(req,res,next)=>{
    if(!req.user){
        return res.status(400).json({
            message:"authentication error "
        })
    }
    if(req.user.role !== 'voter'){
        return res.status(402).json({
            message:"only voters are allowed to vote"
        })
    }
    if(req.user.hasVoted){
        return res.status(401).json({
            message:"voter has already voted "
        })
    }
    next()
}