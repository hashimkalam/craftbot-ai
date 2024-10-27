"use client"; 
import React, { createContext, useContext, useState } from 'react';

interface SubscriptionContextType {
  subscriptionPlan: string; // Change to non-optional string
  setSubscriptionPlan: (plan: string) => void; // Update the type accordingly
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('standard');

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
