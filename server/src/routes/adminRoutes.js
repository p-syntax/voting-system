import express from "express";
import {voterRegistration,getVoters,addContestant,getContestant,updateVoter } from "../controllers/adminControllers.js"
import { authenticate } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/authorizationMiddleware.js";
const router = express.Router()
router.use( authenticate,admin)

//voter routes
router.post('/registervoter',voterRegistration);
router.get('/voters',getVoters);
router.post('/updatevoter',updateVoter);
//contestants routes 
router.post('/addContestant',addContestant);
router.get('/getcontestant',getContestant);

export default router;