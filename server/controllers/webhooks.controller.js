import Stripe from "stripe";
import Transaction from "../models/transaction.models.js";
import User from "../models/user.models.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {

      case "checkout.session.completed": {

        const session = event.data.object;

        const { transactionId, appId } = session.metadata;

        if (appId !== "quickgpt") {
          return res.json({
            received: true,
            message: "Ignored event",
          });
        }

        const transaction = await Transaction.findOne({
          _id: transactionId,
          isPaid: false,
        });

        if (!transaction) {
          return res.json({
            received: true,
            message: "Transaction already processed",
          });
        }

        await User.updateOne(
          { _id: transaction.userId },
          {
            $inc: {
              credits: transaction.credits,
            },
          }
        );

        transaction.isPaid = true;
        await transaction.save();

        console.log("Credits added successfully.");

        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};