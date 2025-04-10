import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  List, // For displaying appointments
  ListItem, // For displaying appointments
  ListItemText, // For displaying appointments
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info'; // Icon for appointment details
import { useAuth } from '../../contexts/AuthContext';

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return dateString; // Return original if formatting fails
    }
};

export default function PendingDoctorsAppointments() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (currentUser?.accessToken) {
          headers.append('Authorization', `Bearer ${currentUser.accessToken}`);
        }

        const response = await fetch('/api/v1/aggregate/admin/pending-doctors-appointments', {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setPendingDoctors(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching pending doctors with appointments:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Doctors Pending Verification with Upcoming Appointments
      </Typography>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table stickyHeader aria-label="pending doctors table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>License #</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Appointments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No pending doctors with appointments found</TableCell>
                  </TableRow>
                ) : (
                  pendingDoctors.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell>{`${doctor.firstName} ${doctor.lastName}`}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                      <TableCell>{doctor.licenseNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={doctor.verificationStatus} color="warning" size="small" />
                      </TableCell>
                      <TableCell>
                        {doctor.upcomingAppointments && doctor.upcomingAppointments.length > 0 ? (
                          <Tooltip title={
                            <List dense disablePadding>
                              {doctor.upcomingAppointments.map(appt => (
                                <ListItem key={appt._id} disableGutters sx={{ py: 0 }}>
                                  <ListItemText 
                                    primary={`${formatDate(appt.startTime)} (${appt.status})`}
                                    secondary={`Reason: ${appt.reason || 'N/A'}`}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          }>
                             <IconButton size="small">
                                <InfoIcon fontSize="small" />
                                <Typography variant="caption" sx={{ml: 0.5}}>{doctor.upcomingAppointments.length}</Typography>
                             </IconButton>
                          </Tooltip>
                        ) : (
                          'None'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
} 