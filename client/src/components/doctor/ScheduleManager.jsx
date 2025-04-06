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
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";

export default function ScheduleManager({
  schedules,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleSubmit = () => {
    if (editingSchedule) {
      onUpdate(editingSchedule._id, {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
    } else {
      onAdd({
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setStartTime("");
    setEndTime("");
    setEditingSchedule(null);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">My Schedules</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Schedule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule._id}>
                <TableCell>
                  {new Date(schedule.startTime).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(schedule.startTime).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {new Date(schedule.endTime).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(schedule)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(schedule._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              type="datetime-local"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="datetime-local"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSchedule ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
