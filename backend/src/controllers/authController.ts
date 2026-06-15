import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateOTP, sendOTPSMS } from '../services/otpless';
import { sendOTPEmail } from '../services/nodemailer';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: 604800,
  });
};

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, email, phone, password, role: 'patient', otp, otpExpiry });
    try {
      if (email) await sendOTPEmail(email, otp, name);
      if (phone) await sendOTPSMS(phone, otp);
    } catch (emailError) {
      console.error('OTP sending failed:', emailError);
    }
    res.status(201).json({ message: `OTP sent to your ${email ? 'email' : 'phone'}`, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerStaff = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone is required' });
    }
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, email, phone, password, role: 'staff', otp, otpExpiry });
    try {
      if (email) await sendOTPEmail(email, otp, name);
      if (phone) await sendOTPSMS(phone, otp);
    } catch (emailError) {
      console.error('OTP sending failed:', emailError);
    }
    res.status(201).json({ message: `OTP sent to your ${email ? 'email' : 'phone'}`, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (!user.otpExpiry || user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP has expired' });
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    const token = generateToken(user._id.toString());
    res.status(200).json({ message: 'Account verified successfully', token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone) return res.status(400).json({ message: 'Email or phone is required' });
    const user = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your account first' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user._id.toString());
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    try {
      if (user.email) await sendOTPEmail(user.email, otp, user.name);
      if (user.phone) await sendOTPSMS(user.phone, otp);
    } catch (emailError) {
      console.error('OTP sending failed:', emailError);
    }
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
