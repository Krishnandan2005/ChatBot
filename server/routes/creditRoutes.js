import express from "express"
import {protect} from '../middlewares/auth.js'
import { getPlans, purchasePlan } from "../controllers/credits.controller.js"


const creditRouter = express.Router()

creditRouter.get('/plan',getPlans)
creditRouter.post('/purchase',protect,purchasePlan)

export  default creditRouter;