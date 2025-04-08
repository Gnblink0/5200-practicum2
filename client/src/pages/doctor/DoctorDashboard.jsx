import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Box, Typography, TableRow, TableCell, CircularProgress, Alert, Chip, Button } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(currentUser?.verificationStatus || 'pending');
  const [isVerified, setIsVerified] = useState(currentUser?.isVerified || false);
  
  // 使用 ref 来跟踪是否需要检查验证状态
  const needsVerificationCheck = useRef(true);

  const checkVerificationStatus = useCallback(async () => {
    try {
      const userData = await refreshUserData();
      
      // 只在状态真正改变时更新
      if (userData.verificationStatus !== verificationStatus) {
        setVerificationStatus(userData.verificationStatus);
      }
      if (userData.isVerified !== isVerified) {
        setIsVerified(userData.isVerified);
      }

      if (userData.verificationStatus === 'rejected') {
        setError('Your verification was rejected. Please contact support for more information.');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setError('Failed to check verification status');
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
      console.error('Error loading appointments:', error);
      setError("Failed to load appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  const loadPrescriptions = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const data = await prescriptionService.getPrescriptions(currentUser._id, "Doctor");
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
        loadSchedules()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  }, [loadAppointments, loadPrescriptions, loadSchedules, currentUser?._id]);

  // 初始化加载
  useEffect(() => {
    if (currentUser?._id && needsVerificationCheck.current) {
      checkVerificationStatus();
      loadData();
      needsVerificationCheck.current = false;
    }
  }, [currentUser?._id, checkVerificationStatus, loadData]);

  // 定期检查验证状态（每5分钟）
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
      console.error('Error in handleAddSchedule:', error);
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

  async function handleAddPrescription(prescriptionData) {
    try {
      await prescriptionService.createPrescription(prescriptionData);
      await loadPrescriptions();
      return true;
    } catch (error) {
      console.error('Failed to create prescription:', error);
      return { error: error.message };
    }
  }

  async function handleUpdatePrescription(id, prescriptionData) {
    try {
      await prescriptionService.updatePrescription(id, prescriptionData);
      await loadPrescriptions();
      return true;
    } catch (error) {
      console.error('Failed to update prescription:', error);
      return { error: error.message };
    }
  }

  async function handleDeletePrescription(id) {
    try {
      await prescriptionService.deletePrescription(id);
      loadPrescriptions();
    } catch (error) {
      setError("Failed to delete prescription: " + error.message);
    }
  }

  const appointmentColumns = [
    { id: "date", label: "Date" },
    { id: "time", label: "Time" },
    { id: "patient", label: "Patient" },
    { id: "reason", label: "Patient's Note" },
    { id: "mode", label: "Mode" },
    { id: "status", label: "Status" },
  ];

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
              severity={verificationStatus === 'rejected' ? 'error' : 'warning'} 
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
              {verificationStatus === 'rejected' 
                ? 'Your verification was rejected. Please contact support for more information.'
                : 'Your account is pending verification. You will have limited access until an administrator verifies your account.'}
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
            <Typography variant="h5" gutterBottom>
              Appointments
            </Typography>
            {!isVerified ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                You will be able to manage appointments after your account is verified.
              </Alert>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : appointments.length === 0 ? (
              <Typography variant="body1" color="textSecondary">
                No appointments found.
              </Typography>
            ) : (
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                renderRow={(appointment) => (
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
                      {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                    </TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>{appointment.mode}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={
                          appointment.status === "confirmed"
                            ? "success"
                            : appointment.status === "pending"
                            ? "warning"
                            : appointment.status === "cancelled"
                            ? "error"
                            : "info"
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )}
              />
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <PrescriptionManager
              prescriptions={prescriptions}
              onAdd={handleAddPrescription}
              onUpdate={handleUpdatePrescription}
              onDelete={handleDeletePrescription}
            />
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
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
