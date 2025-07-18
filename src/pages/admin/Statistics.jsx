import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import FinancialStatisticsPanel from './FinancialStatisticsPanel';
import StudentStatisticsPanel from './StudentStatisticsPanel';

const Statistics = () => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom>
            Thống kê
      </Typography>
          <Paper sx={{ mb: 3, boxShadow: 'none', bgcolor: 'transparent' }}>
            <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
              <Tab label="Thống kê tài chính" />
              <Tab label="Thống kê học sinh" />
            </Tabs>
          </Paper>
          <Box>
            {tab === 0 && <FinancialStatisticsPanel />}
            {tab === 1 && <StudentStatisticsPanel />}
          </Box>
        </Box>
    </Box>
    </DashboardLayout>
  );
};

export default Statistics;
