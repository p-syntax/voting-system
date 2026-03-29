import express from "express"
import { Vote,getContestants,completeVoting, } from "../controllers/voterController.js"
import { authenticate } from "../middlewares/authMiddleware.js"
import { voter } from "../middlewares/authorizationMiddleware.js"
import { checkVotingWindow } from "../middlewares/checkVotingTime.js"
const router =express.Router()
router.use(authenticate,voter)

//voter routes ;
router.post('/vote',checkVotingWindow,Vote);
router.get('/getcontestants',checkVotingWindow,getContestants);
router.get('/completeVoting',checkVotingWindow,completeVoting);

export default router;