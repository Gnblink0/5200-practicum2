import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import BarChartIcon from '@mui/icons-material/BarChart';
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
import DataVisualization from "../../components/admin/DataVisualization";

export default function AdminDashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDataVisualization, setShowDataVisualization] = useState(false);
  const navigate = useNavigate();

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

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Current User</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<BarChartIcon />}
            onClick={() => navigate("/admin/analytics")}
          >
            View Analytics
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <UserProfileCard
            user={currentUser}
            onEditClick={() => setShowEditProfile(true)}
          />
        </Box>

        {showDataVisualization && (
          <Box sx={{ mb: 4 }}>
            <DataVisualization />
          </Box>
        )}

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

        <ProfileEdit
          open={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentUser={currentUser}
        />
      </Container>
    </Box>
  );
}
