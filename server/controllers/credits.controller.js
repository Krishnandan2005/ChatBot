import Transaction from "../models/transaction.models.js";
import Stripe from "stripe";

const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 5,
    credits: 100,
    features: [
      "Standard image generation",
      "HD quality outputs",
      "Community support",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 15,
    credits: 500,
    features: [
      "Fast image generation",
      "Priority processing",
      "Email support",
      "Early feature access",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "Ultra-fast generation",
      "Highest priority queue",
      "Ultra HD outputs",
      "Dedicated support",
      "Commercial usage rights",
    ],
  },
];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all plans
export const getPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Purchase a plan
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = plans.find((item) => item._id === planId);

    if (!plan) {
      return res.json({
        success: false,
        message: "Invalid plan",
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const origin = req.headers.origin;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: `${plan.credits} Credits`,
            },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      success_url: `${origin}loading`,
      cancel_url: `${origin}`,

      metadata: {
        transactionId: transaction._id.toString(),
        appId: "quickgpt",
      },

      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};