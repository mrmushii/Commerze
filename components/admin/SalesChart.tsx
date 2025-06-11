// components/admin/SalesChart.tsx
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart, // For Line Chart option
  Line,      // For Line Chart option
} from 'recharts';

interface SalesDataPoint {
  date: string;    // e.g., "Jan 01"
  sales: number;   // Total sales for that day
  orders: number;  // Number of orders for that day
}

interface SalesChartProps {
  salesData: SalesDataPoint[]; // Data fetched from the server
}

/**
 * A client-side component to render a sales chart using Recharts.
 * It takes aggregated sales data as props.
 */
const SalesChart: React.FC<SalesChartProps> = ({ salesData }) => {
  if (!salesData || salesData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600">
        <p>No sales data available to display chart.</p>
        <p className="text-sm">Start making some sales!</p>
      </div>
    );
  }

  // Determine chart type based on density or preference. BarChart is good for daily totals.
  // LineChart is good for trends.
  const chartType = salesData.length > 15 ? 'line' : 'bar'; // Example: switch to line if many data points

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        {chartType === 'bar' ? (
          <BarChart
            data={salesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" /> {/* Sales axis */}
            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" /> {/* Orders axis */}
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value, name, props) => {
                if (name === 'Sales') return `$${value.toFixed(2)}`;
                return value;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', color: 'var(--foreground)' }} />
            <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#22c55e" barSize={30} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart
            data={salesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              formatter={(value, name, props) => {
                if (name === 'Sales') return `$${value.toFixed(2)}`;
                return value;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', color: 'var(--foreground)' }} />
            <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#22c55e" activeDot={{ r: 8 }} strokeWidth={2} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
