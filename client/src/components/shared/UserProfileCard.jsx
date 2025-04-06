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
              <Typography>
                Qualifications: {user?.qualifications?.join(", ")}
              </Typography>
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
