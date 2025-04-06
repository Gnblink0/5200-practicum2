import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Container, 
  Box, 
  Typography, 
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  Alert
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import { appointmentService } from "../../services/appointmentService";
import { prescriptionService } from "../../services/prescriptionService";
import doctorService from "../../services/doctorService";

export default function DoctorDashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    appointmentId: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    diagnosis: "",
    expiryDate: "",
    status: "active"
  });
  const [newSchedule, setNewSchedule] = useState({
    startTime: "",
    endTime: "",
    isRecurring: false
  });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showEditPrescriptionDialog, setShowEditPrescriptionDialog] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
      loadPrescriptions();
      loadSchedules();
    }
  }, [currentUser]);

  async function loadAppointments() {
    try {
      const data = await appointmentService.getAppointments(currentUser._id, "doctor");
      setAppointments(data);
    } catch (error) {
      setError("Failed to load appointments: " + error.message);
    }
  }

  async function loadPrescriptions() {
    try {
      const data = await prescriptionService.getPrescriptions(currentUser._id, "doctor");
      setPrescriptions(data);
    } catch (error) {
      setError("Failed to load prescriptions: " + error.message);
    }
  }

  async function loadSchedules() {
    try {
      const data = await doctorService.getSchedules(currentUser._id);
      setSchedules(data);
    } catch (error) {
      setError("Failed to load schedules: " + error.message);
    }
  }

  const handleUpdateAppointment = async () => {
    try {
      await appointmentService.updateAppointment(selectedAppointment._id, {
        status: selectedAppointment.status,
        notes: selectedAppointment.notes
      });
      setShowAppointmentDialog(false);
      loadAppointments();
    } catch (error) {
      setError("Failed to update appointment: " + error.message);
    }
  };

  const handleCreatePrescription = async () => {
    try {
      // Validate required fields
      if (!newPrescription.patientId || !newPrescription.appointmentId || !newPrescription.diagnosis || !newPrescription.expiryDate) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate medications
      if (!newPrescription.medications.length) {
        setError("Please add at least one medication");
        return;
      }

      for (const med of newPrescription.medications) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          setError("Please fill in all medication details");
          return;
        }
      }

      // Create the prescription
      await prescriptionService.createPrescription({
        ...newPrescription,
        doctorId: currentUser._id
      });
      setShowPrescriptionDialog(false);
      loadPrescriptions();
      setNewPrescription({
        patientId: "",
        appointmentId: "",
        medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
        diagnosis: "",
        expiryDate: "",
        status: "active"
      });
    } catch (error) {
      setError("Failed to create prescription: " + error.message);
    }
  };

  const addMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [...newPrescription.medications, { name: "", dosage: "", frequency: "", duration: "" }]
    });
  };

  const removeMedication = (index) => {
    const newMedications = [...newPrescription.medications];
    newMedications.splice(index, 1);
    setNewPrescription({
      ...newPrescription,
      medications: newMedications
    });
  };

  const updateMedication = (index, field, value) => {
    const newMedications = [...newPrescription.medications];
    newMedications[index][field] = value;
    setNewPrescription({
      ...newPrescription,
      medications: newMedications
    });
  };

  const handleCreateSchedule = async () => {
    try {
      await doctorService.createSchedule(currentUser._id, newSchedule);
      setShowScheduleDialog(false);
      loadSchedules();
      setNewSchedule({
        startTime: "",
        endTime: "",
        isRecurring: false
      });
    } catch (error) {
      setError("Failed to create schedule: " + error.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await doctorService.deleteSchedule(currentUser._id, scheduleId);
      loadSchedules();
    } catch (error) {
      setError("Failed to delete schedule: " + error.message);
    }
  };

  const handleUpdatePrescription = async () => {
    try {
      // Validate required fields
      if (!selectedPrescription.diagnosis || !selectedPrescription.expiryDate) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate medications
      if (!selectedPrescription.medications.length) {
        setError("Please add at least one medication");
        return;
      }

      for (const med of selectedPrescription.medications) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          setError("Please fill in all medication details");
          return;
        }
      }

      await prescriptionService.updatePrescription(selectedPrescription._id, selectedPrescription);
      setShowEditPrescriptionDialog(false);
      loadPrescriptions();
      setError("");
    } catch (error) {
      setError("Failed to update prescription: " + error.message);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm("Are you sure you want to delete this prescription? This action cannot be undone.")) {
      try {
        await prescriptionService.deletePrescription(prescriptionId);
        loadPrescriptions();
        setError("");
      } catch (error) {
        setError("Failed to delete prescription: " + error.message);
      }
    }
  };

  const appointmentColumns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "patient", label: "Patient" },
    { id: "reason", label: "Reason" },
    { id: "status", label: "Status" },
    { id: "actions", label: "Actions" }
  ];

  const prescriptionColumns = [
    { id: "date", label: "Issued Date" },
    { id: "patient", label: "Patient" },
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              My Schedule
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setShowScheduleDialog(true)}
            >
              Add Available Time
            </Button>
          </Box>
          <DataTable
            columns={[
              { id: "date", label: "Date" },
              { id: "time", label: "Time" },
              { id: "recurring", label: "Recurring" },
              { id: "actions", label: "Actions" }
            ]}
            data={schedules}
            renderRow={(schedule) => (
              <TableRow key={schedule._id}>
                <TableCell>{new Date(schedule.startTime).toLocaleDateString()}</TableCell>
                <TableCell>
                  {new Date(schedule.startTime).toLocaleTimeString()} - 
                  {new Date(schedule.endTime).toLocaleTimeString()}
                </TableCell>
                <TableCell>{schedule.isRecurring ? "Weekly" : "One-time"}</TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleDeleteSchedule(schedule._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              My Appointments
            </Typography>
            <Box>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ mr: 1 }}
                onClick={() => loadAppointments()}
              >
                Refresh
              </Button>
            </Box>
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
                <TableCell>{appointment.patientId?.firstName} {appointment.patientId?.lastName}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        overflow: 'visible',
                        whiteSpace: 'normal',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    {appointment.reason || 'No reason provided'}
                  </Typography>
                </TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowAppointmentDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            )}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              My Prescriptions
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setShowPrescriptionDialog(true)}
            >
              New Prescription
            </Button>
          </Box>
          <DataTable
            columns={prescriptionColumns}
            data={prescriptions}
            renderRow={(prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>{new Date(prescription.issuedDate).toLocaleDateString()}</TableCell>
                <TableCell>{prescription.patientId?.firstName} {prescription.patientId?.lastName}</TableCell>
                <TableCell>{prescription.diagnosis}</TableCell>
                <TableCell>{prescription.status}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedPrescription(prescription);
                        setShowEditPrescriptionDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeletePrescription(prescription._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          />
        </Box>

        <Dialog 
          open={showAppointmentDialog} 
          onClose={() => setShowAppointmentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Appointment</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient
              </Typography>
              <Typography>
                {selectedAppointment?.patientId?.firstName} {selectedAppointment?.patientId?.lastName}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Time
              </Typography>
              <Typography>
                {selectedAppointment && new Date(selectedAppointment.startTime).toLocaleString()} - {selectedAppointment && new Date(selectedAppointment.endTime).toLocaleTimeString()}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient's Reason
              </Typography>
              <Typography>
                {selectedAppointment?.reason || 'No reason provided'}
              </Typography>
            </Box>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedAppointment?.status || ""}
                onChange={(e) => setSelectedAppointment({
                  ...selectedAppointment,
                  status: e.target.value
                })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Doctor's Notes"
              multiline
              rows={4}
              value={selectedAppointment?.notes || ""}
              onChange={(e) => setSelectedAppointment({
                ...selectedAppointment,
                notes: e.target.value
              })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAppointmentDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateAppointment} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={showPrescriptionDialog} 
          onClose={() => setShowPrescriptionDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>New Prescription</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              select
              fullWidth
              label="Patient"
              value={newPrescription.patientId}
              onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
              sx={{ mt: 2 }}
            >
              {appointments.map((appointment) => (
                <MenuItem key={appointment.patientId._id} value={appointment.patientId._id}>
                  {appointment.patientId.firstName} {appointment.patientId.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Appointment"
              value={newPrescription.appointmentId}
              onChange={(e) => setNewPrescription({...newPrescription, appointmentId: e.target.value})}
              sx={{ mt: 2 }}
            >
              {appointments.map((appointment) => (
                <MenuItem key={appointment._id} value={appointment._id}>
                  {new Date(appointment.startTime).toLocaleDateString()} - {appointment.patientId.firstName} {appointment.patientId.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Diagnosis"
              multiline
              rows={4}
              value={newPrescription.diagnosis}
              onChange={(e) => setNewPrescription({...newPrescription, diagnosis: e.target.value})}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Expiry Date"
              type="date"
              value={newPrescription.expiryDate}
              onChange={(e) => setNewPrescription({...newPrescription, expiryDate: e.target.value})}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>Medications</Typography>
            {newPrescription.medications.map((medication, index) => (
              <Box key={index} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Medication Name"
                      value={medication.name}
                      onChange={(e) => {
                        const newMedications = [...newPrescription.medications];
                        newMedications[index].name = e.target.value;
                        setNewPrescription({...newPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) => {
                        const newMedications = [...newPrescription.medications];
                        newMedications[index].dosage = e.target.value;
                        setNewPrescription({...newPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) => {
                        const newMedications = [...newPrescription.medications];
                        newMedications[index].frequency = e.target.value;
                        setNewPrescription({...newPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) => {
                        const newMedications = [...newPrescription.medications];
                        newMedications[index].duration = e.target.value;
                        setNewPrescription({...newPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  {index > 0 && (
                    <Grid item xs={12}>
                      <Button
                        color="error"
                        onClick={() => {
                          const newMedications = [...newPrescription.medications];
                          newMedications.splice(index, 1);
                          setNewPrescription({...newPrescription, medications: newMedications});
                        }}
                      >
                        Remove Medication
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setNewPrescription({
                  ...newPrescription,
                  medications: [
                    ...newPrescription.medications,
                    { name: "", dosage: "", frequency: "", duration: "" }
                  ]
                });
              }}
              sx={{ mt: 2 }}
            >
              Add Medication
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPrescriptionDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePrescription} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showScheduleDialog} onClose={() => setShowScheduleDialog(false)}>
          <DialogTitle>Add Available Time</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={newSchedule.startTime}
              onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={newSchedule.endTime}
              onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newSchedule.isRecurring}
                  onChange={(e) => setNewSchedule({...newSchedule, isRecurring: e.target.checked})}
                />
              }
              label="Repeat Weekly"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSchedule} variant="contained" color="primary">
              Add
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
          open={showEditPrescriptionDialog} 
          onClose={() => setShowEditPrescriptionDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Prescription</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient
              </Typography>
              <Typography>
                {selectedPrescription?.patientId?.firstName} {selectedPrescription?.patientId?.lastName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Appointment Date
              </Typography>
              <Typography>
                {selectedPrescription?.appointmentId && new Date(selectedPrescription.appointmentId.startTime).toLocaleString()}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Diagnosis"
              multiline
              rows={4}
              value={selectedPrescription?.diagnosis || ""}
              onChange={(e) => setSelectedPrescription({
                ...selectedPrescription,
                diagnosis: e.target.value
              })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Expiry Date"
              type="date"
              value={selectedPrescription?.expiryDate ? new Date(selectedPrescription.expiryDate).toISOString().split('T')[0] : ""}
              onChange={(e) => setSelectedPrescription({
                ...selectedPrescription,
                expiryDate: e.target.value
              })}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedPrescription?.status || ""}
                onChange={(e) => setSelectedPrescription({
                  ...selectedPrescription,
                  status: e.target.value
                })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="h6" sx={{ mt: 2 }}>Medications</Typography>
            {selectedPrescription?.medications.map((medication, index) => (
              <Box key={index} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Medication Name"
                      value={medication.name}
                      onChange={(e) => {
                        const newMedications = [...selectedPrescription.medications];
                        newMedications[index].name = e.target.value;
                        setSelectedPrescription({...selectedPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) => {
                        const newMedications = [...selectedPrescription.medications];
                        newMedications[index].dosage = e.target.value;
                        setSelectedPrescription({...selectedPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) => {
                        const newMedications = [...selectedPrescription.medications];
                        newMedications[index].frequency = e.target.value;
                        setSelectedPrescription({...selectedPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) => {
                        const newMedications = [...selectedPrescription.medications];
                        newMedications[index].duration = e.target.value;
                        setSelectedPrescription({...selectedPrescription, medications: newMedications});
                      }}
                    />
                  </Grid>
                  {selectedPrescription.medications.length > 1 && (
                    <Grid item xs={12}>
                      <Button
                        color="error"
                        onClick={() => {
                          const newMedications = [...selectedPrescription.medications];
                          newMedications.splice(index, 1);
                          setSelectedPrescription({...selectedPrescription, medications: newMedications});
                        }}
                      >
                        Remove Medication
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedPrescription({
                  ...selectedPrescription,
                  medications: [
                    ...selectedPrescription.medications,
                    { name: "", dosage: "", frequency: "", duration: "" }
                  ]
                });
              }}
              sx={{ mt: 2 }}
            >
              Add Medication
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditPrescriptionDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdatePrescription} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
