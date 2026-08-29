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

    // Save user message
    chat.messages.push({
      role: "User",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Generate AI response
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

    // Save AI response
    chat.messages.push(reply);

    await chat.save();

    // Deduct 1 credit after successful generation
    const deducted = await deductCredits(userId, 1);

    if (!deducted) {
      console.error("Failed to deduct credit after text generation");
    }

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Text generation error:", error);

    return res.status(500).json({
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

    // ---------------------------------------------------
    // Get fresh user data
    // ---------------------------------------------------
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

    // ---------------------------------------------------
    // Find chat
    // ---------------------------------------------------
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

    // ---------------------------------------------------
    // Save user message
    // ---------------------------------------------------
    chat.messages.push({
      role: "User",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // ---------------------------------------------------
    // Generate ImageKit AI image URL
    // ---------------------------------------------------
    const encodedPrompt = encodeURIComponent(prompt);

    const generatedImageUrl =
      `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    console.log("----------------------------------------");
    console.log("IMAGE GENERATION");
    console.log("----------------------------------------");
    console.log("Prompt:", prompt);
    console.log("Generated Image URL:", generatedImageUrl);

    // ---------------------------------------------------
    // ImageKit AI generation is asynchronous.
    // Poll until the image is actually ready.
    // ---------------------------------------------------

    let aiImageResponse = null;
    let imageReady = false;

    const maxAttempts = 20;
    const delay = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(
        `Checking generated image... Attempt ${attempt}/${maxAttempts}`
      );

      const response = await axios.get(generatedImageUrl, {
        responseType: "arraybuffer",
        validateStatus: () => true,
      });

      const contentType = response.headers["content-type"];
      const intermediateResponse =
        response.headers["is-intermediate-response"];

      console.log("Status:", response.status);
      console.log("Content-Type:", contentType);
      console.log(
        "Intermediate Response:",
        intermediateResponse
      );

      // -------------------------------------------------
      // Check if ImageKit is still preparing the image
      // -------------------------------------------------
      if (
        intermediateResponse === "true" ||
        contentType?.startsWith("text/html")
      ) {
        const responseText = Buffer.from(response.data).toString("utf8");

        console.log("ImageKit response:", responseText);

        if (
          responseText.includes("The asset is currently being prepared")
        ) {
          if (attempt < maxAttempts) {
            console.log(
              `Image not ready. Waiting ${delay / 1000} seconds...`
            );

            await new Promise((resolve) =>
              setTimeout(resolve, delay)
            );

            continue;
          }

          throw new Error(
            "ImageKit took too long to generate the image"
          );
        }
      }

      // -------------------------------------------------
      // Check if we received a valid image
      // -------------------------------------------------
      if (
        response.status === 200 &&
        contentType &&
        contentType.startsWith("image/")
      ) {
        aiImageResponse = response;
        imageReady = true;

        console.log("Image is ready!");
        console.log("Image Size:", response.data.length, "bytes");

        break;
      }

      // -------------------------------------------------
      // Unexpected response
      // -------------------------------------------------
      console.error("Unexpected ImageKit response");

      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        continue;
      }

      throw new Error(
        `ImageKit returned an invalid response. Status: ${response.status}, Content-Type: ${contentType}`
      );
    }

    // ---------------------------------------------------
    // Make sure image was generated
    // ---------------------------------------------------
    if (!imageReady || !aiImageResponse) {
      throw new Error("Failed to generate image");
    }

    // ---------------------------------------------------
    // Get actual content type
    // ---------------------------------------------------
    const contentType =
      aiImageResponse.headers["content-type"];

    console.log("Final Content-Type:", contentType);
    console.log(
      "Final Image Size:",
      aiImageResponse.data.length,
      "bytes"
    );

    console.log(
      "First Bytes:",
      Buffer.from(aiImageResponse.data).subarray(0, 20)
    );

    // ---------------------------------------------------
    // Convert image Buffer to Base64
    // ---------------------------------------------------
    const base64Image = `data:${contentType};base64,${Buffer.from(
      aiImageResponse.data
    ).toString("base64")}`;

    // ---------------------------------------------------
    // Upload generated image to ImageKit storage
    // ---------------------------------------------------
    const uploadResponse = await imagekit.files.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    console.log("Image uploaded successfully");
    console.log("Uploaded Image URL:", uploadResponse.url);

    // ---------------------------------------------------
    // Create assistant reply
    // ---------------------------------------------------
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    // ---------------------------------------------------
    // Save assistant message
    // ---------------------------------------------------
    chat.messages.push(reply);

    await chat.save();

    // ---------------------------------------------------
    // Deduct 2 credits after successful generation
    // ---------------------------------------------------
    const deducted = await deductCredits(userId, 2);

    if (!deducted) {
      console.error(
        "Failed to deduct credits after image generation"
      );
    }

    console.log("----------------------------------------");
    console.log("IMAGE GENERATION COMPLETED");
    console.log("----------------------------------------");

    // ---------------------------------------------------
    // Send response to frontend
    // ---------------------------------------------------
    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("----------------------------------------");
    console.error("IMAGE GENERATION ERROR");
    console.error("----------------------------------------");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};