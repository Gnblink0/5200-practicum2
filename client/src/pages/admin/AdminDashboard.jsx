import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { adminApi, userApi } from "../../services/api";
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
import DashboardHeader from "../../components/shared/DashboardHeader";
import UserProfileCard from "../../components/shared/UserProfileCard";
import ErrorAlert from "../../components/shared/ErrorAlert";
import DataTable from "../../components/shared/DataTable";
import ProfileEdit from "../../components/shared/ProfileEdit";

export default function AdminDashboard() {
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

  const adminColumns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "permissions", label: "Permissions" },
    { id: "status", label: "Status" },
  ];

  const userColumns = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "address", label: "Address" },
    { id: "role", label: "Role" },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <DashboardHeader title="Admin Dashboard" onLogout={handleLogout} />

      <Container sx={{ mt: 4 }}>
        <ErrorAlert error={error} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Current User
          </Typography>
          <UserProfileCard
            user={currentUser}
            onEditClick={() => setShowEditProfile(true)}
          />
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
          <DataTable
            columns={adminColumns}
            data={admins}
            renderRow={(admin) => (
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
            )}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            User Management
          </Typography>
          <DataTable
            columns={userColumns}
            data={users}
            renderRow={(user) => (
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
            )}
          />
        </Box>

        <ProfileEdit
          open={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          currentUser={currentUser}
        />
      </Container>
    </Box>
  );
}
