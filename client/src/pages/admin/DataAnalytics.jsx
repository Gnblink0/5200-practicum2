import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardHeader from "../../components/shared/DashboardHeader";
import DataVisualization from "../../components/admin/DataVisualization";
import AppointmentStatusCounts from "../../components/admin/AppointmentStatusCounts";

export default function DataAnalytics() {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardHeader 
        title="Data Analytics Dashboard" 
        startComponent={
          <IconButton 
            color="inherit" 
            onClick={() => navigate("/admin-dashboard")}
            aria-label="Back to Admin Dashboard"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        }
      />

      <Container sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Data Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View appointment statistics, time distribution, and other key metrics
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Appointment Status Over Time Chart */}
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom>
              Appointment Status Trends
            </Typography>
            <AppointmentStatusCounts />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          {/* Other Data Visualizations */}
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom>
              Detailed Analytics
            </Typography>
            <DataVisualization />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 