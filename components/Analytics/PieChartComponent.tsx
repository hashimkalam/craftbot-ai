import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF0000", "#007FFF"]; // Colors for the pie segments

interface PieChartProps {
  sessionsCount: number; // Current number of sessions
  maxLimit: number; // Maximum sessions allowed
}

const PieChartComponent: React.FC<PieChartProps> = ({ sessionsCount, maxLimit }) => {
  const data = [
    { name: "Used", value: sessionsCount },
    { name: "Remaining", value: maxLimit - sessionsCount },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
