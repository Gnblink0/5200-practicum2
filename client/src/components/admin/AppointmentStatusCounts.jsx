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
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

// Helper to determine chip color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'success';
    case 'completed': return 'primary';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export default function AppointmentStatusCounts() {
  const [statusCounts, setStatusCounts] = useState([]);
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

        const response = await fetch('/api/v1/aggregate/stats/appointment-counts', {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setStatusCounts(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching appointment status counts:', err);
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
        Appointment Counts by Status
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
            <Table stickyHeader aria-label="appointment status counts table">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statusCounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No data available</TableCell>
                  </TableRow>
                ) : (
                  statusCounts.map((item) => (
                    <TableRow key={item.status}>
                      <TableCell>
                         <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
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