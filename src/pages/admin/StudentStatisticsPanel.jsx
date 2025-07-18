import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getMonthlyStudentChangeAPI } from '../../services/api';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const StudentStatisticsPanel = () => {
  const [periodType, setPeriodType] = useState('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-12-31`;
  });
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalNewEnrollments: 0,
    totalCompletions: 0,
    netChange: 0,
    period: { startDate: '', endDate: '' }
  });
  const [error, setError] = useState('');

  // Helper: get all {year, month} between two dates (inclusive)
  function getMonthsBetween(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = [];
    let year = startDate.getFullYear();
    let month = startDate.getMonth() + 1;
    while (year < endDate.getFullYear() || (year === endDate.getFullYear() && month <= endDate.getMonth() + 1)) {
      months.push({ year, month });
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    return months;
  }

  // Fetch monthly student change data
  const fetchMonthlyData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { year: selectedYear };
      const res = await getMonthlyStudentChangeAPI(params);
      console.log('API response:', res.data);
      const apiData = res.data || {};
      console.log('apiData.increase:', apiData.increase);
      // Tạo mảng dữ liệu tháng từ dữ liệu tăng/giảm
      const months = [];
      (apiData.increase || []).forEach(item => {
        console.log('Increase item:', item);
        months.push({
          year: item.year,
        month: item.month,
          monthName: `Th${item.month}`,
          newStudents: item.count,
          leftStudents: 0,
          netChange: item.count,
          students: item.count
        });
      });
      console.log('apiData.decrease:', apiData.decrease);
      (apiData.decrease || []).forEach(item => {
        console.log('Decrease item:', item);
        const idx = months.findIndex(m => m.year === item.year && m.month === item.month);
        if (idx !== -1) {
          months[idx].leftStudents = item.count;
          months[idx].netChange = (months[idx].newStudents || 0) - item.count;
        } else {
          months.push({
            year: item.year,
            month: item.month,
            monthName: `Th${item.month}`,
            newStudents: 0,
            leftStudents: item.count,
            netChange: -item.count,
            students: 0
          });
        }
      });
      // Sắp xếp theo tháng tăng dần
      months.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
      console.log('Processed months:', months);
      // Đảm bảo đủ 12 tháng
      const now = new Date();
      const isCurrentYear = selectedYear === now.getFullYear();
      const currentMonth = isCurrentYear ? now.getMonth() + 1 : 12;
      const fullMonths = Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const found = months.find(m => m.month === monthNum && m.year === selectedYear);
        if (monthNum > currentMonth) {
          // Tháng tương lai: để 0 hết
          return {
            year: selectedYear,
            month: monthNum,
            monthName: `Th${monthNum}`,
            newStudents: 0,
            leftStudents: 0,
            netChange: 0,
            students: 0
          };
        }
        return found || {
          year: selectedYear,
          month: monthNum,
          monthName: `Th${monthNum}`,
          newStudents: 0,
          leftStudents: 0,
          netChange: 0,
          students: 0
        };
      });
      // Tính tổng học sinh thực tế từng tháng (chỉ đến tháng hiện tại)
      for (let i = 0; i < 12; i++) {
        if (i === 0) {
          fullMonths[i].students = fullMonths[i].newStudents;
        } else {
          fullMonths[i].students = fullMonths[i - 1].students + fullMonths[i].newStudents - fullMonths[i].leftStudents;
        }
        // Nếu là tháng tương lai thì giữ nguyên 0
        if (i + 1 > currentMonth) {
          fullMonths[i].students = 0;
          fullMonths[i].newStudents = 0;
          fullMonths[i].leftStudents = 0;
          fullMonths[i].netChange = 0;
        }
      }
      setMonthlyData(fullMonths);
      // Set summary
        setSummaryData({
        totalNewEnrollments: apiData.summary?.totalIncrease || 0,
        totalCompletions: apiData.summary?.totalDecrease || 0,
        netChange: apiData.summary?.netChange || 0,
        period: apiData.summary?.period || { startDate: '', endDate: '' }
        });
      // Log state sau khi set
      setTimeout(() => {
        console.log('monthlyData state:', fullMonths);
      }, 1000);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Không thể tải dữ liệu thống kê');
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd]);

  // Tính phần trăm tăng trưởng tháng này so với tháng trước
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentMonthData = monthlyData.find(m => m.month === currentMonth && m.year === selectedYear);
  const prevMonthData = monthlyData.find(m => m.month === currentMonth - 1 && m.year === selectedYear);
  let growthPercent = null;
  if (currentMonth > 1 && currentMonthData && prevMonthData) {
    const prev = prevMonthData.students || 0;
    const curr = currentMonthData.students || 0;
    if (prev > 0) {
      growthPercent = ((curr - prev) / prev) * 100;
    } else if (curr > 0) {
      growthPercent = 100;
    } else {
      growthPercent = 0;
    }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê học sinh
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="Năm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
        </Grid>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học sinh mới</Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalNewEnrollments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học sinh rời đi</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {loading ? <CircularProgress size={20} /> : summaryData.totalCompletions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {summaryData.netChange >= 0 ? 'Tăng' : 'Giảm'}
              </Typography>
              <Typography
                variant="h5"
                color={summaryData.netChange >= 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {loading ? <CircularProgress size={20} /> : `${summaryData.netChange >= 0 ? '+' : ''}${summaryData.netChange}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tăng trưởng tháng này</Typography>
              <Typography
                variant="h5"
                color={growthPercent === null ? 'text.disabled' : growthPercent >= 0 ? 'success.main' : 'error.main'}
                fontWeight="bold"
              >
                {loading ? <CircularProgress size={20} /> :
                  growthPercent === null ? 'N/A' : `${growthPercent > 0 ? '+' : ''}${growthPercent.toFixed(1)}%`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Bar Chart - Total Students by Month */}
        <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {`Số lượng học sinh theo tháng (${selectedYear})`}
        </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
                  <Bar dataKey="students" name="Tổng học sinh" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Line Chart - Monthly Changes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`Biến động học sinh theo tháng (${selectedYear})`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newStudents"
                    name="Học sinh mới"
                    stroke="#4caf50"
                    strokeWidth={2}
                    dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leftStudents"
                    name="Học sinh rời đi"
                    stroke="#f44336"
                    strokeWidth={2}
                    dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netChange"
                    name="Biến động"
                    stroke="#ff9800"
                    strokeWidth={2}
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
      </Paper>
        </Grid>

        {/* Grouped Bar Chart - New vs Left Students by Month */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {`So sánh học sinh mới và rời đi theo tháng (${selectedYear})`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" label={{ value: 'Tháng', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newStudents" name="Học sinh mới" fill="#4caf50" />
                  <Bar dataKey="leftStudents" name="Học sinh rời đi" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            )}
      </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentStatisticsPanel;
