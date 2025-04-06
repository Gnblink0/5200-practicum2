import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Container, 
  Box, 
  Typography, 
  Button,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Grid
} from "@mui/material";
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import { appointmentService } from "../../services/appointmentService";
import { prescriptionService } from "../../services/prescriptionService";
import doctorService from "../../services/doctorService";

export default function PatientDashboard() {
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorSchedules, setSelectedDoctorSchedules] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    startTime: "",
    endTime: "",
    reason: "",
    mode: "in-person"
  });
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPrescriptions();
      loadDoctors();
    }
  }, [currentUser]);

  async function loadAppointments() {
    try {
      const data = await appointmentService.getAppointments(currentUser._id, "patient");
      setAppointments(data);
    } catch (error) {
      setError("Failed to load appointments: " + error.message);
    }
  }

  async function loadPrescriptions() {
    try {
      const data = await prescriptionService.getPrescriptions(currentUser._id, "patient");
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

  const loadDoctorSchedules = async (doctorId) => {
    try {
      const schedules = await doctorService.getSchedules(doctorId);
      setSelectedDoctorSchedules(schedules);
    } catch (error) {
      setDialogError("Failed to load doctor's schedule: " + error.message);
    }
  };

  const handleDoctorChange = async (doctorId) => {
    setDialogError("");
    setNewAppointment({
      ...newAppointment, 
      doctorId,
      startTime: "", // Reset time when doctor changes
      endTime: ""
    });
    if (doctorId) {
      await loadDoctorSchedules(doctorId);
    } else {
      setSelectedDoctorSchedules([]);
    }
  };

  // Helper function to format date for display
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const handleCreateAppointment = async () => {
    try {
      setDialogError("");
      // Validate required fields
      if (!newAppointment.doctorId || !newAppointment.startTime || !newAppointment.endTime) {
        setDialogError("Please fill in all required fields");
        return;
      }

      // Convert the datetime strings to ISO format
      const startTime = new Date(newAppointment.startTime).toISOString();
      const endTime = new Date(newAppointment.endTime).toISOString();

      // Check if start time is before end time
      if (new Date(startTime) >= new Date(endTime)) {
        setDialogError("End time must be after start time");
        return;
      }

      // Check if start time and end time are on the same day
      const startDate = new Date(startTime).setHours(0, 0, 0, 0);
      const endDate = new Date(endTime).setHours(0, 0, 0, 0);
      if (startDate !== endDate) {
        setDialogError("Start time and end time must be on the same day");
        return;
      }

      // Check doctor's availability
      await doctorService.checkAvailability(newAppointment.doctorId, startTime, endTime);
      
      // Create the appointment
      const formattedAppointment = {
        ...newAppointment,
        startTime,
        endTime
      };
      
      await appointmentService.createAppointment(formattedAppointment);
      setShowNewAppointment(false);
      setDialogError("");
      loadAppointments();
      setNewAppointment({
        doctorId: "",
        startTime: "",
        endTime: "",
        reason: "",
        mode: "in-person"
      });
    } catch (error) {
      setDialogError(error.message);
    }
  };

  const appointmentColumns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "doctor", label: "Doctor" },
    { id: "status", label: "Status" },
    { id: "notes", label: "Doctor's Notes" }
  ];

  const prescriptionColumns = [
    { id: "date", label: "Issued Date" },
    { id: "doctor", label: "Prescribed By" },
    { id: "diagnosis", label: "Diagnosis" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Actions" }
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              My Appointments
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setShowNewAppointment(true)}
            >
              New Appointment
            </Button>
          </Box>
          <DataTable
            columns={appointmentColumns}
            data={appointments}
            renderRow={(appointment) => (
              <TableRow key={appointment._id}>
                <TableCell>{new Date(appointment.startTime).toLocaleDateString()}</TableCell>
                <TableCell>
                  {new Date(appointment.startTime).toLocaleTimeString()} - 
                  {new Date(appointment.endTime).toLocaleTimeString()}
                </TableCell>
                <TableCell>{appointment.doctorId?.firstName} {appointment.doctorId?.lastName}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {appointment.notes || 'No notes from doctor yet'}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowAppointmentDetails(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </TableCell>
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
                <TableCell>{new Date(prescription.issuedDate).toLocaleDateString()}</TableCell>
                <TableCell>{prescription.doctorId?.firstName} {prescription.doctorId?.lastName}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {prescription.diagnosis}
                  </Typography>
                </TableCell>
                <TableCell>{prescription.status}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setShowPrescriptionDetails(true);
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            )}
          />
        </Box>

        <Dialog 
          open={showNewAppointment} 
          onClose={() => {
            setShowNewAppointment(false);
            setDialogError("");
            setSelectedDoctorSchedules([]);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>New Appointment</DialogTitle>
          <DialogContent>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}
            <TextField
              select
              fullWidth
              label="Doctor"
              value={newAppointment.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              sx={{ mt: 2 }}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </MenuItem>
              ))}
            </TextField>

            {selectedDoctorSchedules.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Time Slots:
                </Typography>
                <Box sx={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 1
                }}>
                  {selectedDoctorSchedules.map((schedule) => (
                    <Button
                      key={schedule._id}
                      variant={
                        newAppointment.startTime === schedule.startTime &&
                        newAppointment.endTime === schedule.endTime
                          ? "contained"
                          : "outlined"
                      }
                      sx={{ m: 0.5 }}
                      onClick={() => {
                        setNewAppointment({
                          ...newAppointment,
                          startTime: schedule.startTime,
                          endTime: schedule.endTime
                        });
                        setDialogError("");
                      }}
                    >
                      {formatDateTime(schedule.startTime)} - {new Date(schedule.endTime).toLocaleTimeString()}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {selectedDoctorSchedules.length === 0 && newAppointment.doctorId && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No available time slots found for this doctor.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={newAppointment.startTime}
              onChange={(e) => {
                setDialogError("");
                setNewAppointment({...newAppointment, startTime: e.target.value})
              }}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              disabled={selectedDoctorSchedules.length > 0}
            />
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={newAppointment.endTime}
              onChange={(e) => {
                setDialogError("");
                setNewAppointment({...newAppointment, endTime: e.target.value})
              }}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              disabled={selectedDoctorSchedules.length > 0}
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={newAppointment.reason}
              onChange={(e) => {
                setDialogError("");
                setNewAppointment({...newAppointment, reason: e.target.value})
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Mode"
              value={newAppointment.mode}
              onChange={(e) => {
                setDialogError("");
                setNewAppointment({...newAppointment, mode: e.target.value})
              }}
              sx={{ mt: 2 }}
            >
              <MenuItem value="in-person">In-Person</MenuItem>
              <MenuItem value="telehealth">Telehealth</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowNewAppointment(false);
              setDialogError("");
              setSelectedDoctorSchedules([]);
            }}>Cancel</Button>
            <Button onClick={handleCreateAppointment} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {showEditProfile && (
          <ProfileEdit
            user={currentUser}
            onClose={() => setShowEditProfile(false)}
          />
        )}

        <Dialog
          open={showAppointmentDetails}
          onClose={() => setShowAppointmentDetails(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Doctor
              </Typography>
              <Typography>
                {selectedAppointment?.doctorId?.firstName} {selectedAppointment?.doctorId?.lastName}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Time
              </Typography>
              <Typography>
                {selectedAppointment && new Date(selectedAppointment.startTime).toLocaleString()} - 
                {selectedAppointment && new Date(selectedAppointment.endTime).toLocaleTimeString()}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography>
                {selectedAppointment?.status}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Your Reason
              </Typography>
              <Typography>
                {selectedAppointment?.reason || 'No reason provided'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Doctor's Notes
              </Typography>
              <Typography>
                {selectedAppointment?.notes || 'No notes from doctor yet'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAppointmentDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showPrescriptionDetails}
          onClose={() => setShowPrescriptionDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Prescription Details</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Prescribed By
              </Typography>
              <Typography variant="body1">
                Dr. {selectedPrescription?.doctorId?.firstName} {selectedPrescription?.doctorId?.lastName}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Dates
              </Typography>
              <Typography variant="body1">
                Issued: {selectedPrescription?.issuedDate && new Date(selectedPrescription.issuedDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                Expires: {selectedPrescription?.expiryDate && new Date(selectedPrescription.expiryDate).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {selectedPrescription?.status}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Diagnosis
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedPrescription?.diagnosis}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Medications
              </Typography>
              {selectedPrescription?.medications.map((medication, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Medication Name
                      </Typography>
                      <Typography variant="body1">
                        {medication.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Dosage
                      </Typography>
                      <Typography variant="body1">
                        {medication.dosage}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Frequency
                      </Typography>
                      <Typography variant="body1">
                        {medication.frequency}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {medication.duration}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPrescriptionDetails(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

