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
import { useAuth } from '../../contexts/AuthContext';

export default function AvgAppointmentDuration() {
  const [durationData, setDurationData] = useState([]);
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

        const response = await fetch('/api/v1/aggregate/stats/avg-appointment-duration', {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setDurationData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching average duration data:', err);
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
        Average Appointment Duration by Specialization
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
            <Table stickyHeader aria-label="average duration table">
              <TableHead>
                <TableRow>
                  <TableCell>Specialization</TableCell>
                  <TableCell align="right">Avg. Duration (Minutes)</TableCell>
                  <TableCell align="right"># Appointments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {durationData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No data available</TableCell>
                  </TableRow>
                ) : (
                  durationData.map((item) => (
                    <TableRow key={item.specialization}>
                      <TableCell>{item.specialization}</TableCell>
                      <TableCell align="right">{item.averageDurationMinutes}</TableCell>
                      <TableCell align="right">{item.numberOfAppointments}</TableCell>
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