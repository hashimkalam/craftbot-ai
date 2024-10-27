import { PieChartProps } from "@/types/types";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF0000", "#007FFF"]; // Colors for the pie segments

const PieChartComponent: React.FC<PieChartProps> = ({
  messageCount,
  subscriptionPlan
}) => {

  // calculating maxLimit according to subscriptionPlan 
  let maxLimit=0;

  if (subscriptionPlan === "standard") {
    maxLimit=100
  } else if (subscriptionPlan === "premium") {
    maxLimit=200
  }

  const remainingCount = maxLimit - messageCount;
  const data = [
    { name: `Used (${messageCount})`, value: messageCount },
    { name: `Remaining (${remainingCount})`, value: remainingCount },
  ];

  

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#ff00000"
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
