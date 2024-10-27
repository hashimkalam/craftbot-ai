import { useSubscription } from "@/app/context/SubscriptionContext";
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
}) => {
  // Calculate maxLimit according to subscriptionPlan 
  
  const { subscriptionPlan } = useSubscription();
  let maxLimit = 0;

  if (subscriptionPlan === "standard") {
    maxLimit = 75;
  } else if (subscriptionPlan === "premium") {
    maxLimit = 150;
  }

  // Calculate remaining count ensuring it doesn't go below 0
  const remainingCount = Math.max(0, maxLimit - messageCount);
  
  const data = [
    { name: `Used (${messageCount})`, value: messageCount > maxLimit ? maxLimit : messageCount }, // Limit used value to maxLimit
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
