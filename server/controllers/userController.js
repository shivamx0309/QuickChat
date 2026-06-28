import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";

// Signup a new user
export const signup = async (req, res)=>{
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details" })
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({success: false, message: "Invalid email format" })
        }

        const user = await User.findOne({email});

        if(user){
            return res.json({success: false, message: "Account already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        res.json({success: true, userData: newUser, token, message: "Account created successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to login a user
export const login = async (req, res) =>{
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: "Missing email or password" });
        }

        const userData = await User.findOne({email})

        if (!userData) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect){
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id)

        res.json({success: true, userData, token, message: "Login successful"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to check if user is authenticated
export const checkAuth = (req, res)=>{
    res.json({success: true, user: req.user});
}

// Controller to update user profile details
export const updateProfile = async (req, res)=>{
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({success: true, user: updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Controller to send reset password OTP
export const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Account does not exist with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;
        const mailOptions = {
            from: `"QuickChat" <${process.env.SMTP_USER || "noreply@quickchat.com"}>`,
            to: email,
            subject: "Password Reset OTP - QuickChat",
            text: `Your OTP for password reset is: ${otp}. It will expire in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                    <h2 style="color: #4f46e5; text-align: center;">QuickChat Password Reset</h2>
                    <p>Hello <strong>${user.fullName}</strong>,</p>
                    <p>We received a request to reset your password. Use the verification code below to proceed:</p>
                    <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 4px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; margin: 20px 0; color: #1f2937;">
                        ${otp}
                    </div>
                    <p style="font-size: 13px; color: #6b7280; text-align: center;">This OTP is valid for 15 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `,
        };

        if (hasSmtp) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail(mailOptions);
            return res.json({ success: true, message: "OTP sent to email for reset password" });
        } else {
            // Dynamically generate a temporary test SMTP account (Ethereal Email)
            const testAccount = await nodemailer.createTestAccount();
            const transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            mailOptions.from = `"QuickChat Test" <${testAccount.user}>`;
            const info = await transporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(info);

            console.log("\n========================================");
            console.log(`[TEST EMAIL SENT] OTP for ${email}: ${otp}`);
            console.log(`[PREVIEW URL] Check Email here: ${previewUrl}`);
            console.log("========================================\n");

            return res.json({ 
                success: true, 
                message: "OTP sent to email for reset password (check server console for preview link)",
                previewUrl: previewUrl
            });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Controller to reset password using OTP
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        if (!email || !otp || !newPassword) {
            return res.json({ success: false, message: "Missing required fields" });
        }
        if (newPassword.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.resetOtpExpireAt)) {
            return res.json({ success: false, message: "OTP expired. Please request a new one" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = null;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}