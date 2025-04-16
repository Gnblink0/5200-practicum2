import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush 
} from 'recharts';

// Helper to determine status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#ff9800'; // warning
    case 'confirmed': return '#4caf50'; // success
    case 'completed': return '#2196f3'; // primary
    case 'cancelled': return '#f44336'; // error
    default: return '#9e9e9e'; // default
  }
};

export default function AppointmentStatusCounts() {
  const [statusData, setStatusData] = useState([]);
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

        // Always use allTime=true to show all time data
        const params = new URLSearchParams();
        params.append('allTime', 'true');

        // Fetch time-series data for all time
        const response = await fetch(`/api/v1/aggregate/stats/appointment-time-series?${params}`, {
          method: 'GET',
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          console.log('Received data:', result.data);
          console.log('Data points count:', result.data.length);
          
          // Calculate total appointments by status
          const totals = result.data.reduce((acc, day) => {
            acc.pending += day.pending || 0;
            acc.confirmed += day.confirmed || 0;
            acc.completed += day.completed || 0;
            acc.cancelled += day.cancelled || 0;
            return acc;
          }, { pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
          
          console.log('Total appointments by status:', totals);
          
          setStatusData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching appointment status time series data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); // Only re-fetch when currentUser changes

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format tooltip values
  const formatTooltipValue = (value, name) => {
    const formattedName = name === 'cancelled' ? 'Canceled' : 
                           name.charAt(0).toUpperCase() + name.slice(1);
    return [value, formattedName];
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Appointment Status Over Time
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : statusData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <Typography>No data available</Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total records: {statusData.length} days (showing all time)
                {' - '}
                Appointments: {
                  statusData.reduce((total, day) => 
                    total + (day.pending + day.confirmed + day.completed + day.cancelled), 0)
                }
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={statusData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={formatTooltipValue}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke={getStatusColor('pending')}
                  activeDot={{ r: 8 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="confirmed"
                  name="Confirmed"
                  stroke={getStatusColor('confirmed')}
                  activeDot={{ r: 8 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke={getStatusColor('completed')}
                  activeDot={{ r: 8 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  name="Canceled"
                  stroke={getStatusColor('cancelled')}
                  activeDot={{ r: 8 }}
                  isAnimationActive={false}
                />
                <Brush dataKey="date" height={30} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
}