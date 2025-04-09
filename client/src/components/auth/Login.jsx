import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("info");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show any messages passed from other components (e.g., after signup)
  React.useEffect(() => {
    if (location.state?.message) {
      setStatusMessage(location.state.message);
      setStatusSeverity(location.state.severity || "info");
    }
  }, [location]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      
      // Authenticate with Firebase and get user data
      const { userData, role } = await login(formData.email, formData.password);
      
      // Show verification status for doctors
      if (role === 'Doctor') {
        let message = '';
        let severity = 'info';
        
        if (userData.verificationStatus === 'pending') {
          message = 'Your account is pending verification. Some features will be limited until verification is complete.';
          severity = 'warning';
        } else if (userData.verificationStatus === 'rejected') {
          message = 'Your verification was rejected. Please contact support for more information.';
          severity = 'error';
        } else if (userData.verificationStatus === 'verified') {
          message = 'Your account is verified. You have full access to all features.';
          severity = 'success';
        }

        if (message) {
          setStatusMessage(message);
          setStatusSeverity(severity);
        }
      }

      // Navigate based on role
      switch (role) {
        case "Admin":
          navigate("/admin-dashboard");
          break;
        case "Doctor":
          navigate("/doctor-dashboard");
          break;
        case "Patient":
          navigate("/patient-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (error.message === "Account not found or has been deleted") {
        setError(
          "This account has been deleted. Please contact an administrator if you believe this is a mistake."
        );
      } else if (error.message === "Failed to fetch user data") {
        setError("Failed to load user profile. Please try again.");
      } else {
        setError("Failed to sign in: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        {statusMessage && (
          <Alert severity={statusSeverity} sx={{ mt: 2, width: "100%" }}>
            {statusMessage}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Button
                component={Link}
                to="/signup"
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Sign Up
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
