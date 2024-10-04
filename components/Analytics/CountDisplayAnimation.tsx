"use client";
import Loading from "@/app/dashboard/loading";
import { useState, useEffect } from "react";

interface TotalGuestsProps {
  text: string;
  count: number;
  loadingCount: boolean;
}

const CountDisplayAnimation: React.FC<TotalGuestsProps> = ({
  text,
  count,
  loadingCount,
}) => {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    // Start incrementing the counter if totalGuests changes
    if (animatedCount < count) {
      const interval = setInterval(() => {
        setAnimatedCount((prevCount) => Math.min(prevCount + 1, count));
      }, 100); // Adjust the speed (milliseconds) if needed

      // Clear the interval when the component unmounts or count is complete
      return () => clearInterval(interval);
    }
  }, [animatedCount, count]);

  return (
    <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-3 w-full flex flex-col items-center justify-center text-center h-full space-y-2">
      <h2 className="text-md font-medium text-gray-600 dark:text-gray-300">
        {text}
      </h2>

      {loadingCount ? (
        <Loading />
      ) : (
        <p className="text-5xl font-extrabold text-primary dark:text-white tracking-wider">
          {animatedCount}
        </p>
      )}
    </div>
  );
};

export default CountDisplayAnimation;
