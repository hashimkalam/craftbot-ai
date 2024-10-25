import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns"; // For date-fns integration
import { Feedback } from "@/types/types";

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Define the structure for the data points
interface DataPoint {
  x: string; // Date string in a format like 'YYYY-MM-DD'
  y: number; // Quantity (number of messages/feedbacks)
}

interface LineChartProps {
  feedbackData: Feedback[]; // Specify that feedbackData is an array of Feedback
}
function FeedbackLineChart({ feedbackData }: LineChartProps) {
  // Function to aggregate feedback by day and sentiment
  const aggregateFeedbackByDay = (feedbacks: Feedback[]) => {
    const aggregatedData: {
      [key: string]: { positive: number; neutral: number; negative: number };
    } = {};

    feedbacks.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0]; // Get date in YYYY-MM-DD format
      const sentiment = item.sentiment.toLowerCase();

      if (!aggregatedData[date]) {
        aggregatedData[date] = { positive: 0, neutral: 0, negative: 0 };
      }

      if (sentiment === "positive") {
        aggregatedData[date].positive++;
      } else if (sentiment === "neutral") {
        aggregatedData[date].neutral++;
      } else if (sentiment === "negative") {
        aggregatedData[date].negative++;
      }
    });

    return aggregatedData;
  };

  // Aggregate the feedback data
  const aggregatedFeedback = aggregateFeedbackByDay(feedbackData);

  // Create data points for the chart
  const positiveFeedbackData: DataPoint[] = [];
  const neutralFeedbackData: DataPoint[] = [];
  const negativeFeedbackData: DataPoint[] = [];

  Object.entries(aggregatedFeedback).forEach(([date, counts]) => {
    positiveFeedbackData.push({ x: date, y: counts.positive });
    neutralFeedbackData.push({ x: date, y: counts.neutral });
    negativeFeedbackData.push({ x: date, y: counts.negative });
  });

  // Define the options for the line chart
  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        type: "time", // Time-based x-axis
        time: {
          unit: "day", // Display time in days
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantity",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Feedback Sentiment Over Time",
      },
    },
  };

  // Define the dataset for the chart using the calculated data
  const data = {
    datasets: [
      {
        label: "Positive Feedback",
        data: positiveFeedbackData,
        borderColor: "rgba(75, 192, 75, 1)",
        backgroundColor: "rgba(75, 192, 75, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Neutral Feedback",
        data: neutralFeedbackData,
        borderColor: "rgba(192, 192, 75, 1)",
        backgroundColor: "rgba(192, 192, 75, 0.2)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Negative Feedback",
        data: negativeFeedbackData,
        borderColor: "rgba(192, 75, 75, 1)",
        backgroundColor: "rgba(192, 75, 75, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Filter feedbackData to include only items where sender is 'user'
  const filteredFeedbackData = feedbackData.filter(
    (item) => item.sender === "user"
  );

  return (
    <>
      {filteredFeedbackData.length === 0 && (
        <p className="capitalize font-bold text-xl">
          Comparison Chart Empty due to no feedback from users.
        </p>
      )}

      <Line data={data} options={options} />
    </>
  );
}

export default FeedbackLineChart;
