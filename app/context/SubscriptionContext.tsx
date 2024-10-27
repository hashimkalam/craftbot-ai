"use client";
import { SubscriptionContextType } from '@/types/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('standard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionPlan = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionPlan(data.subscriptionPlan || 'standard');
        }
      } catch (error) {
        console.error('Failed to fetch subscription plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionPlan();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscriptionPlan, setSubscriptionPlan, isLoading }}>
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
