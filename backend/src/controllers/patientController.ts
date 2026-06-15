import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import HealthRecord from '../models/HealthRecord';
import Appointment from '../models/Appointment';
import FAQ from '../models/FAQ';
import { sendAppointmentEmail } from '../services/nodemailer';

// ── HEALTH RECORDS ─────────────────────────────────────
// @desc   Get my health records
// @route  GET /api/patient/records
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

// @desc   Get single health record
// @route  GET /api/patient/records/:id
export const getMyRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await HealthRecord.findById(req.params.id).populate('createdBy', 'name role');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Only allow patient to see their own record
    if (record.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── APPOINTMENTS ───────────────────────────────────────
// @desc   Get my appointments
// @route  GET /api/patient/appointments
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

// @desc   Book appointment
// @route  POST /api/patient/appointments
export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      bookedBy: req.user._id,
      date,
      time,
      reason,
    });

    // Send confirmation email
    try {
      if (req.user.email) {
        await sendAppointmentEmail(
          req.user.email,
          req.user.name,
          new Date(date).toDateString(),
          time,
          reason
        );
      }
    } catch (emailError) {
      console.error('Appointment email failed:', emailError);
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Cancel appointment
// @route  PUT /api/patient/appointments/:id/cancel
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── FAQ ────────────────────────────────────────────────
// @desc   Get all published FAQs
// @route  GET /api/patient/faq
export const getFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PROFILE ────────────────────────────────────────────
// @desc   Get my profile
// @route  GET /api/patient/profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const patient = await User.findById(req.user._id).select('-password -otp -otpExpiry');
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};