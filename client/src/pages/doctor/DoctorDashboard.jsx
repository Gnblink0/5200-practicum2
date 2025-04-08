import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Box, Typography, TableRow, TableCell, CircularProgress, Alert, Chip } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import { scheduleService } from "../../services/scheduleService";
import { prescriptionService } from "../../services/prescriptionService";
import { appointmentService } from "../../services/appointmentService";
import ScheduleManager from "../../components/doctor/ScheduleManager";
import PrescriptionManager from "../../components/doctor/PrescriptionManager";

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPrescriptions();
      loadSchedules();
      refreshUserProfile();
    }
  }, [currentUser]);

  const refreshUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': localStorage.getItem('userEmail'),
          'X-User-UID': localStorage.getItem('userUID'),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh user profile');
      }

      const userData = await response.json();
      
      if (userData.isVerified && !currentUser.isVerified) {
        alert('Your account has been verified! Please log out and log back in to access all features.');
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");
      console.log('Loading appointments for doctor:', currentUser._id);
      const data = await appointmentService.getDoctorAppointments();
      console.log('Loaded appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError("Failed to load appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPrescriptions() {
    try {
      const data = await prescriptionService.getPrescriptions(currentUser._id, "Doctor");
      setPrescriptions(data);
    } catch (error) {
      setError("Failed to load prescriptions: " + error.message);
    }
  }

  async function loadSchedules() {
    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error) {
      setError("Failed to load schedules: " + error.message);
    }
  }

  async function handleAddSchedule(scheduleData) {
    try {
      await scheduleService.createSchedule(scheduleData);
      await loadSchedules();
    } catch (error) {
      console.error('Error in handleAddSchedule:', error);
      setError("Failed to create schedule: " + error.message);
    }
  }

  async function handleUpdateSchedule(id, scheduleData) {
    try {
      await scheduleService.updateSchedule(id, scheduleData);
      loadSchedules();
    } catch (error) {
      setError("Failed to update schedule: " + error.message);
    }
  }

  async function handleDeleteSchedule(id) {
    try {
      await scheduleService.deleteSchedule(id);
      loadSchedules();
    } catch (error) {
      setError("Failed to delete schedule: " + error.message);
    }
  }

  async function handleAddPrescription(prescriptionData) {
    try {
      await prescriptionService.createPrescription(prescriptionData);
      await loadPrescriptions();
      return true;
    } catch (error) {
      console.error('Failed to create prescription:', error);
      return { error: error.message };
    }
  }

  async function handleUpdatePrescription(id, prescriptionData) {
    try {
      await prescriptionService.updatePrescription(id, prescriptionData);
      await loadPrescriptions();
      return true;
    } catch (error) {
      console.error('Failed to update prescription:', error);
      return { error: error.message };
    }
  }

  async function handleDeletePrescription(id) {
    try {
      await prescriptionService.deletePrescription(id);
      loadPrescriptions();
    } catch (error) {
      setError("Failed to delete prescription: " + error.message);
    }
  }

  const appointmentColumns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "patient", label: "Patient" },
    { id: "reason", label: "Patient's Note" },
    { id: "mode", label: "Mode" },
    { id: "status", label: "Status" },
  ];

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1 }}>
        <DashboardHeader title="Doctor Dashboard" onLogout={handleLogout} />

        <Container sx={{ mt: 4 }}>
          <ErrorAlert error={error} />

          {!currentUser.isVerified && (
            <Alert severity="warning" sx={{ mb: 4 }}>
              Your account is pending verification. You will have limited access until an administrator verifies your account. 
              {currentUser.verificationStatus === 'rejected' && 
                ' Your verification was rejected. Please contact support for more information.'}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              My Profile
            </Typography>
            <UserProfileCard
              user={currentUser}
              onEditClick={() => setShowEditProfile(true)}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Appointments
            </Typography>
            {!currentUser.isVerified ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                You will be able to manage appointments after your account is verified.
              </Alert>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : appointments.length === 0 ? (
              <Typography variant="body1" color="textSecondary">
                No appointments found.
              </Typography>
            ) : (
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                renderRow={(appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>
                      {new Date(appointment.startTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                    </TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>{appointment.mode}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={
                          appointment.status === "confirmed"
                            ? "success"
                            : appointment.status === "pending"
                            ? "warning"
                            : appointment.status === "cancelled"
                            ? "error"
                            : "info"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )}
              />
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <PrescriptionManager
              prescriptions={prescriptions}
              onAdd={handleAddPrescription}
              onUpdate={handleUpdatePrescription}
              onDelete={handleDeletePrescription}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <ScheduleManager
              schedules={schedules}
              onAdd={handleAddSchedule}
              onUpdate={handleUpdateSchedule}
              onDelete={handleDeleteSchedule}
              error={error}
            />
          </Box>

          <ProfileEdit
            open={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            currentUser={currentUser}
          />
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
