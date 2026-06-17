import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import HealthRecord from '../models/HealthRecord';
import Appointment from '../models/Appointment';
import FAQ from '../models/FAQ';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 587, secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const getMyRecords = async (req: AuthRequest, res: Response) => {
  try {
    const records = await HealthRecord.find({ patient: req.user._id })
      .populate('createdBy', 'name role')
      .sort({ visitDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await HealthRecord.findById(req.params.id).populate('createdBy', 'name role');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.patient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name')
      .sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, time, reason, isFlexible } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });
    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId,
      bookedBy: req.user._id, date, time, reason,
      isFlexible: isFlexible || false,
    });

    // Send pending confirmation email
    try {
      if (req.user.email) {
        await transporter.sendMail({
          from: `"Saini Healthcare" <${process.env.EMAIL_USER}>`,
          to: req.user.email,
          subject: 'Appointment Request Received - Saini Healthcare',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:auto">
              <h2 style="color:#1C2B4A">Appointment Request Received 🏥</h2>
              <p>Hello <strong>${req.user.name}</strong>,</p>
              <p>Your appointment request has been received and is <strong>pending confirmation</strong>.</p>
              <div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:16px 0">
                <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
                <p><strong>Time:</strong> ${time} ${isFlexible ? '(Flexible)' : '(Fixed)'}</p>
                <p><strong>Reason:</strong> ${reason}</p>
              </div>
              ${isFlexible ? '<p><em>You indicated flexible timing — the clinic may adjust your slot and will contact you to confirm.</em></p>' : ''}
              <p>You will receive another email once your appointment is confirmed.</p>
              <hr/><p style="color:#888;font-size:12px">Saini Healthcare</p>
            </div>`,
        });
      }
    } catch (emailErr) { console.error('Email failed:', emailErr); }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.patient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    await appointment.save();

    // Send cancellation email
    try {
      if (req.user.email) {
        await transporter.sendMail({
          from: `"Saini Healthcare" <${process.env.EMAIL_USER}>`,
          to: req.user.email,
          subject: 'Appointment Cancelled - Saini Healthcare',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:auto">
              <h2 style="color:#e53e3e">Appointment Cancelled</h2>
              <p>Hello <strong>${req.user.name}</strong>,</p>
              <p>Your appointment on <strong>${new Date(appointment.date).toDateString()}</strong> at <strong>${appointment.time}</strong> has been cancelled.</p>
              ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
              <p>Please book a new appointment at your convenience.</p>
              <hr/><p style="color:#888;font-size:12px">Saini Healthcare</p>
            </div>`,
        });
      }
    } catch (emailErr) { console.error('Email failed:', emailErr); }

    res.status(200).json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const patient = await User.findById(req.user._id).select('-password -otp -otpExpiry');
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
