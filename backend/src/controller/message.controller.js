import { json } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import cloudinary from "../lib/cloudinary.js";
// Get all contacts for the logged-in user
export const getAllContacts = async (req, res) => {
  try {
    const loggedInuserId = req.user._id; // Assuming you have user authentication middleware that sets req.user
    const filteredUsers = await User.find({ _id: { $ne: loggedInuserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getting Allcontacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id; // Assuming you have user authentication middleware that sets req.user
    const {id: userToChatId} = req.params;
    const messages = await Message. find({
        $or:[
            {senderId: myId,receiverId: userToChatId},
            {senderId:userToChatId,receiverId: myId},
        ]
    });

    res.status(200).json(messages)
}catch(error){
    console.log("Error in getMessages controller:",error.message);
};
};

export const sendMessage = async(req,res)=>{
    try{
        const {text,image}= req.body;
        const{id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;

        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save()

        //todo: send message in realtime if user is online- socket.io
        
        res.status(201).json(newMessage);
        
        }catch(error){

        console.log("Error in sendMessage controller:",error.message);
        res.status(500).json({error:"Internal server error"});

    };
    
};

export const getChatPartners = async (req,res)=>{
    try{
        const loggedInUserId = req.user._id;

        const messages =await Message.find({
            $or:[{senderId:loggedInUserId},{receiverId:loggedInUserId}],

        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg)=>
                    msg.senderId.toString()===loggedInUserId.toString()
                        ?msg.receiverId.toString()
                        :msg.senderId.toString()
                )
            ),
        ];
        
        const chatPartners = await User.find({_id:{$in:chatPartnerIds}}).select("-password")

        res.status(200).json(chatPartners)
    } catch(error){
      console.error("Error in getChatPartners:,error.message");
      res.status(500).json({error:"Internal Server error"});
    }
    
};