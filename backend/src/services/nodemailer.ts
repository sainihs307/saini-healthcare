import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string, name: string) => {
  await transporter.sendMail({
    from: `"Saini Healthcare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP - Saini Healthcare',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #1C2B4A;">Saini Healthcare 🏥</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your OTP for verification is:</p>
        <div style="background: #f0f4ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #4A90C4; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p>Valid for <strong>10 minutes</strong>.</p>
        <hr/>
        <p style="color: #888; font-size: 12px;">Saini Healthcare — Your health, our priority.</p>
      </div>
    `,
  });
};

export const sendAppointmentEmail = async (
  email: string,
  name: string,
  date: string,
  time: string,
  reason: string
) => {
  await transporter.sendMail({
    from: `"Saini Healthcare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Appointment Request Received - Saini Healthcare',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #1C2B4A;">Appointment Request Received 🗓️</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>Your appointment request is <strong>pending confirmation</strong> . You will be notified once confirmed.</p>
        <hr/>
        <p style="color: #888; font-size: 12px;">Saini Healthcare — Your health, our priority.</p>
      </div>
    `,
  });
};