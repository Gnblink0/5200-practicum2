import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Box, Typography, CircularProgress } from "@mui/material";
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import ProfileEdit from "../../components/shared/ProfileEdit";
import { appointmentService } from "../../services/appointmentService";
import { prescriptionService } from "../../services/prescriptionService";
import { doctorService } from "../../services/doctorService";
import AppointmentManager from "../../components/patient/AppointmentManager";
import PrescriptionViewer from "../../components/patient/PrescriptionViewer";

export default function PatientDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPrescriptions();
      loadDoctors();
    }
  }, [currentUser]);

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");
      const data = await appointmentService.getAppointments(currentUser._id, "Patient");
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
      const data = await prescriptionService.getPrescriptions(currentUser._id, "Patient");
      setPrescriptions(data);
    } catch (error) {
      setError("Failed to load prescriptions: " + error.message);
    }
  }

  async function loadDoctors() {
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
    } catch (error) {
      setError("Failed to load doctors: " + error.message);
    }
  }

  async function handleAddAppointment(appointmentData) {
    try {
      console.log('Creating appointment with data:', appointmentData);
      const newAppointment = await appointmentService.createAppointment(appointmentData);
      console.log('Created appointment:', newAppointment);
      await loadAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError("Failed to create appointment: " + error.message);
    }
  }

  async function handleUpdateAppointment(id, appointmentData) {
    try {
      console.log('Updating appointment:', { id, appointmentData });
      const result = await appointmentService.updateAppointment(id, appointmentData);
      console.log('Update result:', result);
      // Immediately reload appointments after successful update
      await loadAppointments();
      return result;
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError("Failed to update appointment: " + error.message);
      throw error;
    }
  }

  async function handleDeleteAppointment(id) {
    try {
      await appointmentService.deleteAppointment(id);
      loadAppointments();
    } catch (error) {
      setError("Failed to delete appointment: " + error.message);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardHeader title="Patient Dashboard" onLogout={handleLogout} />

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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <AppointmentManager
              appointments={appointments}
              doctors={doctors}
              onAdd={handleAddAppointment}
              onUpdate={handleUpdateAppointment}
              onDelete={handleDeleteAppointment}
            />
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <PrescriptionViewer prescriptions={prescriptions} />
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
