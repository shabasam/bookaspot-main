'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = {
  week: [
    { name: 'Mon', bookings: 10, earnings: 200 },
    { name: 'Tue', bookings: 15, earnings: 300 },
    { name: 'Wed', bookings: 7, earnings: 150 },
    { name: 'Thu', bookings: 20, earnings: 400 },
    { name: 'Fri', bookings: 25, earnings: 500 },
    { name: 'Sat', bookings: 30, earnings: 600 },
    { name: 'Sun', bookings: 18, earnings: 350 },
  ],
  month: [
    { name: 'Week 1', bookings: 50, earnings: 1000 },
    { name: 'Week 2', bookings: 60, earnings: 1200 },
    { name: 'Week 3', bookings: 70, earnings: 1400 },
    { name: 'Week 4', bookings: 80, earnings: 1600 },
  ],
  year: [
    { name: 'Jan', bookings: 200, earnings: 4000 },
    { name: 'Feb', bookings: 180, earnings: 3600 },
    { name: 'Mar', bookings: 220, earnings: 4400 },
    { name: 'Apr', bookings: 240, earnings: 4800 },
    { name: 'May', bookings: 260, earnings: 5200 },
    { name: 'Jun', bookings: 280, earnings: 5600 },
    { name: 'Jul', bookings: 300, earnings: 6000 },
    { name: 'Aug', bookings: 320, earnings: 6400 },
    { name: 'Sep', bookings: 340, earnings: 6800 },
    { name: 'Oct', bookings: 360, earnings: 7200 },
    { name: 'Nov', bookings: 380, earnings: 7600 },
    { name: 'Dec', bookings: 400, earnings: 8000 },
  ],
};

export default function ChartSection() {
  const [timeframe, setTimeframe] = useState('week');

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl text-black font-bold mb-4">Bookings & Earnings Trend</h2>
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setTimeframe('week')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Week
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Month
        </button>
        <button
          onClick={() => setTimeframe('year')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Year
        </button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data[timeframe] || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="earnings" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
