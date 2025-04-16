import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, useTheme, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Scatter
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';
import PropTypes from 'prop-types';

// 更现代的配色方案
const COLORS = ['#2196F3', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0'];
const CHART_COLORS = {
  primary: '#2196F3',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5722',
  info: '#03A9F4'
};

// 自定义图表提示框样式
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        p: 1.5,
        boxShadow: 3,
        border: 'none'
      }}>
        <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color, fontWeight: 500 }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

// 热力图颜色计算函数
const getHeatMapColor = (value, maxValue) => {
  const intensity = value / maxValue;
  return `rgba(33, 150, 243, ${Math.max(0.1, intensity)})`;
};

// Gradient for AreaChart
const GradientDefs = () => (
  <defs>
    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
    </linearGradient>
    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#FF5722" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#FF5722" stopOpacity={0.1}/>
    </linearGradient>
  </defs>
);

// WorkTimeHeatmap组件（完全按照用户给定实现）
const WorkTimeHeatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No appointment time data available
        </Typography>
      </Box>
    );
  }

  const days = [
    { dataKey: 'day1', name: 'Monday' },
    { dataKey: 'day2', name: 'Tuesday' },
    { dataKey: 'day3', name: 'Wednesday' },
    { dataKey: 'day4', name: 'Thursday' },
    { dataKey: 'day5', name: 'Friday' },
    { dataKey: 'day6', name: 'Saturday' },
    { dataKey: 'day7', name: 'Sunday' }
  ];

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ minWidth: 700, p: 2 }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto repeat(7, 1fr)',
            gap: 1
          }}
        >
          {/* Header row with day names */}
          <Box sx={{ gridColumn: '1/1', p: 1 }}></Box>
          {days.map((day, index) => (
            <Box key={index} sx={{ 
              p: 1, 
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              {day.name}
            </Box>
          ))}
          {/* Data rows */}
          {data.map((timeSlot, timeIndex) => (
            <React.Fragment key={timeIndex}>
              {/* Time label */}
              <Box sx={{ 
                p: 1, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}>
                {timeSlot.time}
              </Box>
              {/* Data cells */}
              {days.map((day, dayIndex) => {
                const count = timeSlot[day.dataKey] || 0;
                const intensity = Math.min(count / 10, 1); // Scale for coloring
                return (
                  <Box 
                    key={dayIndex}
                    sx={{ 
                      p: 1,
                      textAlign: 'center',
                      backgroundColor: `rgba(25, 118, 210, ${intensity})`,
                      color: intensity > 0.5 ? 'white' : 'black',
                      borderRadius: 1,
                    }}
                  >
                    {count}
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
WorkTimeHeatmap.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      day1: PropTypes.number,
      day2: PropTypes.number,
      day3: PropTypes.number,
      day4: PropTypes.number,
      day5: PropTypes.number,
      day6: PropTypes.number,
      day7: PropTypes.number
    })
  )
};

// DoctorRankingBarChart组件
const DoctorRankingBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No doctor ranking data available
        </Typography>
      </Box>
    );
  }
  // 只显示前10名
  const limitedData = data.slice(0, 10);
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={limitedData}
          layout="vertical"
          margin={{ top: 20, right: 60, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip formatter={(value) => [`${value} appointments`, 'Count']} />
          <Legend />
          <Bar dataKey="value" name="Appointments" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
DoctorRankingBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  )
};

// DepartmentDistributionPie组件
const DepartmentDistributionPie = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No department data available
        </Typography>
      </Box>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6B6B', '#4ECDC4', '#C7F464'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} appointments`, 'Count']} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
DepartmentDistributionPie.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })
  )
};

// 工具函数：将原始heatmapData转换为WorkTimeHeatmap需要的结构
function convertHeatmapData(raw) {
  // raw: [{ day: 'Monday', hour: 0, value: 2 }, ...]
  // 目标：[{ time: '08:00', day1: 2, ..., day7: 0 }, ...] 只保留08:00-18:00
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8~18
  // 中英文都支持
  const dayMap = {
    'Monday': 'day1', '周一': 'day1',
    'Tuesday': 'day2', '周二': 'day2',
    'Wednesday': 'day3', '周三': 'day3',
    'Thursday': 'day4', '周四': 'day4',
    'Friday': 'day5', '周五': 'day5',
    'Saturday': 'day6', '周六': 'day6',
    'Sunday': 'day7', '周日': 'day7',
  };
  // 初始化每小时一行
  const result = hours.map(h => {
    const row = { time: `${h.toString().padStart(2, '0')}:00` };
    Object.values(dayMap).forEach(dk => { row[dk] = 0; });
    return row;
  });
  // 填充数据
  raw.forEach(item => {
    const hourIdx = item.hour;
    const dayKey = dayMap[item.day];
    if (typeof hourIdx === 'number' && dayKey && hourIdx >= 8 && hourIdx <= 18) {
      result[hourIdx - 8][dayKey] = item.value;
    }
  });
  return result;
}

// 工具函数：补全最近N周/最近N月的数据，没有的补0
function fillTimeSeries(data, type = 'week', count = 12) {
  const now = new Date();
  let labels = [];
  if (type === 'week') {
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay() + 1 - i * 7); // Monday
      const year = d.getFullYear();
      const week = getWeekNumber(d).toString().padStart(2, '0');
      labels.push(`${year}-W${week}`);
    }
  } else if (type === 'month') {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      labels.push(`${monthNames[month]} ${year}`);
    }
  }
  // 先用英文label补全数据，强制name为英文label
  let convertedData = data;
  if (type === 'week') {
    convertedData = data.map(d => ({ ...d, name: weekNameToEn(d.name) }));
  } else if (type === 'month') {
    convertedData = data.map(d => ({ ...d, name: monthNameToEn(d.name) }));
  }
  // 用labels补全数据，强制name为英文label
  return labels.map(label => {
    // 在后端数据中找：week用weekNameToEn，month用monthNameToEn
    let found;
    if (type === 'week') {
      found = data.find(d => weekNameToEn(d.name) === label);
    } else if (type === 'month') {
      found = data.find(d => monthNameToEn(d.name) === label);
    }
    if (found) {
      const { confirmed = 0, completed = 0, cancelled = 0, total = 0 } = found;
      return { name: label, confirmed, completed, cancelled, total };
    }
    return { name: label, confirmed: 0, completed: 0, cancelled: 0, total: 0 };
  });
}

// 获取某日期在当年第几周
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

function weekNameToEn(name) {
  // 例："2025年第15周" => "2025-W15"
  const match = name.match(/(\d{4})年第(\d+)周/);
  if (match) {
    const year = match[1];
    const week = match[2].padStart(2, '0');
    return `${year}-W${week}`;
  }
  return name;
}

function monthNameToEn(name) {
  // 例："2025年4月" => "Apr 2025"
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const match = name.match(/(\d{4})年(\d+)月/);
  if (match) {
    const year = match[1];
    const month = monthNames[parseInt(match[2], 10) - 1];
    return `${month} ${year}`;
  }
  return name;
}

export default function DataVisualization() {
  const theme = useTheme();
  const [data, setData] = useState({
    appointmentStatus: [],
    topDoctors: [],
    prescriptionTrend: [],
    appointmentTrend: [],
    specializationDuration: [],
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    heatmapData: []
  });
  const [timeRange, setTimeRange] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    console.log('fetchData called');
    setRefreshing(true);
    try {
      const [
        statusResponse,
        doctorsResponse,
        prescriptionResponse,
        trendResponse,
        durationResponse,
        dailyResponse,
        weeklyResponse,
        monthlyResponse,
        heatmapResponse
      ] = await Promise.all([
        axios.get('/api/admin/analytics/appointments/status'),
        axios.get('/api/admin/analytics/doctors/ranking'),
        axios.get('/api/admin/analytics/prescriptions/monthly'),
        axios.get('/api/admin/analytics/appointments/trend'),
        axios.get('/api/admin/analytics/specialization/duration'),
        axios.get('/api/admin/analytics/appointments/daily'),
        axios.get('/api/admin/analytics/appointments/weekly'),
        axios.get('/api/admin/analytics/appointments/monthly'),
        axios.get('/api/admin/analytics/appointments/heatmap')
      ]);

      console.log('heatmapData raw:', heatmapResponse.data);
      console.log('weeklyStats:', weeklyResponse.data);
      console.log('monthlyStats:', monthlyResponse.data);

      setData({
        appointmentStatus: statusResponse.data,
        topDoctors: doctorsResponse.data,
        prescriptionTrend: prescriptionResponse.data,
        appointmentTrend: trendResponse.data,
        specializationDuration: durationResponse.data,
        dailyStats: dailyResponse.data,
        weeklyStats: weeklyResponse.data,
        monthlyStats: monthlyResponse.data,
        heatmapData: heatmapResponse.data
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      setData(prev => ({
        ...prev,
        weeklyStats: fillTimeSeries(prev.weeklyStats, 'week', 12),
        monthlyStats: fillTimeSeries(prev.monthlyStats, 'month', 12)
      }));
    }
  }, [loading, error]);

  const chartCard = (title, chart) => (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        p: 2,
        mb: 2
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {chart}
      </CardContent>
    </Card>
  );

  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'daily':
        return {
          data: data.dailyStats,
          title: 'Daily Appointments (Last 30 Days)'
        };
      case 'weekly':
        return {
          data: data.weeklyStats,
          title: 'Weekly Appointments (Last 12 Weeks)'
        };
      case 'monthly':
        return {
          data: data.monthlyStats,
          title: 'Monthly Appointments (Last 12 Months)'
        };
      default:
        return {
          data: data.dailyStats,
          title: 'Daily Appointments'
        };
    }
  };

  if (loading) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">Loading...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" color="error">Error: {error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, newValue) => newValue && setTimeRange(newValue)}
          aria-label="time range"
        >
          <ToggleButton value="daily" aria-label="daily">
            Daily
          </ToggleButton>
          <ToggleButton value="weekly" aria-label="weekly">
            Weekly
          </ToggleButton>
          <ToggleButton value="monthly" aria-label="monthly">
            Monthly
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={refreshing}
        >
          Refresh Data
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {chartCard(getTimeRangeData().title, (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getTimeRangeData().data}>
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="confirmed"
                    stackId="1"
                    stroke={CHART_COLORS.primary}
                    fill="url(#colorConfirmed)"
                    strokeWidth={3}
                    name="Confirmed"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke={CHART_COLORS.success}
                    fill="url(#colorCompleted)"
                    strokeWidth={3}
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="cancelled"
                    stackId="1"
                    stroke={CHART_COLORS.error}
                    fill="url(#colorCancelled)"
                    strokeWidth={3}
                    name="Cancelled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          ))}
        </Grid>

        <Grid item xs={12} md={6}>
          {(() => {
            console.log('topDoctors data:', data.topDoctors);
            return chartCard("Top Doctors by Appointments", (
              <DoctorRankingBarChart data={data.topDoctors} />
            ));
          })()}
        </Grid>

        <Grid item xs={12} md={6}>
          {chartCard("Appointment Status Distribution", (
            <DepartmentDistributionPie data={data.appointmentStatus.map(d => ({ name: d.name, value: d.value }))} />
          ))}
        </Grid>

        <Grid item xs={12}>
          {chartCard("Appointment Time Distribution (Heatmap)", <WorkTimeHeatmap data={convertHeatmapData(data.heatmapData)} />)}
        </Grid>
      </Grid>
    </Box>
  );
} 