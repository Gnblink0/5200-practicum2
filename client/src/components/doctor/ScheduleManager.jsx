import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

export default function ScheduleManager({
  schedules,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [error, setError] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!date || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Create Date objects for start and end times
      const startDateTime = new Date(date);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const endDateTime = new Date(date);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        return;
      }

      await onAdd({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });
      
      handleClose();
    } catch (error) {
      setError(error.message);
      console.error('Error creating schedule:', error);
    }
  };

  const handleAvailabilityChange = async (scheduleId, newValue) => {
    try {
      await onUpdate(scheduleId, { isAvailable: newValue });
    } catch (error) {
      setError('Failed to update availability: ' + error.message);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">My Schedules</Typography>
        <Button variant="contained" onClick={handleClickOpen}>
          Add New Schedule
        </Button>
      </Box>

      {(!schedules || schedules.length === 0) ? (
        <Typography variant="body1" color="textSecondary">
          No schedules found.
        </Typography>
      ) : (
        <List>
          {schedules.map((schedule, index) => (
            <React.Fragment key={schedule._id}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={schedule.isAvailable}
                          onChange={(e) => handleAvailabilityChange(schedule._id, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={schedule.isAvailable ? "Available" : "Not Available"}
                    />
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onDelete(schedule._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={new Date(schedule.startTime).toLocaleDateString()}
                  secondary={
                    <>
                      Time: {new Date(schedule.startTime).toLocaleTimeString()} - {new Date(schedule.endTime).toLocaleTimeString()}
                    </>
                  }
                />
              </ListItem>
              {index < schedules.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                disablePast
                renderInput={(params) => <TextField {...params} />}
              />
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            type="button"
          >
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
