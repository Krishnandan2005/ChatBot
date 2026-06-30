import Stripe from "stripe"
import Transaction from "../models/transaction.models.js";
import User from "../models/user.models.js";

export const stripeWebhooks = async (req,res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sign = req.headers["stripe-signature"]

    let event ;

    try {
        event = stripe.webhooks.constructEvent(req.body,sign,process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return res.status(400).send(`webhook error : ${error.message}`)
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded":{
                const paymentIntent = event.data.object;
                const sessionsList =await stripe.checkout.sessions.list({payment_intent:paymentIntent.id,
                })

                const session = sessionsList.data[0];
                const {transactionId, appId} = session.metadata;

                if(appId === 'quickgpt'){
                    const transaction = await Transaction.findOne({_id:transactionId,isPaid:false})

                    // update credits in user account 
                    await User.updateOne({_id: transaction.userId},{$inc: {credits: transaction.credits}})

                    // update credit payment status transaction
                    transaction.isPaid = true;
                    await transaction.save()
                }
                else{
                    return res.json({recieved: true,message: "Ignored event : Invalid App"})
                }
            }
                
                break;
        
            default:
                console.log("Unhandled event type : ",event.type)
                break;
        }
        res.json({recieved:true})
    } catch (error) {
        console.log("Webhook processing error : ",error.message);
        
        res.status(500).send("Internal Server Error")
    }
}