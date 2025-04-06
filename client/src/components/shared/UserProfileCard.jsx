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
              {user?.emergencyContacts?.length > 0 ? (
                user.emergencyContacts.map((contact, index) => (
                  <Box key={index} mb={1}>
                    <Typography>Name: {contact.name}</Typography>
                    <Typography>Relationship: {contact.relationship}</Typography>
                    <Typography>Phone: {contact.phone}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>No emergency contacts provided.</Typography>
              )}

              <Typography variant="h6" mt={2}>Medical History</Typography>
              {user?.medicalHistory?.length > 0 ? (
                user.medicalHistory.map((history, index) => (
                  <Box key={index} mb={2}>
                    <Typography>Disease(s): {history.disease?.join(", ") || "None"}</Typography>
                    <Typography>Medications: {history.medications?.join(", ") || "None"}</Typography>
                    <Typography>Allergies: {history.allergies?.join(", ") || "None"}</Typography>
                    <Typography>Family History: {history.familyHistory || "N/A"}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>No medical history provided.</Typography>
              )}
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
