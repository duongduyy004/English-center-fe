import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, useTheme} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendValue,
  onClick
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;

    return trend === 'up' ? (
      <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 16 }} />
    ) : (
      <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 16 }} />
    );
  };

  const getTrendColor = () => {
    if (!trend) return 'text.secondary';
    return trend === 'up' ? 'success.main' : 'error.main';
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: theme.shadows[4]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" gutterBottom>
              {value !== undefined && value !== null ? value : '0'}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {(trend || trendValue) && (
              <Box display="flex" alignItems="center" mt={1}>
                {getTrendIcon()}
                <Typography
                  variant="body2"
                  color={getTrendColor()}
                  sx={{ ml: 0.5 }}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                backgroundColor: theme.palette[color].main,
                color: theme.palette[color].contrastText,
                width: 56,
                height: 56
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
