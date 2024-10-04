"use client";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF9900", "#00FF00", "#FF0000"]; // Colors for Neutral, Positive, and Negative

interface SentimentPieChartProps {
  neutral: number;
  positive: number;
  negative: number;
}

const SentimentPieChart: React.FC<SentimentPieChartProps> = ({
  neutral,
  positive,
  negative,
}) => {
  const data = [
    { name: `Neutral (${neutral})`, value: neutral },
    { name: `Positive (${positive})`, value: positive },
    { name: `Negative (${negative})`, value: negative },
  ];

  const router = useRouter();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              onClick={() => router.push(`/dashboard/feedback/${index}`)}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SentimentPieChart;
