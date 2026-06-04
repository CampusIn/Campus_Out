import userModel from "../models/user.models.js";
import sessionModel from "../models/session.models.js";
import crypto from "crypto";
import bcrypt from 'bcrypt'
import config from '../config/config.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from "../services/email.services.js";
import { generateOTP,generateOtpHTML } from "../utils/utils.js";
import otpModel from "../models/otp.models.js";

const register = async (req, res) => {
    const { username, email, password } = req.body;
    const isUserExists = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]

    })
    if (isUserExists) {
        return res.status(409).json({
            message: "Username or email already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const otp = generateOTP();
    const otpHTML = generateOtpHTML(otp);
    const otpHash = await bcrypt.hash(otp,10);
    await otpModel.create({
        email,
        user:newUser._id,
        otpHash
    })
    
    await sendEmail(email, "Welcome to Campus In", "Thank you for registering with us!", otpHTML)

    
    res.status(201).json({
        username,
        email,
        verified: newUser.verified
    })




}

const login = async(req,res)=>{
    const {username,email,password} = req.body
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }

    if(!user.verified){
        return res.status(400).json({
            message:"Please verify your email before logging in"
        })
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password)
    if(!isPasswordMatch){
        return res.status(404).json({
            message:"Password is invalid"
        })
    }

    const refreshToken = jwt.sign({
        id:user._id,
    },config.JWT_SECRET,{
        expiresIn:'7d'
    })

    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')
    const session = await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id:user._id,
        sessionId: session._id
    },config.JWT_SECRET,{
        expiresIn:'15m'
    })

    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:'strict',
        maxAge: 7*24*60*60*1000
    })

    res.status(200).json({
        message:"Login successful",
        accessToken
    })
}

const resfreshToken = async (req, res) => {
    const {refreshToken} = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({
            message: "Unauthorised, refresh token not found"
        })
    }
    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)
    const id = decoded.id
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
        return res.status(400).json({
            message:"No session in progress"
        })
    }
    const newAccessToken = jwt.sign({
        id: decoded.id,
    }, config.JWT_SECRET,
        {
            expiresIn: '15m'
        })
    
    const newRefeshToken = jwt.sign({
        id:decoded.id
    },config.JWT_SECRET,{
        expiresIn: '7d'
    })

    const newRefreshTokenHash = await crypto.createHash('sha256').update(newRefeshToken).digest('hex')
    session.refreshTokenHash = newRefreshTokenHash
    await session.save();
    res.cookie('refreshToken',newRefeshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message:"New Access Token Created",
        accessToken: newAccessToken
    })
}

const logout = async (req,res) =>{
    const {refreshToken} = req.cookies
    if(!refreshToken){
        return res.status(400).json({
            message:"No refresh token"
        })
    }

    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
    })
    if(!session){
        return res.status(400).json({
            message:"No session in progress"
        })
    }
    session.revoked = true;
    await session.save();
    res.clearCookie("refreshToken")

    res.status(200).json({
        message:"Logout successful"
    })

}

const logoutAll = async (req,res) =>{
    const {refreshToken} = req.cookies
    if(!refreshToken){
        return res.status(400).json({
            message:"No refresh token not found"
        })
    }
    const decoded = jwt.verify(refreshToken,config.JWT_SECRET)
    await sessionModel.updateMany({
        user:decoded.id,
        revoked:false
    },{
        revoked:true
    })

    res.clearCookie("refreshToken")
    res.status(200).json({
        message:"Logged out from all devices"
    })
}

const verifyEmail = async(req,res) =>{
    const {email,otp} = req.body;
    const otpDoc = await otpModel.findOne({email}).sort({createdAt:-1})
    if(!otpDoc){
        return res.status(400).json({
            message:"OTP not found"
        })
    }

    const isOtpValid = await bcrypt.compare(otp,otpDoc.otpHash)
    if(!isOtpValid){
        return res.status(400).json({
            message:"Invalid OTP"
        })
    }

    const user = await userModel.findByIdAndUpdate(otpDoc.user,{verified:true})
    await otpModel.deleteMany({email})
    const refreshToken = jwt.sign({
        id:user._id,
    },config.JWT_SECRET,{
        expiresIn:'7d'
    })

    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')
    const session = await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]
    })
    const accessToken = jwt.sign({
        id:user._id
    },config.JWT_SECRET,{
        expiresIn:'15m'
    })

    res.cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:'strict',
        maxAge: 7*24*60*60*1000
    })
    return res.status(200).json({
        message:"Email verified successfully",
        user:{
            username:user.username,
            email:user.email,
            verified:user.verified
        },
        accessToken,
    })
}

export default { register, resfreshToken, logout, logoutAll, login, verifyEmail }