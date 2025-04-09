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
  FormControlLabel,
  Tooltip,
  Chip,
  Alert,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";

const ScheduleItem = ({ schedule, onDelete, onUpdate }) => {
  const isBooked = !schedule.isAvailable;

  return (
    <ListItem
      secondaryAction={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip
            title={
              isBooked ? "Cannot delete booked schedule" : "Delete schedule"
            }
          >
            <span>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDelete(schedule._id)}
                disabled={isBooked}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      }
    >
      <ListItemText
        primary={
          <Box>
            {new Date(schedule.startTime).toLocaleDateString()}
            {isBooked && (
              <Chip size="small" label="Booked" color="error" sx={{ ml: 1 }} />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" component="span">
              Time: {format(new Date(schedule.startTime), "HH:mm")} -{" "}
              {format(new Date(schedule.endTime), "HH:mm")}
            </Typography>
            <br />
            <Typography
              variant="body2"
              component="span"
              color={isBooked ? "error" : "success"}
            >
              Status: {isBooked ? "Not Available (Booked)" : "Available"}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default function ScheduleManager({
  schedules,
  onAdd,
  onUpdate,
  onDelete,
  error: globalError,
  isVerified,
}) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const handleClickOpen = () => {
    if (!isVerified) {
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setFormData({
      startTime: null,
      endTime: null,
      isAvailable: true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isVerified) {
      return;
    }

    setFormError(null);

    if (!date || !startTime || !endTime) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      // Create Date objects for start and end times
      const startDateTime = new Date(date);
      startDateTime.setHours(
        startTime.getHours(),
        startTime.getMinutes(),
        0,
        0
      );

      const endDateTime = new Date(date);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      if (endDateTime <= startDateTime) {
        setFormError("End time must be after start time");
        return;
      }

      // Check if start time is in the future
      if (startDateTime <= new Date()) {
        setFormError("Schedule start time must be in the future");
        return;
      }

      await onAdd({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      handleClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setFormError(error.message || "Failed to create schedule");
    }
  };

  const handleAvailabilityChange = async (scheduleId, newValue) => {
    try {
      await onUpdate(scheduleId, { isAvailable: newValue });
    } catch (error) {
      setError("Failed to update availability: " + error.message);
    }
  };

  // 过滤schedules
  const filteredSchedules = schedules?.filter(
    (schedule) => !showOnlyAvailable || schedule.isAvailable
  );

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">My Schedules</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                color="primary"
              />
            }
            label="Show only available"
          />
          <Button variant="contained" onClick={handleClickOpen}>
            Add New Schedule
          </Button>
        </Box>
      </Box>

      {!filteredSchedules || filteredSchedules.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          {schedules?.length > 0
            ? "No available schedules found."
            : "No schedules found."}
        </Typography>
      ) : (
        <List>
          {filteredSchedules.map((schedule) => (
            <ScheduleItem
              key={schedule._id}
              schedule={schedule}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Schedule</DialogTitle>
        <DialogContent>
          {(formError || globalError) && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {formError || globalError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={date}
                onChange={setDate}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
