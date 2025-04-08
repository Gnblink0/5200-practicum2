import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Box, Typography, TableRow, TableCell } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import { scheduleService } from "../../services/scheduleService";
import { prescriptionService } from "../../services/prescriptionService";
import ScheduleManager from "../../components/doctor/ScheduleManager";
import PrescriptionManager from "../../components/doctor/PrescriptionManager";

export default function DoctorDashboard() {
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
    }
  }, [currentUser]);

  async function loadAppointments() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/doctor/appointments`, {
        headers: {
          'X-User-Email': currentUser.email,
          'X-User-UID': currentUser.uid,
          'Content-Type': 'application/json'
        }
      });if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      setError("Failed to load appointments: " + error.message);
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
      loadPrescriptions();
    } catch (error) {
      setError("Failed to create prescription: " + error.message);
    }
  }

  async function handleUpdatePrescription(id, prescriptionData) {
    try {
      await prescriptionService.updatePrescription(id, prescriptionData);
      loadPrescriptions();
    } catch (error) {
      setError("Failed to update prescription: " + error.message);
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
                  <TableCell>{appointment.status}</TableCell>
                </TableRow>
              )}
            />
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
