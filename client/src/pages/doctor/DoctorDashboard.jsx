import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Container,
  Box,
  Typography,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Chip,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";
import { scheduleService } from "../../services/scheduleService";
import { prescriptionService } from "../../services/prescriptionService";
import { appointmentService } from "../../services/appointmentService";
import ScheduleManager from "../../components/doctor/ScheduleManager";
import PrescriptionManager from "../../components/doctor/PrescriptionManager";
import { useNavigate } from "react-router-dom";
import AppointmentList from "../../components/doctor/AppointmentList";

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(
    currentUser?.verificationStatus || "pending"
  );
  const [isVerified, setIsVerified] = useState(
    currentUser?.isVerified || false
  );
  const [success, setSuccess] = useState("");
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const needsVerificationCheck = useRef(true);

  const checkVerificationStatus = useCallback(async () => {
    try {
      const userData = await refreshUserData();

      if (userData.verificationStatus !== verificationStatus) {
        setVerificationStatus(userData.verificationStatus);
      }
      if (userData.isVerified !== isVerified) {
        setIsVerified(userData.isVerified);
      }

      if (userData.verificationStatus === "rejected") {
        setError(
          "Your verification was rejected. Please contact support for more information."
        );
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      setError("Failed to check verification status");
    }
  }, [refreshUserData, verificationStatus, isVerified]);

  const loadAppointments = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      setError("");
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError("Failed to load appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  const loadPrescriptions = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const data = await prescriptionService.getPrescriptions(
        currentUser._id,
        "Doctor"
      );
      setPrescriptions(data);
    } catch (error) {
      setError("Failed to load prescriptions: " + error.message);
    }
  }, [currentUser?._id]);

  const loadSchedules = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error) {
      setError("Failed to load schedules: " + error.message);
    }
  }, [currentUser?._id]);

  const loadData = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      await Promise.all([
        loadAppointments(),
        loadPrescriptions(),
        loadSchedules(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load some dashboard data");
    } finally {
      setLoading(false);
    }
  }, [loadAppointments, loadPrescriptions, loadSchedules, currentUser?._id]);

  // initial load
  useEffect(() => {
    if (currentUser?._id && needsVerificationCheck.current) {
      checkVerificationStatus();
      loadData();
      needsVerificationCheck.current = false;
    }
  }, [currentUser?._id, checkVerificationStatus, loadData]);

  // check verification status every 5 minutes
  useEffect(() => {
    if (!currentUser?._id) return;

    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUser?._id, checkVerificationStatus]);

  const handleAddSchedule = async (scheduleData) => {
    if (!isVerified) {
      setError("Please wait for admin verification to create schedules");
      return;
    }

    try {
      await scheduleService.createSchedule(scheduleData);
      await loadSchedules();
    } catch (error) {
      console.error("Error in handleAddSchedule:", error);
      setError(error.message || "Failed to create schedule");
    }
  };

  const handleUpdateSchedule = async (id, scheduleData) => {
    if (!isVerified) {
      setError("Please wait for admin verification to update schedules");
      return;
    }

    try {
      await scheduleService.updateSchedule(id, scheduleData);
      loadSchedules();
    } catch (error) {
      setError(error.message || "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!isVerified) {
      setError("Please wait for admin verification to delete schedules");
      return;
    }

    try {
      await scheduleService.deleteSchedule(id);
      loadSchedules();
    } catch (error) {
      setError(error.message || "Failed to delete schedule");
    }
  };

  const handleAppointmentStatusChange = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      setError("");

      console.log("Updating appointment status:", { appointmentId, newStatus });

      await appointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus
      );
      await loadAppointments();

      const actionMap = {
        confirmed: "approved",
        cancelled: "rejected",
        completed: "marked as completed",
      };
      setSuccess(`Appointment successfully ${actionMap[newStatus]}`);

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      setError(error.message || "Failed to update appointment status");
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionAdd = async (prescriptionData) => {
    try {
      setLoading(true);
      setError("");

      // 创建处方
      await prescriptionService.createPrescription(prescriptionData);

      // 更新预约状态为已完成
      await appointmentService.updateAppointmentStatus(
        selectedAppointment._id,
        "completed"
      );

      // 重新加载数据
      await loadAppointments();
      await loadPrescriptions();

      setSuccess("Appointment completed and prescription created successfully");
      setShowPrescriptionDialog(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error creating prescription:", error);
      setError(error.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  async function handlePrescriptionUpdate(id, prescriptionData) {
    try {
      await prescriptionService.updatePrescription(id, prescriptionData);
      await loadPrescriptions();
      return true;
    } catch (error) {
      console.error("Failed to update prescription:", error);
      return { error: error.message };
    }
  }

  async function handlePrescriptionDelete(id) {
    try {
      await prescriptionService.deletePrescription(id);
      loadPrescriptions();
    } catch (error) {
      setError("Failed to delete prescription: " + error.message);
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1 }}>
        <DashboardHeader title="Doctor Dashboard" onLogout={handleLogout} />

        <Container sx={{ mt: 4 }}>
          <ErrorAlert error={error} />

          {!isVerified && (
            <Alert
              severity={verificationStatus === "rejected" ? "error" : "warning"}
              sx={{ mb: 4 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={checkVerificationStatus}
                >
                  Check Status
                </Button>
              }
            >
              {verificationStatus === "rejected"
                ? "Your verification was rejected. Please contact support for more information."
                : "Your account is pending verification. You will have limited access until an administrator verifies your account."}
            </Alert>
          )}

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
            <Typography variant="h6" sx={{ mb: 2 }}>
              Appointments
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Patient's Note</TableCell>
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
                        {new Date(appointment.startTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {appointment.patientId?.firstName}{" "}
                        {appointment.patientId?.lastName}
                      </TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>{appointment.mode}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={
                            appointment.status === "pending"
                              ? "warning"
                              : appointment.status === "confirmed"
                              ? "success"
                              : appointment.status === "cancelled"
                              ? "error"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {appointment.status === "pending" && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                handleAppointmentStatusChange(
                                  appointment._id,
                                  "confirmed"
                                )
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleAppointmentStatusChange(
                                  appointment._id,
                                  "cancelled"
                                )
                              }
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        {appointment.status === "confirmed" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleAppointmentStatusChange(
                                appointment._id,
                                "completed"
                              )
                            }
                          >
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mb: 4 }}>
            <ScheduleManager
              schedules={schedules}
              onAdd={handleAddSchedule}
              onUpdate={handleUpdateSchedule}
              onDelete={handleDeleteSchedule}
              error={error}
              isVerified={isVerified}
            />
          </Box>

          <ProfileEdit
            open={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            currentUser={currentUser}
          />

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <AppointmentList
            appointments={appointments}
            onStatusChange={handleAppointmentStatusChange}
          />

          {/* Add Prescription Dialog */}
          <Dialog
            open={showPrescriptionDialog}
            onClose={() => {
              setShowPrescriptionDialog(false);
              setSelectedAppointment(null);
            }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Add Prescription</DialogTitle>
            <DialogContent>
              <PrescriptionManager
                prescriptions={prescriptions}
                onAdd={handlePrescriptionAdd}
                onUpdate={handlePrescriptionUpdate}
                onDelete={handlePrescriptionDelete}
                initialAppointment={selectedAppointment}
              />
            </DialogContent>
          </Dialog>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
