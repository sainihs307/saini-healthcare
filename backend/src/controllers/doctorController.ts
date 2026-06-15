import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import HealthRecord from '../models/HealthRecord';
import Appointment from '../models/Appointment';
import StaffPermission from '../models/StaffPermission';
import FAQ from '../models/FAQ';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary';

// ── PATIENTS ──────────────────────────────────────────
// @desc   Get all patients
// @route  GET /api/doctor/patients
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password -otp -otpExpiry');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get single patient
// @route  GET /api/doctor/patients/:id
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

// ── HEALTH RECORDS ─────────────────────────────────────
// @desc   Get all records of a patient
// @route  GET /api/doctor/records/:patientId
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

// @desc   Create health record
// @route  POST /api/doctor/records
export const createHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, title, description, diagnosis, prescription, visitDate, nextVisit } = req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const documents: any[] = [];

    // Handle file uploads
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const { url, publicId } = await uploadToCloudinary(
          file.buffer,
          'records',
          `${patientId}-${Date.now()}`
        );
        documents.push({
          url,
          publicId,
          type: file.mimetype.includes('pdf') ? 'report' : 'xray',
          name: file.originalname,
        });
      }
    }

    const record = await HealthRecord.create({
      patient: patientId,
      createdBy: req.user._id,
      title,
      description,
      diagnosis,
      prescription,
      documents,
      visitDate: visitDate || new Date(),
      nextVisit,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Update health record
// @route  PUT /api/doctor/records/:id
export const updateHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const { title, description, diagnosis, prescription, visitDate, nextVisit } = req.body;

    record.title = title || record.title;
    record.description = description || record.description;
    record.diagnosis = diagnosis || record.diagnosis;
    record.prescription = prescription || record.prescription;
    record.visitDate = visitDate || record.visitDate;
    record.nextVisit = nextVisit || record.nextVisit;

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Delete health record
// @route  DELETE /api/doctor/records/:id
export const deleteHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Delete files from Cloudinary
    for (const doc of record.documents) {
      await deleteFromCloudinary(doc.publicId);
    }

    await record.deleteOne();
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── STAFF PERMISSIONS ──────────────────────────────────
// @desc   Get all staff
// @route  GET /api/doctor/staff
export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password -otp -otpExpiry');
    const permissions = await StaffPermission.find({ grantedBy: req.user._id });

    const staffWithPermissions = staff.map((s) => {
      const permission = permissions.find(
        (p) => p.staff.toString() === s._id.toString()
      );
      return {
        ...s.toObject(),
        hasPermission: permission ? permission.isActive : false,
      };
    });

    res.status(200).json(staffWithPermissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Grant permission to staff
// @route  POST /api/doctor/staff/grant
export const grantPermission = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.body;

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const existing = await StaffPermission.findOne({ staff: staffId });
    if (existing) {
      existing.isActive = true;
      existing.grantedAt = new Date();
      existing.revokedAt = undefined;
      await existing.save();
      return res.status(200).json({ message: `Access granted to ${staff.name}` });
    }

    await StaffPermission.create({
      staff: staffId,
      grantedBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({ message: `Access granted to ${staff.name}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Revoke permission from staff
// @route  POST /api/doctor/staff/revoke
export const revokePermission = async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.body;

    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const permission = await StaffPermission.findOne({ staff: staffId });
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    permission.isActive = false;
    permission.revokedAt = new Date();
    await permission.save();

    res.status(200).json({ message: `Access revoked from ${staff.name}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── APPOINTMENTS ───────────────────────────────────────
// @desc   Get all appointments
// @route  GET /api/doctor/appointments
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phone')
      .sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Update appointment status
// @route  PUT /api/doctor/appointments/:id
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
// @desc   Create FAQ
// @route  POST /api/doctor/faq
export const createFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, category } = req.body;
    const faq = await FAQ.create({ question, answer, category, createdBy: req.user._id });
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Get all FAQs
// @route  GET /api/doctor/faq
export const getFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc   Delete FAQ
// @route  DELETE /api/doctor/faq/:id
export const deleteFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    await faq.deleteOne();
    res.status(200).json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};