import jwt from 'jsonwebtoken';

export const generateToken = (userID,res) => {
    const {JWT_SECRET} = process.env;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const token = jwt.sign({userID}, JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie("jwt", token, {
        httpOnly: true, // prevent XSS attacks by cross site scripting
        maxAge: 7*24*60*60*1000, // 7 days in milliseconds
        sameSite: 'strict', // prevent CSRF attacks by cross site request forgery
        secure: process.env.NODE_ENV === 'development'?false:true,
        
    });

    return token;
};