import Chat from "../models/chat.models.js"

// api controller for creating a new chat 
export const createChat = async (req,res) => {
    try {
        const userId = req.user._id

        const chatData = 
        {
            userId,
            messages: [],
            chatName : "New Chat",
            username : req.user.name
        }

        await Chat.create(chatData)
        res.json({success:true,message:"Chat created successfully"});
    } catch (error) {
        res.json({success:false, message: error.message})
    }
    
}

// api controoler for getting all chats 
export const getChat = async (req,res) => {
    try {
        const userId = req.user._id

        const chats = await Chat.find({ userId })
    .sort({ updatedAt: -1 });

        res.json({success:true, chats});
    } catch (error) {
        res.json({success:false, message: error.message})
    }   
}

// api controller to delete chats 
export const deleteChat = async (req,res) => {
    try {
        const userId = req.user._id

        const {chatId} = req.body

        await Chat.deleteOne({_id: chatId, userId})

        res.json({success:true, message:"chat deleted"});
    } catch (error) {
        res.json({success:false, message: error.message})
    }   
}