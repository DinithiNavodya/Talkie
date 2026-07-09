import jwt from 'jsonwebtoken';

export const generateToken = (userID,res) => {
    const token = jwt.sign({userID}, process.env.JWT_SECRET, {
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