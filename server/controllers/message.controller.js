import axios from "axios";
import openai from "../configs/openai.js";
import Chat from "../models/chat.models.js";
import User from "../models/user.models.js";
import imagekit from "../configs/imagekit.js";

// -------------------------------------------------------
// Deduct credits
// Daily credits are used first.
// Paid credits are used after daily credits are exhausted.
// -------------------------------------------------------
const deductCredits = async (userId, amount) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const dailyCredits = user.dailyCredits || 0;
  const paidCredits = user.credits || 0;

  const totalCredits = dailyCredits + paidCredits;

  if (totalCredits < amount) {
    return false;
  }

  // Use daily credits first
  const dailyUsed = Math.min(dailyCredits, amount);

  // Remaining amount comes from paid credits
  const paidUsed = amount - dailyUsed;

  user.dailyCredits = dailyCredits - dailyUsed;
  user.credits = paidCredits - paidUsed;

  await user.save();

  return true;
};


// -------------------------------------------------------
// Text based AI Chat message controller
// -------------------------------------------------------
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get fresh user data
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const dailyCredits = user.dailyCredits || 0;
    const paidCredits = user.credits || 0;

    // Text generation costs 1 credit
    if (dailyCredits + paidCredits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({
      userId,
      _id: chatId,
    });

    if (!chat) {
      return res.json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.messages.push({
      role: "User",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);

    await chat.save();

    // Deduct 1 credit after successful generation
    const deducted = await deductCredits(userId, 1);

    if (!deducted) {
      console.error("Failed to deduct credit after text generation");
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// -------------------------------------------------------
// Image generation controller
// -------------------------------------------------------
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get fresh user data
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const dailyCredits = user.dailyCredits || 0;
    const paidCredits = user.credits || 0;

    // Image generation costs 2 credits
    if (dailyCredits + paidCredits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({
      userId,
      _id: chatId,
    });

    if (!chat) {
      return res.json({
        success: false,
        message: "Chat not found",
      });
    }

    chat.messages.push({
      role: "User",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const encodedPrompt = encodeURIComponent(prompt);

    const generatedImageUrl =
      `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data
    ).toString("base64")}`;

    const uploadResponse = await imagekit.files.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    chat.messages.push(reply);

    await chat.save();

    // Deduct 2 credits after successful generation
    const deducted = await deductCredits(userId, 2);

    if (!deducted) {
      console.error("Failed to deduct credits after image generation");
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};