# 🏥 MedixFlow - HealthCare System

Welcome to **MedixFlow**, a modern, secure, and role-based **Hospital Management System (HMS)** built with **Next.js, TypeScript, Prisma, and PostgreSQL**.  
It enables **Admins, Doctors, and Patients** to collaborate via **OTP-secure signup, JWT authentication, real-time video consultations, EHR, appointment scheduling with conflict detection, automated reminders, and analytics**.

---

## 🧭 Project Introduction

MedixFlow is designed to streamline healthcare workflows. It integrates **real-time consultations (WebRTC)**, **secure patient–doctor communication (Socket.io)**, and **role-based dashboards** for different stakeholders.

---

## 🗺️ Project Overview

- **Patients** register with OTP, schedule appointments, join video calls, and access prescriptions & medical history.
- **Doctors** manage appointments, set availability, view medical history, and issue digital prescriptions.
- **Admins** manage users, monitor system analytics, and enforce role-based access.

Key modules:

- Authentication & OTP
- Appointment Calendar with conflict detection
- Video Consultation system
- Electronic Health Records (EHR)
- Admin dashboard with analytics

---

## 📌 Key Features

### 🔐 Authentication & Authorization

- JWT with Access/Refresh tokens
- OTP-based patient registration
- Role-based route protection

### 📅 Appointment Management

- Interactive calendar (drag-and-drop)
- Conflict detection vs doctor availability
- Automated reminders via Email/SMS

### 🎥 Video Consultation

- WebRTC video/audio calls
- Patient waiting room
- Screen sharing + chat during calls

### 📜 Electronic Health Records

- Medical history: allergies, past treatments, file uploads
- Digital prescriptions & medication reminders

### 📊 Admin & Analytics

- Role-based dashboards
- Appointment statistics & revenue tracking
- User and staff management

### 🛡️ Security & Compliance

- HIPAA/GDPR considerations
- Data encryption at rest & in transit
- Audit logs

---

## 🧱 Suggested Project Structure

```plaintext
MEDIXFLOW/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # role-based dashboards
│   │   ├── login/
│   │   ├── otp/
│   │   └── register/
│   ├── components/
│   │   ├── admin/
│   │   ├── authComponents/
│   │   ├── doctor/
│   │   ├── patient/
│   │   ├── ui/
│   │   └── videoCall/
│   ├── features/
│   ├── lib/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── validation/
├── providers/
├── socket-events/
├── public/
├── .env
|-- server.js
└── next.config.ts
```

## ⚙️ Tech Stack

| Package                                  | Description                                         |
| ---------------------------------------- | --------------------------------------------------- |
| `next`                                   | React framework with App Router & API routes        |
| `typescript`                             | Strongly typed JavaScript for safer coding          |
| `prisma` + `@prisma/client`              | ORM for PostgreSQL with schema-based modeling       |
| `postgresql`                             | Relational database for structured healthcare data  |
| `jsonwebtoken`                           | JWT creation & verification (access/refresh tokens) |
| `bcryptjs`                               | Library for password hashing                        |
| `@reduxjs/toolkit`                       | State management & API caching (RTK Query)          |
| `react-redux`                            | Redux bindings for React                            |
| `socket.io` + `simple-peer`              | Real-time signaling & peer-to-peer video calls      |
| `webrtc-adapter`                         | WebRTC adapter for browser compatibility            |
| `tailwindcss` + `shadcn/ui` + `radix-ui` | Modern UI styling & components                      |
| `nodemailer`                             | Email sending service                               |
| `react-toastify`                         | Toast notifications                                 |
| `fullcalendar`                           | Interactive appointment scheduling & calendar UI    |
| `recharts`                               | Charts & analytics visualization                    |
| `zod`                                    | Schema validation library                           |
| `uuid`                                   | Generate unique IDs                                 |
| `eslint` + `typescript-eslint`           | Linting & code quality tools                        |

## 🧭 Role-Based Routes

| 👤 Role     | 📍 Page          | 🔗 Route Path                        |
| ----------- | ---------------- | ------------------------------------ |
| **Admin**   | Dashboard        | `/dashboard/admin`                   |
|             | Profile          | `/dashboard/admin/profile`           |
|             | Users            | `/dashboard/admin/users`             |
|             | All Appointments | `/dashboard/admin/all-appointments`  |
| **Doctor**  | Dashboard        | `/dashboard/doctor`                  |
|             | My Profile       | `/dashboard/doctor/profile`          |
|             | Patient Queue    | `/dashboard/doctor/patient-queue`    |
|             | EHR Records      | `/dashboard/doctor/ehr-records`      |
| **Patient** | Dashboard        | `/dashboard/patient`                 |
|             | My Profile       | `/dashboard/patient/profile`         |
|             | Appointments     | `/dashboard/patient/appointment`     |
|             | Meetings         | `/dashboard/patient/meetings`        |
|             | Medical History  | `/dashboard/patient/medical-history` |
|             | Prescriptions    | `/dashboard/patient/prescriptions`   |
|             | Notifications    | `/dashboard/patient/notifications`   |
| **Auth**    | Login            | `/login`                             |
|             | Join as Patient  | `/register/patient`                  |
|             | Join as Doctor   | `/register/doctor`                   |

---

## ⚙️ Configuration

Create a `.env` file in your project root and use the following structure.  
Make sure to **replace placeholder values** with your actual configuration.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/yourdb?sslmode=require"

# Bcrypt
BCRYPT_SALT_ROUND=your number

# JWT Settings
JWT_SECRET="your_jwt_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
JWT_ACCESS_EXPIRES=your time
JWT_REFRESH_EXPIRES=your time

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=@admin123456
ADMIN_PHONE=+8801000000000

# Email (SMTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=no-reply@yourmail.com
EMAIL_PASS=your_email_password
FROM_EMAIL=no-reply@yourmail.com

```

---

## 📥 Installation

```bash
git clone https://github.com/khaledsaifulla010/MedixFlow.git
cd MedixFlow
npm install
```

<p align="center">
  🛠️ Developed by <strong>Khaled Saifulla</strong> with clean backend architecture. ❤️.
</p>

---
