import { Router } from 'express';
import ClinicHours from '../models/ClinicHours';

const router = Router();

router.get('/clinic-hours', async (req, res) => {
  try {
    const hours = await ClinicHours.findOne().sort({ updatedAt: -1 });
    res.status(200).json(hours);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
