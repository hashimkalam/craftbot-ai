"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SubscriptionContextType {
  subscriptionPlan: string; // Change to non-optional string
  setSubscriptionPlan: (plan: string) => void; // Update the type accordingly
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(() => {
    // Get the subscription plan from local storage or default to 'standard'
    return localStorage.getItem('subscriptionPlan') || 'standard';
  });

  useEffect(() => {
    // Save subscription plan to local storage whenever it changes
    localStorage.setItem('subscriptionPlan', subscriptionPlan);
  }, [subscriptionPlan]);

  return (
    <SubscriptionContext.Provider value={{ subscriptionPlan, setSubscriptionPlan }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
