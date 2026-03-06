import express from "express"
import { Vote,getContestants,completeVoting, } from "../controllers/voterController.js"
import { authenticate } from "../middlewares/authMiddleware.js"
import { voter } from "../middlewares/authorizationMiddleware.js"
const router =express.Router()
router.use(authenticate,voter)

//voter routes ;
router.post('/vote',Vote);
router.get('getcontestants',getContestants);
router.get('/completeVoting',completeVoting);

export default router;