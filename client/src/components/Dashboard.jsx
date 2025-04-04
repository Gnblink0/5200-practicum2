import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, userApi } from "../services/api";
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
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import ProfileEdit from "./ProfileEdit";

export default function Dashboard() {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAdmins();
      loadUsers();
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

  async function loadUsers() {
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      setError("Failed to load users: " + error.message);
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            User Management
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.address?.street}, {user.address?.city},{" "}
                      {user.address?.state} {user.address?.zipCode}
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

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
