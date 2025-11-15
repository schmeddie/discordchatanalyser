import type { HeatmapData } from '../types';
import { useMemo } from 'react';

interface Props {
  data: HeatmapData[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap({ data }: Props) {
  // Calculate max count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  // Create a lookup map for quick access
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(`${item.hour}-${item.day}`, item.count);
    });
    return map;
  }, [data]);

  const getColor = (count: number): string => {
    if (count === 0) return '#f0f0f0';
    const intensity = count / maxCount;

    // Color scale from light blue to dark blue
    if (intensity < 0.2) return '#e3f2fd';
    if (intensity < 0.4) return '#90caf9';
    if (intensity < 0.6) return '#42a5f5';
    if (intensity < 0.8) return '#1976d2';
    return '#0d47a1';
  };

  return (
    <div className="card">
      <h2>🕒 Activity Heatmap</h2>
      <p className="heatmap-subtitle">Message frequency by hour of day and day of week</p>
      <div className="heatmap-container">
        <div className="heatmap">
          <div className="heatmap-header">
            <div className="heatmap-corner"></div>
            {DAYS.map(day => (
              <div key={day} className="heatmap-day-label">
                {day}
              </div>
            ))}
          </div>
          {HOURS.map(hour => (
            <div key={hour} className="heatmap-row">
              <div className="heatmap-hour-label">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {DAYS.map((_, dayIndex) => {
                const count = dataMap.get(`${hour}-${dayIndex}`) || 0;
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="heatmap-cell"
                    style={{ backgroundColor: getColor(count) }}
                    title={`${DAYS[dayIndex]} ${hour}:00 - ${count} messages`}
                  >
                    {count > 0 && <span className="heatmap-count">{count}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-gradient">
            <div style={{ backgroundColor: '#f0f0f0' }}></div>
            <div style={{ backgroundColor: '#e3f2fd' }}></div>
            <div style={{ backgroundColor: '#90caf9' }}></div>
            <div style={{ backgroundColor: '#42a5f5' }}></div>
            <div style={{ backgroundColor: '#1976d2' }}></div>
            <div style={{ backgroundColor: '#0d47a1' }}></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
