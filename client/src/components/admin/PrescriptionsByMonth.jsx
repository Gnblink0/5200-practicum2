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

// Helper to get month name
const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1); // Month is 0-indexed in JS Date
  return date.toLocaleString('en-US', { month: 'long' });
};

export default function PrescriptionsByMonth() {
  const [prescriptionData, setPrescriptionData] = useState([]);
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

        const response = await fetch('/api/v1/aggregate/stats/prescriptions-by-month', {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setPrescriptionData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching prescriptions by month data:', err);
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
        Prescriptions Issued by Month
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
            <Table stickyHeader aria-label="prescriptions by month table">
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Total Prescriptions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptionData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No data available</TableCell>
                  </TableRow>
                ) : (
                  prescriptionData.map((item, index) => (
                    // Using index as key is okay here if year/month combinations are unique and list is stable
                    <TableRow key={`${item.year}-${item.month}-${index}`}>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{getMonthName(item.month)}</TableCell>
                      <TableCell align="right">{item.totalPrescriptions}</TableCell>
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