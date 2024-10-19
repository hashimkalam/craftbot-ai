"use client";
import { SentimentPieChartProps } from "@/types/types";
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
const GRAY_COLOR = "#A9A9A9"; // Gray color for no data

const SentimentPieChart: React.FC<SentimentPieChartProps> = ({
  neutral,
  positive,
  negative,
}) => {
  const router = useRouter();

  // Check if all sentiment counts are zero
  const isEmpty = neutral === 0 && positive === 0 && negative === 0;

  const data = isEmpty
    ? [{ name: "No Feedback", value: 1 }]
    : [
        { name: `Neutral (${neutral})`, value: neutral },
        { name: `Positive (${positive})`, value: positive },
        { name: `Negative (${negative})`, value: negative },
      ];

  const fillColors = isEmpty
    ? [GRAY_COLOR] // Use gray color for the "No Feedback" state
    : COLORS;

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
              fill={fillColors[index % fillColors.length]}
              onClick={
                !isEmpty
                  ? () => router.push(`/dashboard/feedback/${index}`)
                  : undefined
              }
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
