"use client";
import { updateUser } from "@/lib/server/newUser";
import React, { useState } from "react";

interface SubscriptionPlanProps {
  userId: string;
  subscriptionPlan: string | undefined;
}

const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  userId,
  subscriptionPlan,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const upgradeHandler = async () => {
    setLoading(true);
    setMessage(null); // Reset message before starting upgrade
    try {
      await updateUser(userId, "premium");
      setMessage("Successfully upgraded to premium!");
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
      <p>{subscriptionPlan}</p>
      {message && (
        <p className="mt-2 text-sm text-red-500">{message}</p>
      )}
      <button
        onClick={upgradeHandler}
        disabled={loading}
        className={`border-2 border-black px-4 py-2 rounded-full ${
          loading ? "bg-gray-300 cursor-not-allowed" : "bg-green-300"
        } transition duration-300 ease-in-out`}
      >
        {loading ? "Upgrading..." : "Upgrade"}
      </button>
    </div>
  );
};

export default SubscriptionPlan;
