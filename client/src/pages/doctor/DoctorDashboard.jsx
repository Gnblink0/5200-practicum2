import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Box, Typography, TableRow, TableCell } from "@mui/material";
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";

export default function DoctorDashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPatients();
    }
  }, [currentUser]);

  async function loadAppointments() {
    try {
      // TODO: Replace with actual API call
      const data = await fetch(
        `${import.meta.env.VITE_API_URL}/doctor/appointments`
      ).then((res) => res.json());
      setAppointments(data);
    } catch (error) {
      setError("Failed to load appointments: " + error.message);
    }
  }

  async function loadPatients() {
    try {
      // TODO: Replace with actual API call
      const data = await fetch(
        `${import.meta.env.VITE_API_URL}/doctor/patients`
      ).then((res) => res.json());
      setPatients(data);
    } catch (error) {
      setError("Failed to load patients: " + error.message);
    }
  }

  const appointmentColumns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "patient", label: "Patient" },
    { id: "status", label: "Status" },
  ];

  const patientColumns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "lastVisit", label: "Last Visit" },
  ];

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  return (
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
            Today's Appointments
          </Typography>
          <DataTable
            columns={appointmentColumns}
            data={appointments}
            renderRow={(appointment) => (
              <TableRow key={appointment._id}>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.patient.name}</TableCell>
                <TableCell>{appointment.status}</TableCell>
              </TableRow>
            )}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            My Patients
          </Typography>
          <DataTable
            columns={patientColumns}
            data={patients}
            renderRow={(patient) => (
              <TableRow key={patient._id}>
                <TableCell>
                  {patient.firstName} {patient.lastName}
                </TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
              </TableRow>
            )}
          />
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
