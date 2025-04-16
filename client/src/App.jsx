import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/shared/PrivateRoute";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateAdmin from "./components/auth/CreateAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DataAnalytics from "./pages/admin/DataAnalytics";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <PrivateRoute allowedRoles={["Admin"]}>
                  <DataAnalytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor-dashboard"
              element={
                <PrivateRoute allowedRoles={["Doctor"]}>
                  <DoctorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient-dashboard"
              element={
                <PrivateRoute allowedRoles={["Patient"]}>
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </Router>
  );
}

export default App;
