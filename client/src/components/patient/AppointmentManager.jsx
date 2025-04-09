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
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
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
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    doctorId: "",
    scheduleId: "",
    reason: "",
    mode: "in-person",
  });

  // Add status constants
  const APPOINTMENT_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };

  // Add status chip colors and labels
  const getStatusConfig = (status) => {
    const configs = {
      [APPOINTMENT_STATUS.PENDING]: {
        color: "warning",
        label: "Pending Approval",
      },
      [APPOINTMENT_STATUS.CONFIRMED]: {
        color: "success",
        label: "Confirmed",
      },
      [APPOINTMENT_STATUS.CANCELLED]: {
        color: "error",
        label: "Cancelled",
      },
      [APPOINTMENT_STATUS.COMPLETED]: {
        color: "default",
        label: "Completed",
      },
    };
    return configs[status] || { color: "default", label: status };
  };

  // Add helper function to determine editable fields
  const getEditableFields = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.PENDING:
        return ["doctorId", "scheduleId", "reason", "mode"];
      case APPOINTMENT_STATUS.CONFIRMED:
        return ["reason", "mode"];
      default:
        return [];
    }
  };

  // Modify StatusActions component
  const StatusActions = ({ appointment, onCancel }) => {
    const renderActionButtons = () => {
      // Patient can only cancel pending appointments
      if (appointment.status === APPOINTMENT_STATUS.PENDING) {
        return (
          <Tooltip title="Cancel appointment">
            <IconButton onClick={() => onCancel(appointment._id)}>
              <CancelIcon color="error" />
            </IconButton>
          </Tooltip>
        );
      }
      return null;
    };

    return <Box sx={{ display: "flex", gap: 1 }}>{renderActionButtons()}</Box>;
  };

  const handleDoctorChange = async (event) => {
    const selectedDoctorId = event.target.value;
    setFormData({ ...formData, doctorId: selectedDoctorId, scheduleId: "" });
    setLoading(true);
    setError("");

    if (!selectedDoctorId) {
      setAvailableSlots({});
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching available slots for doctor:", selectedDoctorId);
      const response = await doctorService.getDoctorAvailableSlots(
        selectedDoctorId
      );
      console.log("Raw server response:", response);

      // Filter out past slots and ensure valid dates
      const now = new Date();
      const filteredSlots = {};
      let totalAvailableSlots = 0;

      Object.entries(response.availableSlots).forEach(([date, slots]) => {
        console.log("Processing slots for date:", date, slots);

        const validSlots = slots.filter((slot) => {
          try {
            // Create dates using local time
            const startTime = new Date(slot.startTime);
            const endTime = new Date(slot.endTime);

            console.log("Validating slot:", {
              id: slot._id,
              startTime: startTime.toLocaleString(),
              endTime: endTime.toLocaleString(),
              isAvailable: slot.isAvailable,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            const isValid =
              startTime > now &&
              endTime > startTime &&
              slot.isAvailable === true; // Strict comparison

            if (!isValid) {
              console.log("Slot rejected:", {
                reasons: {
                  isPast: startTime <= now,
                  invalidRange: endTime <= startTime,
                  isUnavailable: !slot.isAvailable,
                },
              });
            }

            return isValid;
          } catch (error) {
            console.error("Error processing slot:", slot, error);
            return false;
          }
        });

        if (validSlots.length > 0) {
          // Use local date as key
          const localDate = new Date(validSlots[0].startTime);
          const dateKey =
            localDate.getFullYear() +
            "-" +
            String(localDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(localDate.getDate()).padStart(2, "0");
          filteredSlots[dateKey] = validSlots;
          totalAvailableSlots += validSlots.length;
        }
      });

      console.log("Filtered available slots:", {
        total: totalAvailableSlots,
        slots: filteredSlots,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setAvailableSlots(filteredSlots);

      if (totalAvailableSlots === 0) {
        setError("No available time slots found for this doctor.");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("Failed to load available time slots. Please try again.");
      setAvailableSlots({});
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotChange = (e) => {
    const selectedSlotId = e.target.value;
    console.log("Time slot selected:", {
      selectedSlotId,
      event: e.type,
      currentFormData: formData,
    });

    // Update form data
    setFormData((prev) => {
      console.log("Updating form data:", {
        previous: prev,
        new: { ...prev, scheduleId: selectedSlotId },
      });
      return { ...prev, scheduleId: selectedSlotId };
    });
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

      // Final validation of selected slot
      const selectedSlot = Object.values(availableSlots)
        .flat()
        .find((slot) => slot._id === formData.scheduleId);

      console.log("Final validation of selected slot:", {
        selectedId: formData.scheduleId,
        foundSlot: selectedSlot
          ? {
              id: selectedSlot._id,
              startTime: new Date(selectedSlot.startTime).toLocaleString(),
              isAvailable: selectedSlot.isAvailable,
            }
          : null,
      });

      if (!selectedSlot || !selectedSlot.isAvailable) {
        setError("The selected time slot is no longer available");
        // Refresh available slots immediately
        await handleDoctorChange({ target: { value: formData.doctorId } });
        return;
      }

      // If we get here, proceed with booking
      const appointmentData = {
        doctorId: formData.doctorId,
        scheduleId: formData.scheduleId,
        reason: formData.reason,
        mode: formData.mode,
      };

      try {
        console.log("Submitting appointment data:", appointmentData);
        await onAdd(appointmentData);
        setSuccess("Appointment booked successfully");
        handleClose();
      } catch (error) {
        if (error.message.includes("not available")) {
          setError(
            "This time slot has just been booked by someone else. Please select another time."
          );
          await handleDoctorChange({ target: { value: formData.doctorId } });
        } else {
          setError(error.message);
        }
      }
    } catch (error) {
      console.error("Appointment creation failed:", error);
      setError(error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      doctorId: "",
      scheduleId: "",
      reason: "",
      mode: "in-person",
    });
    setAvailableSlots({});
    setError("");
    setSuccess("");
  };

  // Modify handleCancel
  const handleCancel = async (appointmentId) => {
    try {
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
        setError("You can only cancel pending appointments");
        return;
      }

      await onUpdate(appointmentId, {
        status: APPOINTMENT_STATUS.CANCELLED,
      });

      setSuccess("Appointment cancelled successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to cancel appointment: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Convert available slots to options list
  const getAvailableSlotOptions = () => {
    const options = [];
    const now = new Date();

    Object.entries(availableSlots).forEach(([date, slots]) => {
      // Strict filtering for available and future slots
      const availableSlots = slots.filter((slot) => {
        const startTime = new Date(slot.startTime);
        const isAvailable = slot.isAvailable === true; // Strict comparison
        const isFuture = startTime > now;

        console.log("Filtering slot:", {
          id: slot._id,
          startTime: startTime.toLocaleString(),
          isAvailable,
          isFuture,
          willInclude: isAvailable && isFuture,
        });

        return isAvailable && isFuture;
      });

      availableSlots.forEach((slot) => {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);

        const formattedStartTime = startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const formattedEndTime = endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const formattedDate = startTime.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        options.push({
          value: slot._id,
          label: `${formattedDate} ${formattedStartTime} - ${formattedEndTime}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        });
      });
    });

    // Sort options by start time
    options.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    console.log("Generated slot options:", {
      total: options.length,
      options: options.map((opt) => ({
        id: opt.value,
        time: opt.label,
        isAvailable: opt.isAvailable,
      })),
    });

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

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

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
              <TableRow
                key={appointment._id}
                sx={{
                  backgroundColor:
                    appointment.status === APPOINTMENT_STATUS.CANCELLED
                      ? "#f5f5f5"
                      : "inherit",
                }}
              >
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
                  {appointment.doctorId?.firstName}{" "}
                  {appointment.doctorId?.lastName}
                </TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>{appointment.mode}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusConfig(appointment.status).label}
                    color={getStatusConfig(appointment.status).color}
                    sx={{ textTransform: "capitalize" }}
                  />
                </TableCell>
                <TableCell>
                  <StatusActions
                    appointment={appointment}
                    onCancel={handleCancel}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {success && (
        <Snackbar
          open={Boolean(success)}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={3000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="appointment-dialog-title"
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle id="appointment-dialog-title">
          Book New Appointment
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {success}
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
              disabled={
                editingAppointment &&
                !getEditableFields(editingAppointment.status).includes(
                  "doctorId"
                )
              }
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </MenuItem>
              ))}
            </TextField>

            {formData.doctorId && (
              <>
                <TextField
                  select
                  label="Available Time Slots"
                  value={formData.scheduleId}
                  onChange={handleTimeSlotChange}
                  fullWidth
                  required
                  disabled={
                    editingAppointment &&
                    !getEditableFields(editingAppointment.status).includes(
                      "scheduleId"
                    )
                  }
                  helperText={
                    getAvailableSlotOptions().length === 0
                      ? "No available time slots for this doctor"
                      : "Please select a time slot"
                  }
                >
                  {getAvailableSlotOptions().map((slot) => (
                    <MenuItem
                      key={slot.value}
                      value={slot.value}
                      disabled={!slot.isAvailable}
                    >
                      {slot.label}
                      {!slot.isAvailable && " (Not Available)"}
                    </MenuItem>
                  ))}
                </TextField>
                {getAvailableSlotOptions().length === 0 && (
                  <Alert severity="info">
                    No available time slots found. Please select a different
                    doctor or try again later.
                  </Alert>
                )}
              </>
            )}

            <TextField
              label="Reason for Visit"
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
              label="Appointment Mode"
              value={formData.mode}
              onChange={(e) =>
                setFormData({ ...formData, mode: e.target.value })
              }
              fullWidth
              required
            >
              <MenuItem value="in-person">In Person</MenuItem>
              <MenuItem value="video">Video Call</MenuItem>
              <MenuItem value="phone">Phone Call</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Book
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
