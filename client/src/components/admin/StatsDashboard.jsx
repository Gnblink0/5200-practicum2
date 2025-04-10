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
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext'; // Assuming useAuth gives access to token or UID

export default function StatsDashboard() {
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // Get currentUser to potentially pass auth info

  useEffect(() => {
    const fetchTopDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        // Construct headers, include Authorization if needed
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        // Add authorization token if your API requires it
        if (currentUser?.accessToken) { // Or currentUser.uid depending on your auth setup
             headers.append('Authorization', `Bearer ${currentUser.accessToken}`);
        }
        // Include other potential headers like UID or Email if required by backend middleware
        // headers.append('X-User-UID', currentUser.uid);

        const response = await fetch('/api/v1/aggregate/stats/top-doctors', {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setTopDoctors(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch top doctors');
        }
      } catch (err) {
        console.error('Error fetching top doctors:', err);
        setError(`Failed to load top doctors: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDoctors();
  }, [currentUser]); // Re-fetch if user changes

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Top 5 Doctors by Completed Appointments
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
            <Table stickyHeader aria-label="top doctors table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell align="right">Completed Appointments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topDoctors.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} align="center">No data available</TableCell>
                    </TableRow>
                ) : (
                    topDoctors.map((doctor, index) => (
                      <TableRow key={doctor.doctorId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{doctor.firstName}</TableCell>
                        <TableCell>{doctor.lastName}</TableCell>
                        <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                        <TableCell align="right">{doctor.totalCompletedAppointments}</TableCell>
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