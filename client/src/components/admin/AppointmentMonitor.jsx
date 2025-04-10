import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { appointmentService } from "../../services/appointmentService";

const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const STATUS_FILTERS = [
  { value: "all", label: "All Appointments" },
  { value: APPOINTMENT_STATUS.PENDING, label: "Pending" },
  { value: APPOINTMENT_STATUS.CONFIRMED, label: "Confirmed" },
  { value: APPOINTMENT_STATUS.COMPLETED, label: "Completed" },
  { value: APPOINTMENT_STATUS.CANCELLED, label: "Cancelled" },
];

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

export default function AppointmentMonitor() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      };

      const data = await appointmentService.getAllAppointments(filters);
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError(error.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, startDate, endDate]);

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Appointment Monitor
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow
                key={appointment._id}
                hover
                onClick={() => handleRowClick(appointment)}
                sx={{ cursor: "pointer" }}
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
                <TableCell>
                  {appointment.patientId?.firstName}{" "}
                  {appointment.patientId?.lastName}
                </TableCell>
                <TableCell>{appointment.mode}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusConfig(appointment.status).label}
                    color={getStatusConfig(appointment.status).color}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Doctor Information
              </Typography>
              <Typography variant="body2" paragraph>
                Name: {selectedAppointment.doctorId?.firstName}{" "}
                {selectedAppointment.doctorId?.lastName}
                <br />
                Email: {selectedAppointment.doctorId?.email}
                <br />
                Specialization: {selectedAppointment.doctorId?.specialization}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Patient Information
              </Typography>
              <Typography variant="body2" paragraph>
                Name: {selectedAppointment.patientId?.firstName}{" "}
                {selectedAppointment.patientId?.lastName}
                <br />
                Email: {selectedAppointment.patientId?.email}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Appointment Details
              </Typography>
              <Typography variant="body2">
                Date:{" "}
                {new Date(selectedAppointment.startTime).toLocaleDateString()}
                <br />
                Time:{" "}
                {new Date(
                  selectedAppointment.startTime
                ).toLocaleTimeString()} -{" "}
                {new Date(selectedAppointment.endTime).toLocaleTimeString()}
                <br />
                Mode: {selectedAppointment.mode}
                <br />
                Status: {getStatusConfig(selectedAppointment.status).label}
                <br />
                Reason: {selectedAppointment.reason}
                {selectedAppointment.notes && (
                  <>
                    <br />
                    Notes: {selectedAppointment.notes}
                  </>
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAppointment(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
