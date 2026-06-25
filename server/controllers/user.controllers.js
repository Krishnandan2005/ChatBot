import User from '../models/user.models.js'
import jwt from "jsonwebtoken";
import bcrypt  from 'bcryptjs'
import Chat from '../models/chat.models.js';

// generate jwt 
const generateToken =  (id) => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: '30d'
    })
}

// API to register user
export const registerUser = async (req, res) => {
    const {name , email , password } = req.body;

    try {
        const userExists = await User.findOne({email}) 
        if(userExists){
            return res.json({success: false,message:"user already exists."})
        }

        const user = await User
        .create({name,email,password})

        const token = generateToken(user._id)
        res.json({success:true,token})
    } catch (error) {
        return res.json({success:false,message: error.message})
    }
}


// API to login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const isMatched = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatched) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken(user._id);

        return res.json({
            success: true,
            token
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};


// api to get user data 
export const getUser = async (req,res) => {

    try {
        const user = req.user;
        return res.json({success:true,user})
    } catch (error) {
        return res.json({success:false,message: error.message})
    }
    
}


//  api to get images published 
export const getPublishedImages = async (req,res) => {
    try {
        const publishedImagesMessages = await Chat.aggregate([
            {
                $unwind: "$messages"},
                {
                    $match:{
                        "messages.isImage":true,
                        "messages.isPublished":true
                    }
                },
                {
                    $project: {
                        _id:0,
                        imageurl:"$messages.content",
                        userName:"$userName"
                    }
                }
        ])
        res.json({success:true,images: publishedImagesMessages.reverse()})
    } catch (error) {
        res.json({success:true,message:error.message});
    }
    
}