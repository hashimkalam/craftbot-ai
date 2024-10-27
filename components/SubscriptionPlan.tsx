"use client";
import { useSubscription } from "@/app/context/SubscriptionContext";
import { updateUser } from "@/lib/server/newUser";
import React, { useState } from "react"; 

interface SubscriptionPlanProps {
  userId: string;
  subscriptionPlan: string | undefined;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  userId,
  subscriptionPlan: initialPlan = 'standard',
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { subscriptionPlan: globalPlan, setSubscriptionPlan } = useSubscription(); 

  const upgradeHandler = async () => {
    setLoading(true);
    setMessage(null); 
    try {
      await updateUser(userId, "standard");
      setSubscriptionPlan("standard"); // Update the global subscription plan
      setMessage("Successfully upgraded to standard!");
    } catch (error) {
      console.error("Upgrade failed: ", error);
      setMessage("Upgrade failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:absolute right-5 top-5 ml-5 mt-2 lg:mt-0">
      <h2 className="text-lg font-semibold">Subscription Plan:</h2>
      <div className="flex">
        <p>{globalPlan || initialPlan}</p> {/* Use the global subscription plan */}
        <button
          onClick={upgradeHandler}
          disabled={loading}
          className={`border-2 border-black px-2 rounded-full text-[10px] ${
            loading ? "bg-gray-300 cursor-not-allowed" : "bg-green-300"
          } transition duration-300 ease-in-out`}
        >
          {loading ? "Upgrading..." : "Upgrade"}
        </button>
      </div>
      {message && <p className="mt-2 text-[10px] text-red-500">{message}</p>}
    </div>
  );
};

export default SubscriptionPlan;
