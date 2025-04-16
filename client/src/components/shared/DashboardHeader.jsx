import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function DashboardHeader({ title, onLogout, startComponent }) {
  return (
    <AppBar position="static">
      <Toolbar>
        {startComponent}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {onLogout && (
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
}
