"use client";
import Loading from "@/app/dashboard/loading";
import NumberTicker from "../ui/number-ticker";
import { TotalGuestsProps } from "@/types/types";

const CountDisplayAnimation: React.FC<TotalGuestsProps> = ({
  text,
  count,
  loadingCount,
}) => {
  return (
    <div className="bg-white dark:bg-primary/20 shadow-lg rounded-lg p-3 w-full flex flex-col items-center justify-center text-center h-full space-y-2">
      <h2 className="text-md font-medium text-gray-600 dark:text-gray-300">
        {text}
      </h2>

      {loadingCount ? (
        <Loading />
      ) : (
        <p className="text-5xl font-extrabold">
          <NumberTicker
            value={count}
            decimalPlaces={0}
            className="text-primary"
          />
        </p>
      )}
    </div>
  );
};

export default CountDisplayAnimation;
