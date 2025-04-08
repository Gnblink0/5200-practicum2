import React, { useState } from "react";
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
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { doctorService } from "../../services/doctorService";

export default function AppointmentManager({
  appointments,
  doctors,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    doctorId: "",
    scheduleId: "",
    reason: "",
    mode: "in-person",
  });

  const handleDoctorChange = async (event) => {
    const selectedDoctorId = event.target.value;
    setFormData({ ...formData, doctorId: selectedDoctorId, scheduleId: "" });
    
    if (!selectedDoctorId) {
      setAvailableSlots({});
      return;
    }

    try {
      const response = await doctorService.getDoctorAvailableSlots(selectedDoctorId);
      console.log('Raw server response:', response);
      
      // Filter out past slots
      const now = new Date();
      const filteredSlots = {};
      
      Object.entries(response.availableSlots).forEach(([date, slots]) => {
        const validSlots = slots.filter(slot => {
          const startTime = new Date(slot.startTime);
          return startTime > now && slot.isAvailable;
        });
        
        if (validSlots.length > 0) {
          filteredSlots[date] = validSlots;
        }
      });

      console.log('Filtered available slots:', filteredSlots);
      setAvailableSlots(filteredSlots);
      
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots({});
    }
  };

  const handleSubmit = async () => {
    try {
      // Form validation
      if (!formData.doctorId) {
        setError("Please select a doctor");
        return;
      }
      if (!formData.scheduleId) {
        setError("Please select an appointment time");
        return;
      }
      if (!formData.reason.trim()) {
        setError("Please provide a reason for the appointment");
        return;
      }

      // Validate selected time slot
      const selectedSlot = getAvailableSlotOptions().find(slot => slot.value === formData.scheduleId);
      if (!selectedSlot) {
        setError("The selected time slot is no longer available");
        return;
      }

      const slotTime = new Date(selectedSlot.startTime);
      if (slotTime <= new Date()) {
        setError("Cannot book appointments in the past");
        return;
      }

      console.log('Selected slot:', selectedSlot);
      console.log('Submitting appointment data:', formData);

      if (editingAppointment) {
        await onUpdate(editingAppointment._id, formData);
      } else {
        const appointmentData = {
          doctorId: formData.doctorId,
          scheduleId: formData.scheduleId,
          reason: formData.reason,
          mode: formData.mode
        };
        console.log('Formatted appointment data:', appointmentData);
        await onAdd(appointmentData);
      }
      handleClose();
    } catch (error) {
      console.error("Appointment creation failed:", error);
      setError(error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAppointment(null);
    setFormData({
      doctorId: "",
      scheduleId: "",
      reason: "",
      mode: "in-person",
    });
    setAvailableSlots({});
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      doctorId: appointment.doctorId,
      scheduleId: appointment.scheduleId,
      reason: appointment.reason,
      mode: appointment.mode,
    });
    setOpen(true);
  };

  // Convert available slots to options list
  const getAvailableSlotOptions = () => {
    const options = [];
    
    Object.entries(availableSlots).forEach(([date, slots]) => {
      slots.forEach(slot => {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);
        
        const formattedStartTime = startTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const formattedEndTime = endTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const formattedDate = startTime.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        options.push({
          value: slot._id,
          label: `${formattedDate} ${formattedStartTime} - ${formattedEndTime}`
        });
      });
    });

    // Sort options by start time
    options.sort((a, b) => {
      const slotA = Object.values(availableSlots)
        .flat()
        .find(slot => slot._id === a.value);
      const slotB = Object.values(availableSlots)
        .flat()
        .find(slot => slot._id === b.value);
      
      return new Date(slotA.startTime) - new Date(slotB.startTime);
    });

    console.log('Generated slot options:', options);
    return options;
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">My Appointments</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Book Appointment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
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
                  {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                </TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>{appointment.mode}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  {appointment.status === "pending" && (
                    <>
                      <IconButton onClick={() => handleEdit(appointment)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => onDelete(appointment._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? "Edit Appointment" : "Book New Appointment"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Doctor"
              value={formData.doctorId}
              onChange={handleDoctorChange}
              fullWidth
              required
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </MenuItem>
              ))}
            </TextField>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            ) : formData.doctorId && (
              <TextField
                select
                label="Available Time Slots"
                value={formData.scheduleId}
                onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                fullWidth
                required
                disabled={!formData.doctorId}
              >
                {getAvailableSlotOptions().map((slot) => (
                  <MenuItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              label="Reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              fullWidth
              required
              multiline
              rows={3}
            />

            <TextField
              select
              label="Mode"
              value={formData.mode}
              onChange={(e) =>
                setFormData({ ...formData, mode: e.target.value })
              }
              fullWidth
              required
            >
              <MenuItem value="in-person">In-Person</MenuItem>
              <MenuItem value="telehealth">Telehealth</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAppointment ? "Update Appointment" : "Book Appointment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 