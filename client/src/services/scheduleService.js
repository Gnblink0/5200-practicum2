const API_URL = import.meta.env.VITE_API_URL;

export const scheduleService = {
  // 获取医生的排班
  getSchedules: async () => {
    const response = await fetch(`${API_URL}/schedules`, {
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch schedules");
    return response.json();
  },

  // 创建新排班
  createSchedule: async (scheduleData) => {
    const response = await fetch(`${API_URL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) throw new Error("Failed to create schedule");
    return response.json();
  },

  // 更新排班
  updateSchedule: async (id, scheduleData) => {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) throw new Error("Failed to update schedule");
    return response.json();
  },

  // 删除排班
  deleteSchedule: async (id) => {
    const response = await fetch(`${API_URL}/schedules/${id}`, {
      method: "DELETE",
      headers: {
        "X-User-Email": localStorage.getItem("userEmail"),
        "X-User-UID": localStorage.getItem("userUID"),
      },
    });
    if (!response.ok) throw new Error("Failed to delete schedule");
    return response.json();
  },
};

console.log({
  email: localStorage.getItem("userEmail"),
  uid: localStorage.getItem("userUID"),
});
