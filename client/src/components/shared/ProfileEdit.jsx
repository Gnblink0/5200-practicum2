import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { userService } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit({ open, onClose, currentUser, onMedicalInfoChange }) {
  const [formData, setFormData] = useState(() => {
    const baseData = {
      email: currentUser?.email || "",
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      phone: currentUser?.phone || "",
      address: {
        street: currentUser?.address?.street || "",
        city: currentUser?.address?.city || "",
        state: currentUser?.address?.state || "",
        zipCode: currentUser?.address?.zipCode || "",
        country: currentUser?.address?.country || "",
      },
      role: currentUser?.role || "",
    };

    if (currentUser?.role === "Doctor") {
      return {
        ...baseData,
        specialization: currentUser.specialization || "",
        licenseNumber: currentUser.licenseNumber || "",
      };
      
    } else if (currentUser?.role === "Patient") {
      return {
        ...baseData,
        dateOfBirth: currentUser.dateOfBirth || "",
        gender: currentUser.gender || "",
        insuranceInfo: {
          provider: currentUser.insuranceInfo?.provider || "",
          policyNumber: currentUser.insuranceInfo?.policyNumber || "",
          coverageDetails: currentUser.insuranceInfo?.coverageDetails || "",
        },
        emergencyContacts: currentUser.emergencyContacts || [{ 
          name: "", 
          relationship: "", 
          phone: "" 
        }],
        medicalHistory: {
          disease: currentUser.disease?.disease || "",
          medications: currentUser.medications?.medications || "",
          allergies: currentUser.medicalHistory?.allergies || "",
          familyHistory: currentUser.medicalHistory?.familyHistory || "",
        }
      };
    }

    return baseData;
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const validateForm = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";

    const hasAnyAddress = Object.values(formData.address).some((value) =>
      value.trim()
    );
    if (hasAnyAddress) {
      if (!formData.address.street.trim())
        return "Street address is required when any address field is filled";
      if (!formData.address.city.trim())
        return "City is required when any address field is filled";
      if (!formData.address.state.trim())
        return "State is required when any address field is filled";
      if (!formData.address.zipCode.trim())
        return "Zip code is required when any address field is filled";
    }

    if (currentUser?.role === "Doctor") {
      if (!formData.specialization.trim()) return "Specialization is required";
      if (!formData.licenseNumber.trim()) return "License number is required";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      console.log("Current user:", currentUser);
      console.log("Submitting form data:", JSON.stringify(formData, null, 2));

      const response = await userService.updateUserProfile(formData);
      console.log("Update response:", response);

      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Update error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to update profile. Please check all required fields."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Handling change for ${name}:`, value);

    if (name === "qualifications") {
      const qualificationsArray = value
        .split(",")
        .map((q) => q.trim())
        .filter((q) => q);
      console.log("Parsed qualifications:", qualificationsArray);
      setFormData((prev) => ({
        ...prev,
        qualifications: qualificationsArray,
      }));
    } else if (name.includes(".")) {
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

    // Only call onMedicalInfoChange if it exists and the field is related to medical info
    if (onMedicalInfoChange && (
      name.includes('medicalHistory') || 
      name.includes('allergies') || 
      name.includes('medications') || 
      name.includes('disease')
    )) {
      onMedicalInfoChange(name, value);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setError("");
      setLoading(true);
      await deleteAccount(password);
      onClose();
      navigate("/login");
    } catch (error) {
      setError(
        error.code === "auth/wrong-password"
          ? "Incorrect password"
          : "Failed to delete account: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              {/* Basic Information - For All Users */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  type="email"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </Grid>

              {/* Doctor-Specific Fields */}
              {currentUser?.role === "Doctor" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </>
              )}

              {/* Patient-Specific Fields */}
              {currentUser?.role === "Patient" && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Medical Information
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      name="dateOfBirth"
                      label="Date of Birth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="gender"
                      label="Gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Insurance Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="insuranceInfo.provider"
                      label="Insurance Provider"
                      value={formData.insuranceInfo?.provider || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="insuranceInfo.policyNumber"
                      label="Policy Number"
                      value={formData.insuranceInfo?.policyNumber || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="insuranceInfo.coverageDetails"
                      label="Coverage Details"
                      value={formData.insuranceInfo?.coverageDetails || ""}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Emergency Contact
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="emergencyContacts.name"
                      label="Emergency Contact Name"
                      value={formData.emergencyContacts?.name || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="emergencyContacts.relationship"
                      label="Relationship"
                      value={formData.emergencyContacts?.relationship || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="emergencyContacts.phone"
                      label="Emergency Contact Phone"
                      value={formData.emergencyContacts?.phone || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Medical History
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="medicalHistory.disease"
                      label="disease"
                      value={formData.medicalHistory?.disease || ""}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      placeholder="List any chronic conditions, separated by commas"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="medicalHistory.medications"
                      label="medications"
                      value={formData.medicalHistory?.medications || ""}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      placeholder="List current medications, dosage, and frequency"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="medicalHistory.allergies"
                      label="Allergies"
                      value={formData.medicalHistory?.allergies || ""}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      placeholder="List any allergies, separated by commas"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="medicalHistory.familyHistory"
                      label="Family Medical History"
                      value={formData.medicalHistory?.familyHistory || ""}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      placeholder="Notable medical conditions in immediate family"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete Account
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Save Changes
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle sx={{ color: "error.main" }}>Delete Account</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Typography>
          <Typography gutterBottom>
            Please enter your password to confirm:
          </Typography>
          <TextField
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            label="Password"
            required
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading || !password}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}