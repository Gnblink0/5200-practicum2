import React, { useState } from 'react';
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
  TextField,
  Button,
  Grid,
} from '@mui/material';
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

export default function PatientHistoryViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [foundPatientInfo, setFoundPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleFetchHistory = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a Patient Full Name (First Last) or Email.');
      setHistoryData(null);
      setFoundPatientInfo(null);
      return;
    }
    setLoading(true);
    setError('');
    setHistoryData(null);
    setFoundPatientInfo(null);
    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      if (currentUser?.accessToken) {
        headers.append('Authorization', `Bearer ${currentUser.accessToken}`);
      }
      
      const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

      const response = await fetch(`/api/v1/aggregate/patients/appointment-history?searchTerm=${encodedSearchTerm}`, {
        method: 'GET',
        headers: headers,
      });

      const result = await response.json();

      if (!response.ok) {
         throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setHistoryData(result.data);
        setFoundPatientInfo(result.foundPatient);
        if (result.data.length === 0) {
            setError(`No appointment history found for ${result.foundPatient?.firstName || ''} ${result.foundPatient?.lastName || ''} (${result.foundPatient?.username || 'N/A'}).`);
        } else {
            setError('');
        }
      } else {
        throw new Error(result.message || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching patient appointment history:', err);
      setError(`Failed to load history: ${err.message}`);
      setHistoryData([]);
      setFoundPatientInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        View Patient Appointment History by Full Name or Email
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="Patient Full Name or Email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleFetchHistory(); }}
              helperText="Enter full name (e.g., John Doe) or email address."
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFetchHistory}
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'Get History'}
            </Button>
          </Grid>
        </Grid>

        {error && <Alert severity={historyData && historyData.length > 0 ? "info" : "warning"} sx={{ mb: 2 }}>{error}</Alert>}
        {foundPatientInfo && !error && historyData && historyData.length > 0 && (
            <Alert severity="success" sx={{ mb: 2 }}>
                Showing history for: {foundPatientInfo.firstName} {foundPatientInfo.lastName} ({foundPatientInfo.username})
            </Alert>
        )}

        {Array.isArray(historyData) && (
             <TableContainer>
                 <Table stickyHeader size="small" aria-label="patient history table">
                   <TableHead>
                     <TableRow>
                       <TableCell>Start Time</TableCell>
                       <TableCell>End Time</TableCell>
                       <TableCell>Status</TableCell>
                       <TableCell>Mode</TableCell>
                       <TableCell>Reason</TableCell>
                       <TableCell>Doctor</TableCell>
                       <TableCell>Specialization</TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {historyData.length === 0 && !loading ? (
                       <TableRow>
                         <TableCell colSpan={7} align="center">- No Appointments Found -</TableCell> 
                       </TableRow>
                     ) : (
                       historyData.map((item) => (
                         <TableRow key={item._id}>
                           <TableCell>{formatDate(item.startTime)}</TableCell>
                           <TableCell>{formatDate(item.endTime)}</TableCell>
                           <TableCell>{item.status}</TableCell>
                           <TableCell>{item.mode}</TableCell>
                           <TableCell>{item.reason}</TableCell>
                           <TableCell>{`${item.doctor?.firstName || ''} ${item.doctor?.lastName || ''}`}</TableCell>
                           <TableCell>{item.doctor?.specialization || 'N/A'}</TableCell>
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