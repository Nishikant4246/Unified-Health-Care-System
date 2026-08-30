import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import RegisterDoctor from "../pages/auth/RegisterDoctor";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/common/ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import DoctorLayout from "../layouts/DoctorLayout";
import PatientLayout from "../layouts/PatientLayout";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminDoctors from "../pages/admin/Doctors";
import PendingDoctors from "../pages/admin/PendingDoctors";
import AdminPatients from "../pages/admin/Patients";

import DoctorDashboard from "../pages/doctor/Dashboard";
import SearchPatient from "../pages/doctor/SearchPatient";
import AddRecord from "../pages/doctor/AddRecord";
import MyRecords from "../pages/doctor/MyRecords";
import MyPatients from "../pages/doctor/MyPatients";
import PatientProfile from "../pages/doctor/PatientProfile";

import PatientDashboard from "../pages/patient/Dashboard";
import Timeline from "../pages/patient/Timeline";
import UploadReport from "../pages/patient/UploadReport";
import Payments from "../pages/patient/Payments";
import Profile from "../pages/patient/Profile";
import FindDoctors from "../pages/patient/FindDoctors";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-doctor" element={<RegisterDoctor />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"       element={<AdminDashboard />} />
        <Route path="doctors"         element={<AdminDoctors />} />
        <Route path="pending-doctors" element={<PendingDoctors />} />
        <Route path="patients"        element={<AdminPatients />} />
        <Route path="*"               element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard"           element={<DoctorDashboard />} />
        <Route path="search-patient"      element={<SearchPatient />} />
        <Route path="add-record"          element={<AddRecord />} />
        <Route path="my-records"          element={<MyRecords />} />
        <Route path="patients"            element={<MyPatients />} />
        <Route path="patients/:patientId" element={<PatientProfile />} />
        <Route path="*"                   element={<Navigate to="/doctor/dashboard" replace />} />
      </Route>

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute role="patient"><PatientLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard"     element={<PatientDashboard />} />
        <Route path="timeline"      element={<Timeline />} />
        <Route path="upload-report" element={<UploadReport />} />
        <Route path="payments"      element={<Payments />} />
        <Route path="profile"       element={<Profile />} />
        <Route path="find-doctors"  element={<FindDoctors />} />
        <Route path="*"             element={<Navigate to="/patient/dashboard" replace />} />
      </Route>

      {/* 404 — any unknown public path */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}