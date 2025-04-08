import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "Patient", // Default role
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    console.log("Form data before submitting:", formData);
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate password
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Firebase signup
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Prepare data for backend based on role
      const userData = {
        email: formData.email,
        uid: userCredential.user.uid,
        username: formData.email, // Using email as username
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
        },
        isActive: true,
        role: formData.role,
        ...(formData.role === 'Doctor' && formData.licenseNumber ? { licenseNumber: formData.licenseNumber } : {}),
      };

      // Create user in backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": formData.email,
            "X-User-UID": userCredential.user.uid,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        // If backend registration fails, delete the Firebase user
        await userCredential.user.delete();
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user profile");
      }

      // Get the user data from response
      const createdUser = await response.json();
      console.log("Account created successfully:", createdUser);

      // Store role in localStorage for use in the app
      localStorage.setItem("userRole", formData.role);

      navigate("/login", {
        state: {
          message: "Account created successfully! Please login to continue.",
          severity: "success",
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Create New Account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="role-select-label">Account Type</InputLabel>
                <Select
                  labelId="role-select-label"
                  id="role-select"
                  name="role"
                  value={formData.role}
                  label="Account Type"
                  onChange={handleChange}
                >
                  <MenuItem value="Patient">Patient</MenuItem>
                  <MenuItem value="Doctor">Doctor</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Address Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address.street"
                label="Street Address"
                value={formData.address.street}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address.city"
                label="City"
                value={formData.address.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address.state"
                label="State"
                value={formData.address.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address.zipCode"
                label="ZIP/Postal Code"
                value={formData.address.zipCode}
                onChange={handleChange}
                helperText="Enter a US ZIP code (12345 or 12345-6789) or Canadian postal code (e.g., V6X 0M9)"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Button
                component={Link}
                to="/login"
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
