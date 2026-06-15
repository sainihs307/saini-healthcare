import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import HealthRecord from '../models/HealthRecord';
import Appointment from '../models/Appointment';
import FAQ from '../models/FAQ';

// ── PATIENTS ───────────────────────────────────────────
// @desc   Get all patients (only if permission granted)
// @route  GET /api/staff/patients
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password -otp -otpExpiry');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get single patient
// @route  GET /api/staff/patients/:id
export const getPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patient = await User.findById(req.params.id).select('-password -otp -otpExpiry');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get patient records (only if permission granted)
// @route  GET /api/staff/records/:patientId
export const getPatientRecords = async (req: AuthRequest, res: Response) => {
  try {
    const records = await HealthRecord.find({ patient: req.params.patientId })
      .populate('createdBy', 'name role')
      .sort({ visitDate: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── APPOINTMENTS ───────────────────────────────────────
// @desc   Get all appointments
// @route  GET /api/staff/appointments
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name')
      .sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Create appointment
// @route  POST /api/staff/appointments
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, date, time, reason } = req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      bookedBy: req.user._id,
      date,
      time,
      reason,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Update appointment
// @route  PUT /api/staff/appointments/:id
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.status = status || appointment.status;
    appointment.notes = notes || appointment.notes;
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── FAQ ────────────────────────────────────────────────
// @desc   Get all published FAQs
// @route  GET /api/staff/faq
export const getFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};