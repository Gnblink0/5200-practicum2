import { Box, Paper, Typography, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function UserProfileCard({ user, onEditClick }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography>Email: {user?.email}</Typography>
          <Typography>
            Name: {user?.firstName} {user?.lastName}
          </Typography>
          <Typography>Role: {user?.role}</Typography>
          {user?.role === "Doctor" && (
            <>
              <Typography>Specialization: {user?.specialization}</Typography>
              <Typography>License Number: {user?.licenseNumber}</Typography>
            </>
          )}
          {user?.role === "Patient" && (
            <>
              <Typography>Date of Birth: {new Date(user?.dateOfBirth).toLocaleDateString()}</Typography>
              <Typography>Gender: {user?.gender}</Typography>

              <Typography variant="h6" mt={2}>Insurance Info</Typography>
              <Typography>Provider: {user?.insuranceInfo?.provider || "N/A"}</Typography>
              <Typography>Policy Number: {user?.insuranceInfo?.policyNumber || "N/A"}</Typography>
              <Typography>Coverage Details: {user?.insuranceInfo?.coverageDetails || "N/A"}</Typography>

              <Typography variant="h6" mt={2}>Emergency Contacts</Typography>
              <Typography>Name: {user?.emergencyContacts?.name|| "N/A"}</Typography>
              <Typography>Relationship: {user?.emergencyContacts?.relationship|| "N/A"}</Typography>
              <Typography>Phone: {user?.emergencyContacts?.phone|| "N/A"}</Typography>


              <Typography variant="h6" mt={2}>Medical History</Typography>
                    <Typography>Disease(s): {user?.medicalHistory?.disease|| "N/A"}</Typography>
                    <Typography>Medications: {user?.medicalHistory?.medications || "N/A"}</Typography>
                    <Typography>Allergies: {user?.medicalHistory?.allergies || "N/A"}</Typography>
                    <Typography>Family History: {user?.medicalHistory?.familyHistory || "N/A"}</Typography>
            </>
          )}

        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={onEditClick}
          startIcon={<EditIcon />}
        >
          Edit Profile
        </Button>
      </Box>
    </Paper>
  );
}
