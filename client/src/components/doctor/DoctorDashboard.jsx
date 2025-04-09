const loadSchedules = async () => {
  try {
    const data = await scheduleService.getSchedules();
    setSchedules(data);
  } catch (error) {
    console.error("Error loading schedules:", error);
    if (error.message.includes("admin verification")) {
      setError("Your account is pending verification. You can view schedules but cannot modify them until verified.");
    } else {
      setError(error.message || "Failed to load schedules");
    }
  }
};

const handleCreateSchedule = async (scheduleData) => {
  try {
    const newSchedule = await scheduleService.createSchedule(scheduleData);
    setSchedules([...schedules, newSchedule]);
    setOpenCreateDialog(false);
  } catch (error) {
    console.error("Error creating schedule:", error);
    if (error.message.includes("admin verification")) {
      setError("Your account is pending verification. You cannot create schedules until verified.");
    } else {
      setError(error.message || "Failed to create schedule");
    }
  }
};

const handleUpdateSchedule = async (id, scheduleData) => {
  try {
    const updatedSchedule = await scheduleService.updateSchedule(id, scheduleData);
    setSchedules(schedules.map(s => s._id === id ? updatedSchedule : s));
    setOpenEditDialog(false);
  } catch (error) {
    console.error("Error updating schedule:", error);
    if (error.message.includes("admin verification")) {
      setError("Your account is pending verification. You cannot update schedules until verified.");
    } else {
      setError(error.message || "Failed to update schedule");
    }
  }
};

const handleDeleteSchedule = async (id) => {
  try {
    await scheduleService.deleteSchedule(id);
    setSchedules(schedules.filter(s => s._id !== id));
  } catch (error) {
    console.error("Error deleting schedule:", error);
    if (error.message.includes("admin verification")) {
      setError("Your account is pending verification. You cannot delete schedules until verified.");
    } else {
      setError(error.message || "Failed to delete schedule");
    }
  }
}; 