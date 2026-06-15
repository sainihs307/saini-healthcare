# 🏥 Saini Healthcare

A full-stack clinic management system with **Role-Based Access Control (RBAC)** for Doctor, Staff, and Patient — built with React, Node.js, Express, and MongoDB.

## Features
- 🔐 JWT Auth + OTP verification (Email & SMS)
- 👩‍⚕️ 3 separate dashboards: Doctor / Staff / Patient
- 📋 Patient health records (accessible based on permissions)
- 📅 Appointment booking system
- 🔑 Doctor can grant/revoke staff access to patient records
- ☁️ X-ray & document uploads via Cloudinary
- ❓ FAQ & Staff consultation feature

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas |
| Auth | JWT + OTPless |
| File Storage | Cloudinary |
| Email | Nodemailer |
| Deployment | Vercel (Frontend) + Render (Backend) |

## Project Structure
\`\`\`
saini-healthcare/
├── frontend/        # React app (3 role-based interfaces)
│   └── src/
│       ├── app/     # Pages per role (doctor/staff/patient)
│       ├── components/
│       ├── hooks/
│       ├── context/ # Auth context
│       └── routes/  # Protected routes
└── backend/         # Express API
    └── src/
        ├── models/      # MongoDB schemas
        ├── routes/      # API routes
        ├── controllers/ # Business logic
        ├── middleware/  # Auth + RBAC
        └── services/    # Cloudinary, Email, OTP
\`\`\`

## Getting Started
\`\`\`bash
# Clone
git clone https://github.com/sainihs307/saini-healthcare.git

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm start
\`\`\`

## Environment Variables
Create \`backend/.env\` with:
\`\`\`
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
OTPLESS_CLIENT_ID=
OTPLESS_CLIENT_SECRET=
\`\`\`

---
Built by [@sainihs307](https://github.com/sainihs307)
