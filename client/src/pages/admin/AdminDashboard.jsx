import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Container,
  Box,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import DoctorVerification from "../../components/admin/DoctorVerification";
import UserManagement from "../../components/admin/UserManagement";
import AppointmentMonitor from "../../components/admin/AppointmentMonitor";
import StatsDashboard from "../../components/admin/StatsDashboard";
import AvgAppointmentDuration from "../../components/admin/AvgAppointmentDuration";
import PrescriptionsByMonth from "../../components/admin/PrescriptionsByMonth";
import AppointmentStatusCounts from "../../components/admin/AppointmentStatusCounts";
import PatientHistoryViewer from "../../components/admin/PatientHistoryViewer";

export default function AdminDashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardHeader title="Admin Dashboard" onLogout={handleLogout} />

      <Container sx={{ mt: 4 }}>
        <ErrorAlert error={error} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Current User
          </Typography>
          <UserProfileCard
            user={currentUser}
            onEditClick={() => setShowEditProfile(true)}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <DoctorVerification />
        </Box>

        <Box sx={{ mb: 4 }}>
          <UserManagement />
        </Box>

        <Box sx={{ mb: 4 }}>
          <AppointmentMonitor />
        </Box>

        <Box sx={{ mb: 4 }}>
          <PatientHistoryViewer />
        </Box>

        <Box sx={{ mb: 4 }}>
          <StatsDashboard />
        </Box>

        <Box sx={{ mb: 4 }}>
          <AvgAppointmentDuration />
        </Box>
        <Box sx={{ mb: 4 }}>
          <PrescriptionsByMonth />
        </Box>

        <Box sx={{ mb: 4 }}>
          <AppointmentStatusCounts />
        </Box>

        <ProfileEdit
          open={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentUser={currentUser}
        />
      </Container>
    </Box>
  );
}
