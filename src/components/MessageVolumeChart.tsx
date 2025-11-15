import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MessageVolumeData } from '../types';
import { format } from 'date-fns';

interface Props {
  data: MessageVolumeData[];
}

export function MessageVolumeChart({ data }: Props) {
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    dateFormatted: format(new Date(item.date), 'MMM dd, yyyy')
  }));

  return (
    <div className="card">
      <h2>📈 Message Volume Over Time</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
              name="Messages"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
