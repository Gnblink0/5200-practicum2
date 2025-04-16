const express = require('express');
const router = express.Router();
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const Prescription = require('../../models/Prescription');

// 获取预约状态统计
router.get('/appointments/status', async (req, res) => {
  try {
    const statusStats = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);
    res.json(statusStats);
  } catch (error) {
    console.error('Error fetching appointment status statistics:', error);
    res.status(500).json({ error: 'Failed to fetch appointment status data' });
  }
});

// 获取医生排名数据
router.get('/doctors/ranking', async (req, res) => {
  try {
    const topDoctors = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$doctorId', value: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { 
        $project: { 
          name: { $concat: ['$doctor.firstName', ' ', '$doctor.lastName'] }, 
          value: 1, 
          _id: 0 
        } 
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);
    res.json(topDoctors);
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    res.status(500).json({ error: 'Failed to fetch top doctors data' });
  }
});

// 获取每月处方统计
router.get('/prescriptions/monthly', async (req, res) => {
  try {
    const monthlyStats = await Prescription.aggregate([
      {
        $project: {
          yearMonth: { 
            $concat: [
              { $toString: { $year: '$createdAt' } }, 
              '年', 
              { $toString: { $month: '$createdAt' } },
              '月'
            ] 
          }
        }
      },
      { $group: { _id: '$yearMonth', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { name: 1 } },
      { $limit: 6 }
    ]);
    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching prescription statistics:', error);
    res.status(500).json({ error: 'Failed to fetch prescription data' });
  }
});

// 获取预约趋势数据
router.get('/appointments/trend', async (req, res) => {
  try {
    const now = new Date();
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 7 * 6);
    
    const appointments = await Appointment.find({
      createdAt: { $gte: sixWeeksAgo, $lte: now }
    });
    
    const weeklyData = {};
    appointments.forEach(appointment => {
      const date = new Date(appointment.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const weekInMonth = Math.ceil(date.getDate() / 7);
      const weekId = `${year}年${month}月第${weekInMonth}周`;
      
      if (!weeklyData[weekId]) {
        weeklyData[weekId] = {
          name: `${month}月第${weekInMonth}周`,
          value: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0
        };
      }
      
      weeklyData[weekId].value++;
      switch(appointment.status) {
        case 'confirmed':
          weeklyData[weekId].confirmed++;
          break;
        case 'cancelled':
          weeklyData[weekId].cancelled++;
          break;
        case 'completed':
          weeklyData[weekId].completed++;
          break;
      }
    });
    
    const result = Object.values(weeklyData).sort((a, b) => {
      const [aMonth, aWeek] = [parseInt(a.name.split('月')[0]), parseInt(a.name.split('第')[1])];
      const [bMonth, bWeek] = [parseInt(b.name.split('月')[0]), parseInt(b.name.split('第')[1])];
      return aMonth !== bMonth ? aMonth - bMonth : aWeek - bWeek;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching appointment trend data:', error);
    res.status(500).json({ error: 'Failed to fetch appointment trend data' });
  }
});

// 获取专科平均预约时长
router.get('/specialization/duration', async (req, res) => {
  try {
    const specializationDuration = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: 'userId', as: 'doctor' } },
      { $unwind: '$doctor' },
      { 
        $group: { 
          _id: '$doctor.specialization', 
          totalDuration: { $sum: '$duration' },
          count: { $sum: 1 }
        } 
      },
      { 
        $project: { 
          name: { $ifNull: ['$_id', '其他专科'] },
          value: { $divide: ['$totalDuration', '$count'] },
          count: 1,
          _id: 0 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    res.json(specializationDuration);
  } catch (error) {
    console.error('Error fetching specialization duration data:', error);
    res.status(500).json({ error: 'Failed to fetch specialization duration data' });
  }
});

// 获取每日预约统计
router.get('/appointments/daily', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo, $lte: now }
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          status: 1
        }
      },
      {
        $group: {
          _id: "$date",
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          name: "$_id",
          total: 1,
          confirmed: 1,
          completed: 1,
          cancelled: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.json(dailyStats);
  } catch (error) {
    console.error('Error fetching daily appointment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch daily statistics' });
  }
});

// 获取每周预约统计
router.get('/appointments/weekly', async (req, res) => {
  try {
    const now = new Date();
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks

    const weeklyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveWeeksAgo, $lte: now }
        }
      },
      {
        $project: {
          week: {
            $concat: [
              { $toString: { $year: "$createdAt" } },
              "年第",
              { $toString: { $week: "$createdAt" } },
              "周"
            ]
          },
          status: 1
        }
      },
      {
        $group: {
          _id: "$week",
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          name: "$_id",
          total: 1,
          confirmed: 1,
          completed: 1,
          cancelled: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.json(weeklyStats);
  } catch (error) {
    console.error('Error fetching weekly appointment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch weekly statistics' });
  }
});

// 获取每月预约统计
router.get('/appointments/monthly', async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo, $lte: now }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: { $year: "$createdAt" } },
              "年",
              { $toString: { $month: "$createdAt" } },
              "月"
            ]
          },
          status: 1
        }
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          name: "$_id",
          total: 1,
          confirmed: 1,
          completed: 1,
          cancelled: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);
    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly appointment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch monthly statistics' });
  }
});

// 获取预约热力图数据
router.get('/appointments/heatmap', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const heatmapData = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo, $lte: now }
        }
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1-7, 1 represents Sunday
          hour: { $hour: "$createdAt" },
          status: 1
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: "$dayOfWeek",
            hour: "$hour"
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          day: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.dayOfWeek", 1] }, then: "周日" },
                { case: { $eq: ["$_id.dayOfWeek", 2] }, then: "周一" },
                { case: { $eq: ["$_id.dayOfWeek", 3] }, then: "周二" },
                { case: { $eq: ["$_id.dayOfWeek", 4] }, then: "周三" },
                { case: { $eq: ["$_id.dayOfWeek", 5] }, then: "周四" },
                { case: { $eq: ["$_id.dayOfWeek", 6] }, then: "周五" },
                { case: { $eq: ["$_id.dayOfWeek", 7] }, then: "周六" }
              ],
              default: "未知"
            }
          },
          hour: "$_id.hour",
          value: "$count",
          _id: 0
        }
      },
      { $sort: { day: 1, hour: 1 } }
    ]);

    // 填充缺失的时间段（没有预约的时间段）
    const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const fullData = [];

    days.forEach(day => {
      hours.forEach(hour => {
        const existingData = heatmapData.find(d => d.day === day && d.hour === hour);
        fullData.push({
          day,
          hour,
          value: existingData ? existingData.value : 0
        });
      });
    });

    res.json(fullData);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

module.exports = router; 