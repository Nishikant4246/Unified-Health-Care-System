# UHCS — Unified Healthcare System

> One Platform. Complete Care.
> Digitizing hospital and clinic operations by unifying patient medical history across multiple providers — reducing duplicate tests, preventing fragmented records, and improving diagnosis accuracy while maintaining data security.

---

## Overview

UHCS is a full-stack healthcare management platform that gives every patient and doctor a **universal ID** (e.g. `PAT0001`, `DOC0001`), so a patient's complete medical history is accessible to any authorized doctor across different clinics and hospitals — instead of records being siloed per provider.

The platform has three dedicated portals: **Admin**, **Doctor**, and **Patient**, each with role-based access control and its own dashboard.

---

## Features

### 🛡️ Admin Portal
- Live system dashboard: total doctors, total patients, total medical records
- Doctor verification & approval workflow before a doctor account goes live
- Full doctor and patient directory management

### 🩺 Doctor Portal
- Search and access patient records instantly using universal Patient ID
- Add new medical records (diagnosis, prescription, notes)
- View "My Patients" and recent record history
- Set practice location for the nearby-doctors map

### 🧑‍⚕️ Patient Portal
- Full medical timeline: visit history, diagnoses, consulting doctors, and cost per visit
- Upload medical reports securely (Cloudinary)
- "Find Nearby Doctors" — geolocation-based map showing registered doctors and real hospitals nearby
- Payment history and profile management

### 🔐 Core System
- JWT-secured authentication and protected REST APIs across all three portals
- Role-based access control (RBAC) for Admin / Doctor / Patient
- Digital prescriptions generated as downloadable PDFs
- Automated email notifications (welcome emails, login alerts) via Nodemailer

---
