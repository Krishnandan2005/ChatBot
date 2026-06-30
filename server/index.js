import express from "express"
import 'dotenv/config'
import cors from 'cors'
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.controller.js";

const app = express()
const port = process.env.PORT || 3000;

await connectDB()

// stripe webhooks
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// middleware
app.use(cors())
app.use(express.json())

// routes 
app.get('/',(req,res) => res.send(`Server is live`));
app.use('/api/user', userRouter)
app.use('/api/chat' ,chatRouter)
app.use('/api/message' ,messageRouter)
app.use('/api/credit' ,creditRouter)


app.listen(port, () => {
    console.log(`Server is live at http://localhost:${port}`);
})