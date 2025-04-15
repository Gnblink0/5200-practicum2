import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardHeader from "../../components/shared/DashboardHeader";
import DataVisualization from "../../components/admin/DataVisualization";

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

        <Box sx={{ mb: 4 }}>
          <DataVisualization />
        </Box>
      </Container>
    </Box>
  );
} 