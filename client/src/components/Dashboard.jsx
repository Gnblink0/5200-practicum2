import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../services/api";
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Chip,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ProfileEdit from "./ProfileEdit";

export default function Dashboard() {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    admin: null,
  });
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAdmins();
    }
  }, [currentUser]);

  async function loadAdmins() {
    try {
      const data = await adminApi.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      setError("Failed to load admins: " + error.message);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setError("Failed to log out: " + error.message);
    }
  }

  async function handleStatusChange(adminId, newStatus) {
    try {
      await adminApi.updateStatus(adminId, newStatus);
      loadAdmins();
    } catch (error) {
      setError("Failed to update status: " + error.message);
    }
  }

  async function handlePermissionToggle(adminId, permission) {
    try {
      const admin = admins.find((a) => a._id === adminId);
      const currentPermissions = admin.permissions || [];
      let newPermissions;

      if (currentPermissions.includes(permission)) {
        newPermissions = currentPermissions.filter((p) => p !== permission);
      } else {
        newPermissions = [...currentPermissions, permission];
      }

      await adminApi.updatePermissions(adminId, newPermissions);
      loadAdmins();
    } catch (error) {
      setError("Failed to update permissions: " + error.message);
    }
  }

  const handleDeleteClick = (admin) => {
    setDeleteDialog({ open: true, admin });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, admin: null });
  };

  const handleDeleteConfirm = async () => {
    try {
      const admin = deleteDialog.admin;
      setError("");

      // Show loading state
      const loadingMessage = "Deleting admin account...";
      setError(loadingMessage);

      // Delete from backend (which will also delete from Firebase)
      await adminApi.deleteAdmin(admin._id);

      // Update local state
      setAdmins((prevAdmins) => prevAdmins.filter((a) => a._id !== admin._id));
      setDeleteDialog({ open: false, admin: null });

      // Show success message
      setError("Admin account successfully deleted");

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (setError) {
          // Check if component is still mounted
          setError("");
        }
      }, 3000);
    } catch (error) {
      console.error("Delete error:", error);
      setError(`Failed to delete admin: ${error.message}`);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Current User
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography>Email: {currentUser?.email}</Typography>
                <Typography>
                  Name: {currentUser?.firstName} {currentUser?.lastName}
                </Typography>
                <Typography>Role: {currentUser?.role}</Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowEditProfile(true)}
                startIcon={<EditIcon />}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Box>

        <Box>
          <Typography variant="h5" gutterBottom>
            Admin Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/signup"
            sx={{ mb: 2 }}
          >
            Add New Admin
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow
                    key={admin._id}
                    sx={{
                      backgroundColor: !admin.isActive ? "#ffebee" : "inherit",
                    }}
                  >
                    <TableCell>
                      {admin.firstName} {admin.lastName}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {[
                          "user_management",
                          "appointment_management",
                          "prescription_management",
                          "audit_logs",
                        ].map((permission) => (
                          <Chip
                            key={permission}
                            label={permission.replace("_", " ")}
                            color={
                              admin.permissions?.includes(permission)
                                ? "primary"
                                : "default"
                            }
                            onClick={() =>
                              handlePermissionToggle(admin._id, permission)
                            }
                            sx={{ textTransform: "capitalize" }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={admin.isActive}
                        onChange={(e) =>
                          handleStatusChange(admin._id, e.target.checked)
                        }
                        disabled={admin._id === currentUser?._id}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(admin)}
                        disabled={
                          admin._id === currentUser?._id || !admin.isActive
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
          <DialogTitle sx={{ color: "error.main" }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              You are about to delete the following admin account:
            </Typography>
            <Box sx={{ mt: 2, mb: 2, pl: 2 }}>
              <Typography>
                <strong>Name:</strong> {deleteDialog.admin?.firstName}{" "}
                {deleteDialog.admin?.lastName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {deleteDialog.admin?.email}
              </Typography>
            </Box>
            <Typography color="error" variant="body1" gutterBottom>
              This action cannot be undone. The account will be permanently
              deleted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add ProfileEdit Dialog */}
        <ProfileEdit
          open={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentUser={currentUser}
        />
      </Container>
    </Box>
  );
}
