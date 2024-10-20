"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/data/data";
import Link from "next/link";
import { lazy, Suspense, useMemo } from "react";
import Loading from "@/app/dashboard/loading";

const Video = lazy(() => import("@/components/opening/Video"));

// Extract the static elements to avoid re-rendering
const StaticFeatures = ({ features }: any) => (
  <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 dark:text-gray-300 md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
    {features.map((feature: any) => (
      <div key={feature.desc} className="relative pl-9">
        <dt className="inline font-semibold text-gray-900">
          <feature.icon
            aria-hidden="true"
            className="absolute left-1 top-1 h-5 w-5 text-primary"
          />
        </dt>
        <dd>{feature.desc}</dd>
      </div>
    ))}
  </dl>
);

const ClientHome = ({ userId }: { userId: string | null }) => {
  // Memoize static content to avoid recalculation
  const memoizedFeatures = useMemo(
    () => <StaticFeatures features={FEATURES} />,
    []
  );

  return (
    <main className="relative bg-gradient-to-bl from-white dark:from-gray-900 to-primary dark:to-indigo-900 flex-1 p-2 lg:p-5">
      {/* Mode toggle */}
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>

      {/* Parent container with CSS dotted background */}
      <div className="relative h-full w-full bg-dots bg-white/95 dark:bg-black/50 py-24 sm:p-32 rounded-md drop-shadow-xl overflow-hidden z-40">
        <div className="relative h-full w-full z-40">
          {/* Intro section */}
          <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8 pb-10">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary capitalize">
                Your AI chatbot solution
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl capitalize">
                Create custom chatbots effortlessly
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Welcome to{" "}
                <span className="font-bold text-primary">Craftbot AI</span>
                <br />
                <br />
                Design and deploy custom AI chatbots in minutes! Personalize
                your bot&apos;s personality and functionality, complete with an
                integrated feedback section and insightful analytics. Elevate
                your ideas into engaging interactions with the{" "}
                <span className="font-bold">Custom Chatbot Generator</span> and
                watch your productivity soar!
              </p>
            </div>

            <Button asChild className="mt-10">
              <Link href="/dashboard" className="dark:text-white">
                {userId ? "Go to Your Chatbots" : "Get Started"}
              </Link>
            </Button>
          </div>

          {/* Lazy-loaded Video */}
          <Suspense fallback={<Loading />}>
            <Video />
          </Suspense>

          {/* Memoized Features Section */}
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8 z-40">
            {memoizedFeatures}
          </div>

          {/* Get started for free */}
          <div className="flex flex-col items-center justify-center text-center p-4 md:p-6 lg:p-8 h-[45vh] mt-10 -mb-10 z-40">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Get Started For Free
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl">
              Build your bot today!
            </p>
            <Button asChild className="mt-10 w-fit">
              <Link
                href="/dashboard"
                className="dark:text-white text-lg md:text-base lg:text-lg py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
              >
                {userId ? "Go to Your Chatbots" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ClientHome;
