import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { format } from 'date-fns';

const AppointmentList = ({ appointments, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (!appointments || appointments.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No appointments found.
      </Typography>
    );
  }

  return (
    <List>
      {appointments.map((appointment, index) => (
        <React.Fragment key={appointment._id}>
          <ListItem
            alignItems="flex-start"
            sx={{
              flexDirection: 'column',
              gap: 1,
              py: 2
            }}
          >
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="div">
                {appointment.patientName || 'Patient Name Not Available'}
              </Typography>
              <Chip
                label={appointment.status}
                color={getStatusColor(appointment.status)}
                size="small"
              />
            </Box>
            
            <ListItemText
              primary={
                <Typography variant="body2" color="textSecondary">
                  Date: {format(new Date(appointment.date), 'PPP')}
                  <br />
                  Time: {format(new Date(appointment.date), 'p')}
                </Typography>
              }
              secondary={
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Reason: {appointment.reason}
                </Typography>
              }
            />

            {appointment.status === 'pending' && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => onStatusChange(appointment._id, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => onStatusChange(appointment._id, 'cancelled')}
                >
                  Cancel
                </Button>
              </Box>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => onStatusChange(appointment._id, 'completed')}
              >
                Mark as Completed
              </Button>
            )}
          </ListItem>
          {index < appointments.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default AppointmentList; 