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

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password -otp -otpExpiry');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patient = await User.findById(req.params.id).select('-password -otp -otpExpiry');
    if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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

export const createHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, title, description, diagnosis, prescription, visitDate, nextVisit, isExternalRecord, externalClinicName } = req.body;
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });
    const record = await HealthRecord.create({
      patient: patientId, createdBy: req.user._id,
      title, description, diagnosis, prescription,
      isExternalRecord: isExternalRecord === 'true',
      externalClinicName,
      documents: [],
      visitDate: visitDate || new Date(),
      nextVisit: nextVisit || undefined,
    });
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId, date, time, reason } = req.body;
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });
    const appointment = await Appointment.create({
      patient: patientId, doctor: doctorId,
      bookedBy: req.user._id, date, time, reason,
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('patient', 'name email phone');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const previousStatus = appointment.status;
    const statusChanged = status && status !== previousStatus;

    appointment.status = status || appointment.status;
    if (notes) appointment.notes = notes;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    await appointment.save();

    // Only send email if status actually changed
    const patient = appointment.patient as any;
    if (statusChanged && patient?.email && (status === 'confirmed' || status === 'cancelled')) {
      const subject = status === 'confirmed'
        ? 'Appointment Confirmed ✅ - Saini Healthcare'
        : 'Appointment Cancelled ❌ - Saini Healthcare';
      const html = status === 'confirmed'
        ? `<div style="font-family:sans-serif;max-width:500px;margin:auto">
            <h2 style="color:#1C2B4A">Appointment Confirmed ✅</h2>
            <p>Hello <strong>${patient.name}</strong>,</p>
            <p>Your appointment has been <strong>confirmed</strong>.</p>
            <div style="background:#f0f4ff;padding:16px;border-radius:8px;margin:16px 0">
              <p><strong>Date:</strong> ${new Date(appointment.date).toDateString()}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
              <p><strong>Reason:</strong> ${appointment.reason}</p>
            </div>
            <p>Please arrive 10 minutes before your scheduled time.</p>
            <hr/><p style="color:#888;font-size:12px">Saini Healthcare</p>
          </div>`
        : `<div style="font-family:sans-serif;max-width:500px;margin:auto">
            <h2 style="color:#e53e3e">Appointment Cancelled ❌</h2>
            <p>Hello <strong>${patient.name}</strong>,</p>
            <p>Your appointment on <strong>${new Date(appointment.date).toDateString()}</strong> at <strong>${appointment.time}</strong> has been <strong>cancelled</strong>.</p>
            ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
            <p>Please book a new appointment at your earliest convenience.</p>
            <hr/><p style="color:#888;font-size:12px">Saini Healthcare</p>
          </div>`;
      try {
        await transporter.sendMail({
          from: `"Saini Healthcare" <${process.env.EMAIL_USER}>`,
          to: patient.email, subject, html,
        });
      } catch (emailErr) { console.error('Email failed:', emailErr); }
    }

    res.status(200).json(appointment);
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

export const createFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, category } = req.body;
    const faq = await FAQ.create({ question, answer, category, createdBy: req.user._id });
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUnverifiedStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await User.find({ role: 'staff', isVerified: false }).select('-password -otp -otpExpiry');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyStaffMember = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') return res.status(404).json({ message: 'Staff not found' });
    staff.isVerified = true;
    await staff.save();
    res.status(200).json({ message: `${staff.name} verified successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
