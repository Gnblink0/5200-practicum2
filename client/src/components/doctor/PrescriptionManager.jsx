import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { appointmentService } from "../../services/appointmentService";
import { useAuth } from "../../contexts/AuthContext";

export default function PrescriptionManager({
  prescriptions,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    appointmentId: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    diagnosis: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Early return if doctor is not verified
  if (!currentUser.isVerified) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        You will be able to manage prescriptions after your account is verified.
      </Alert>
    );
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await appointmentService.getDoctorAppointments();

      // Filter for valid appointments
      const now = new Date();
      const validAppointments = data.filter((apt) => {
        const appointmentTime = new Date(apt.startTime);
        const isValid =
          apt.status === "completed" &&
          appointmentTime >= now &&
          !apt.hasPrescription;

        // Log each appointment's validation status
        console.log("Appointment validation:", {
          id: apt._id,
          startTime: appointmentTime.toISOString(),
          status: apt.status,
          hasPrescription: apt.hasPrescription,
          isValid,
          validationDetails: {
            isCompleted: apt.status === "completed",
            noPrescription: !apt.hasPrescription,
          },
        });

        return isValid;
      });

      // Log filtered appointments
      console.log("Appointments summary:", {
        total: data.length,
        valid: validAppointments.length,
        now: now.toISOString(),
        appointments: validAppointments.map((apt) => ({
          id: apt._id,
          patientName: `${apt.patientId?.firstName} ${apt.patientId?.lastName}`,
          startTime: apt.startTime,
          status: apt.status,
          hasPrescription: apt.hasPrescription,
        })),
      });

      if (validAppointments.length === 0) {
        setError(
          "No valid appointments found. Please ensure you have completed appointments that have not yet received prescriptions."
        );
      } else {
        setError("");
      }

      setAppointments(validAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError("Failed to load appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { name: "", dosage: "", frequency: "", duration: "" },
      ],
    });
  };

  const handleRemoveMedication = (index) => {
    const medications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications });
  };

  const handleMedicationChange = (index, field, value) => {
    const medications = formData.medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setFormData({ ...formData, medications });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.appointmentId) {
        setError("Please select a patient appointment");
        return;
      }

      if (!formData.diagnosis) {
        setError("Please enter a diagnosis");
        return;
      }

      if (!formData.expiryDate) {
        setError("Please select an expiry date");
        return;
      }

      // Validate medications
      if (!formData.medications.length) {
        setError("Please add at least one medication");
        return;
      }

      const isValidMedications = formData.medications.every(
        (med) => med.name && med.dosage && med.frequency && med.duration
      );

      if (!isValidMedications) {
        setError("Please fill in all medication details");
        return;
      }

      // Validate expiry date is in the future
      const expiry = new Date(formData.expiryDate);
      if (expiry <= new Date()) {
        setError("Expiry date must be in the future");
        return;
      }

      // Format the data for submission
      const submissionData = {
        ...formData,
        expiryDate: expiry.toISOString(),
        medications: formData.medications.map((med) => ({
          ...med,
          name: med.name.trim(),
          dosage: med.dosage.trim(),
          frequency: med.frequency.trim(),
          duration: med.duration.trim(),
        })),
      };

      // Clear any previous errors
      setError("");

      // Submit the form
      let result;
      if (editingPrescription) {
        result = await onUpdate(editingPrescription._id, submissionData);
      } else {
        result = await onAdd(submissionData);
      }

      // Check for errors
      if (result && result.error) {
        setError(result.error);
        return;
      }

      // Close dialog on success
      handleClose();
    } catch (error) {
      console.error("Form submission error:", error);
      setError(error.message || "Failed to submit prescription");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPrescription(null);
    setFormData({
      appointmentId: "",
      medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
      diagnosis: "",
      expiryDate: "",
    });
    setError("");
  };

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      appointmentId: prescription.appointmentId,
      medications: prescription.medications,
      diagnosis: prescription.diagnosis,
      expiryDate: prescription.expiryDate.split("T")[0],
    });
    setOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Prescriptions</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Prescription
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Medications</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  {new Date(prescription.issuedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {prescription.patient?.firstName}{" "}
                  {prescription.patient?.lastName}
                </TableCell>
                <TableCell>{prescription.diagnosis}</TableCell>
                <TableCell>
                  {prescription.medications
                    .map((med) => `${med.name} ${med.dosage}`)
                    .join(", ")}
                </TableCell>
                <TableCell>{prescription.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(prescription)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(prescription._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrescription ? "Edit Prescription" : "Add New Prescription"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth required>
              <InputLabel>Select Patient from Appointment</InputLabel>
              <Select
                value={formData.appointmentId}
                onChange={(e) =>
                  setFormData({ ...formData, appointmentId: e.target.value })
                }
                label="Select Patient from Appointment"
              >
                {appointments.map((appointment) => (
                  <MenuItem key={appointment._id} value={appointment._id}>
                    {appointment.patientId?.firstName}{" "}
                    {appointment.patientId?.lastName} -
                    {new Date(appointment.startTime).toLocaleDateString()}{" "}
                    {new Date(appointment.startTime).toLocaleTimeString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Diagnosis"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              type="date"
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Medications
            </Typography>
            {formData.medications.map((medication, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Medication Name"
                      value={medication.name}
                      onChange={(e) =>
                        handleMedicationChange(index, "name", e.target.value)
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dosage"
                      value={medication.dosage}
                      onChange={(e) =>
                        handleMedicationChange(index, "dosage", e.target.value)
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Frequency"
                      value={medication.frequency}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          "frequency",
                          e.target.value
                        )
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Duration"
                      value={medication.duration}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveMedication(index)}
                  sx={{ mt: 1 }}
                >
                  Remove Medication
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={handleAddMedication}
              sx={{ mt: 2 }}
            >
              Add Medication
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPrescription ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
