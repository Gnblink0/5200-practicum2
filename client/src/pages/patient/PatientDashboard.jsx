import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid } from "@mui/material";
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import axios from 'axios';

export default function PatientDashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState({
    dateOfBirth: '',
    gender: '',
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      coverageDetails: ''
    },
    emergencyContacts: [{
      name: '',
      relationship: '',
      phone: ''
    }],
    medicalHistory: []
  });

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPrescriptions();
    }
  }, [currentUser]);

  useEffect(() => {
    // Fetch patient data from the server
    const fetchPatientData = async () => {
      const response = await axios.get('/api/patients/me'); // 假设有一个获取当前患者信息的 API
      setPatientData(response.data);
      setMedicalInfo(response.data); // 初始化医疗信息
    };
    fetchPatientData();
  }, []);

  async function loadAppointments() {
    try {
      // TODO: Replace with actual API call
      const data = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments`
      ).then((res) => res.json());
      setAppointments(data);
    } catch (error) {
      setError("Failed to load appointments: " + error.message);
    }
  }

  async function loadPrescriptions() {
    try {
      // TODO: Replace with actual API call
      const data = await fetch(
        `${import.meta.env.VITE_API_URL}/prescriptions`
      ).then((res) => res.json());
      setPrescriptions(data);
    } catch (error) {
      setError("Failed to load prescriptions: " + error.message);
    }
  }

  const appointmentColumns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "doctor", label: "Doctor" },
    { id: "status", label: "Status" },
  ];

  const prescriptionColumns = [
    { id: "date", label: "Date" },
    { id: "medication", label: "Medication" },
    { id: "dosage", label: "Dosage" },
    { id: "doctor", label: "Prescribed By" },
  ];

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  const handleMedicalInfoChange = (name, value) => {
    setMedicalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <Typography variant="h5" gutterBottom>
            My Appointments
          </Typography>
          <DataTable
            columns={appointmentColumns}
            data={appointments}
            renderRow={(appointment) => (
              <TableRow key={appointment._id}>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.doctor.name}</TableCell>
                <TableCell>{appointment.status}</TableCell>
              </TableRow>
            )}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            My Prescriptions
          </Typography>
          <DataTable
            columns={prescriptionColumns}
            data={prescriptions}
            renderRow={(prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>{prescription.date}</TableCell>
                <TableCell>{prescription.medication}</TableCell>
                <TableCell>{prescription.dosage}</TableCell>
                <TableCell>{prescription.doctor.name}</TableCell>
              </TableRow>
            )}
          />
        </Box>

        <ProfileEdit
          open={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentUser={currentUser}
          medicalInfo={medicalInfo}
          onMedicalInfoChange={handleMedicalInfoChange}
        />
      </Container>
    </Box>
  );
}
