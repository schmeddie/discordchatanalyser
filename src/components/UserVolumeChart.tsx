import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserMessageVolumeData } from '../types';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface Props {
  data: UserMessageVolumeData[];
}

// Color palette for different users
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a28bdc',
  '#ff8042', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'
];

export function UserVolumeChart({ data }: Props) {
  // Extract user names from data
  const usernames = useMemo(() => {
    if (data.length === 0) return [];
    const firstDataPoint = data[0];
    return Object.keys(firstDataPoint).filter(key => key !== 'date');
  }, [data]);

  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'MMM dd')
  }));

  return (
    <div className="card">
      <h2>👥 Message Volume by User Over Time</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="dateFormatted"
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {usernames.map((username, index) => (
              <Area
                key={username}
                type="monotone"
                dataKey={username}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.7}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
