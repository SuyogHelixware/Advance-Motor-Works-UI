import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  useTheme,
  Box,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  BarChart,
  PieChartOutline,
  ShowChart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

// 🪙 Inline formatter function
const formatINRCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

const generateData = () => [
  { name: 'Jan', value: Math.floor(Math.random() * 100000 + 50000) },
  { name: 'Feb', value: Math.floor(Math.random() * 100000 + 50000) },
  { name: 'Mar', value: Math.floor(Math.random() * 100000 + 50000) },
  { name: 'Apr', value: Math.floor(Math.random() * 100000 + 50000) },
  { name: 'May', value: Math.floor(Math.random() * 100000 + 50000) },
];

export default function Home() {
  const theme = useTheme();
  const [lineData, setLineData] = useState(generateData());
  const [barData, setBarData] = useState(generateData());

  const pieData = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
  ];

  const areaData = generateData();

  const handleRefresh = () => {
    setLineData(generateData());
    setBarData(generateData());
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: formatINRCurrency(184500),
      icon: <TrendingUp sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
    },
    {
      title: 'Revenue',
      value: formatINRCurrency(249000),
      icon: <BarChart sx={{ fontSize: 32, color: theme.palette.success.main }} />,
    },
    {
      title: 'Market Share',
      value: '41.2%',
      icon: <PieChartOutline sx={{ fontSize: 32, color: theme.palette.warning.main }} />,
    },
    {
      title: 'Growth',
      value: '12.7%',
      icon: <ShowChart sx={{ fontSize: 32, color: theme.palette.error.main }} />,
    },
  ];

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {statCards.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2, boxShadow: 3 }}>
              {stat.icon}
              <Box ml={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h6">{stat.value}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}

        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Revenue Trend</Typography>
                <IconButton onClick={handleRefresh}>
                  <Refresh />
                </IconButton>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatINRCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Sales
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatINRCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill={theme.palette.success.main} barSize={40} />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Area Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatINRCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.secondary.main}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
