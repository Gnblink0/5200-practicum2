import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

export default function DoctorVerification() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [open, setOpen] = useState(false);
  const [verificationData, setVerificationData] = useState({
    status: 'verified',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
  });
  const [errors, setErrors] = useState({
    licenseNumber: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const loadPendingDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/doctors/verification/pending`, {
        headers: {
          'X-User-Email': localStorage.getItem('userEmail'),
          'X-User-UID': localStorage.getItem('userUID'),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending doctors');
      }

      const data = await response.json();
      setPendingDoctors(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');

      // Generate license number in the correct format
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const licenseNumber = `MD-${timestamp}-${randomId}`;

      const response = await fetch(
        `${API_URL}/doctors/verification/${selectedDoctor._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': localStorage.getItem('userEmail'),
            'X-User-UID': localStorage.getItem('userUID'),
          },
          body: JSON.stringify({
            licenseNumber: licenseNumber,
            status: verificationData.status
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify doctor');
      }

      const result = await response.json();
      
      // Show detailed success message
      const actionWord = verificationData.status === 'verified' ? 'verified' : 'rejected';
      const alertMessage = `Successfully ${actionWord} doctor: ${selectedDoctor.email}.\n\n` +
        `The doctor will need to:\n` +
        `1. Log out of their account\n` +
        `2. Log back in to see the changes\n` +
        `3. Refresh their dashboard\n\n` +
        `License Number (for verified doctors): ${licenseNumber}`;
      
      alert(alertMessage);

      // Refresh the pending doctors list
      await loadPendingDoctors();
      handleClose();

      // Add success alert
      setSuccessMessage(`Doctor ${actionWord} successfully`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = (doctor) => {
    setSelectedDoctor(doctor);
    setVerificationData({
      status: 'verified',
      licenseNumber: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDoctor(null);
    setVerificationData({
      status: 'verified',
      licenseNumber: '',
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  const checkVerificationStatus = async (retries = 3) => {
    try {
      const userData = await refreshUserData();
      // ... 其他代码 ...
    } catch (error) {
      console.error('Error checking verification status:', error);
      if (retries > 0) {
        setTimeout(() => checkVerificationStatus(retries - 1), 1000);
      } else {
        setError('Failed to check verification status after multiple attempts');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pending Doctor Verifications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingDoctors.map((doctor) => (
              <TableRow key={doctor._id}>
                <TableCell>
                  {doctor.firstName} {doctor.lastName}
                </TableCell>
                <TableCell>{doctor.email}</TableCell>
                <TableCell>
                  {new Date(doctor.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleClickOpen(doctor)}
                  >
                    Verify
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pendingDoctors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending verifications
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Verify Doctor: {selectedDoctor?.firstName} {selectedDoctor?.lastName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={verificationData.status}
                label="Verification Status"
                onChange={(e) =>
                  setVerificationData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <MenuItem value="verified">Verify</MenuItem>
                <MenuItem value="rejected">Reject</MenuItem>
              </Select>
            </FormControl>

            {verificationData.status === 'verified' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                A license number will be automatically generated in the format: MD-[TIMESTAMP]-[RANDOM_ID]
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>CANCEL</Button>
          <Button
            onClick={handleVerify}
            disabled={loading || !selectedDoctor}
          >
            {loading ? 'Processing...' : 'SUBMIT'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 