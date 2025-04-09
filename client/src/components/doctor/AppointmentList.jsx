import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import { format } from "date-fns";

const AppointmentList = ({ appointments, onStatusChange }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "warning",
        label: "Pending Approval",
      },
      confirmed: {
        color: "success",
        label: "Confirmed",
      },
      cancelled: {
        color: "error",
        label: "Cancelled",
      },
      completed: {
        color: "info",
        label: "Completed",
      },
    };
    return configs[status.toLowerCase()] || { color: "default", label: status };
  };

  if (!appointments || appointments.length === 0) {
    return <Alert severity="info">No appointments found.</Alert>;
  }

  return (
    <List>
      {appointments.map((appointment, index) => (
        <React.Fragment key={appointment._id}>
          <ListItem
            alignItems="flex-start"
            sx={{
              flexDirection: "column",
              gap: 1,
              py: 2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" component="div">
                {appointment.patientId
                  ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
                  : "Patient Name Not Available"}
              </Typography>
              <Chip
                label={getStatusConfig(appointment.status).label}
                color={getStatusConfig(appointment.status).color}
                size="small"
              />
            </Box>

            <ListItemText
              primary={
                <Typography variant="body2" color="textSecondary">
                  Date: {format(new Date(appointment.startTime), "PPP")}
                  <br />
                  Time: {format(new Date(appointment.startTime), "p")} -{" "}
                  {format(new Date(appointment.endTime), "p")}
                  <br />
                  Mode: {appointment.mode}
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

            {/* Only show action buttons for pending appointments */}
            {appointment.status === "pending" && (
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => onStatusChange(appointment._id, "confirmed")}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => onStatusChange(appointment._id, "cancelled")}
                >
                  Reject
                </Button>
              </Box>
            )}

            {/* Show complete button only for confirmed appointments */}
            {appointment.status === "confirmed" && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => onStatusChange(appointment._id, "completed")}
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
