import express from "express";
import {voterRegistration,getVoters,addContestant,getContestant,updateVoter,updateContestant,setVotingTime,deleteContestant } from "../controllers/adminControllers.js"
import { authenticate } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";
import { admin } from "../middlewares/authorizationMiddleware.js";
const router = express.Router()
router.use( authenticate,admin)

//voter routes
router.post('/registervoter',voterRegistration);
router.get('/voters',getVoters);
router.post('/updatevoter',updateVoter);
//contestants routes 
router.post('/addContestant',upload.single("image"),addContestant);
router.get('/getcontestant',getContestant);
router.put("/updateContestant/:id", upload.single("image"), updateContestant);
router.delete("/deleteContestant/:id", deleteContestant);
//update voting window 
router.post('/setVotingTime',setVotingTime)

export default router;