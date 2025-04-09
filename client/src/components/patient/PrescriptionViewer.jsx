import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

export default function PrescriptionViewer({ prescriptions }) {
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const handleClose = () => {
    setSelectedPrescription(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "error";
      case "cancelled":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">My Prescriptions</Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Medications</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  {new Date(prescription.issuedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                </TableCell>
                <TableCell>{prescription.diagnosis}</TableCell>
                <TableCell>
                  {prescription.medications
                    .map((med) => `${med.name} ${med.dosage}`)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={prescription.status}
                    color={getStatusColor(prescription.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<InfoIcon />}
                    onClick={() => setSelectedPrescription(prescription)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedPrescription}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Issued Date:</strong>{" "}
                {new Date(selectedPrescription.issuedDate).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Expiry Date:</strong>{" "}
                {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Doctor:</strong> {selectedPrescription.doctor?.firstName}{" "}
                {selectedPrescription.doctor?.lastName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Diagnosis:</strong> {selectedPrescription.diagnosis}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong>{" "}
                <Chip
                  label={selectedPrescription.status}
                  color={getStatusColor(selectedPrescription.status)}
                  size="small"
                />
              </Typography>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Medications
              </Typography>
              {selectedPrescription.medications.map((medication, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid #ddd" }}>
                  <Typography variant="subtitle1">
                    <strong>Name:</strong> {medication.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Dosage:</strong> {medication.dosage}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Frequency:</strong> {medication.frequency}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Duration:</strong> {medication.duration}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 