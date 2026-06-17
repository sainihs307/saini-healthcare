import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctor';
import staffRoutes from './routes/staff';
import patientRoutes from './routes/patient';
import publicRoutes from './routes/public';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Saini Healthcare API is running 🏥' });
});

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

export default app;
