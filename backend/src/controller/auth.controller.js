import User from '../models/User.js';
import { generateToken } from '../lib/utils.js';
import {ENV} from "../lib/env.js";
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async  (req, res) => {
  const { fullname, email, password } = req.body

    try {
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        const user  = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        } 

        //123456=> $2b$10$...
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        });

        if (newUser) {
            //before CR;
            // generateToken(newUser._id, res);
            // await newUser.save();

            //after CR;
            //persist user first, then issue auth cookie
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);


            res.status(201).json({ 
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

            try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullname, ENV.CLIENT_URL);
            }

            catch(error){
                console.error("Error sending welcome email:", error);

            }

        } else{
            res.status(400).json({ message: 'Invalid user data' });
        }
            //todo:send verification email to the user

    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: 'Server error' });
    } 

};  

export const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // never tell the user which one is wrong, email or password, for security reasons
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: ' Internal Server error' });
    }

};

export const logout = async (_, res) => {
    res.cookie("jwt","", {maxAge:0});
    res.status(200).json({message:"Logged out successfully"});
};