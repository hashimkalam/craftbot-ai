import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button"; 
import { auth } from "@clerk/nextjs/server";
import { GlobeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const features = [
  {
    name: "Easy Customization",
    desc: "Customize your chatbot's personality, tone, and responses to fit your brand voice effortlessly.",
    icon: GlobeIcon,
  },
  {
    name: "Natural Language Processing",
    desc: "Leverage advanced NLP to enable your chatbot to understand and respond to user queries naturally.",
    icon: GlobeIcon,
  },
  {
    name: "Real-Time Conversations",
    desc: "Engage users in real-time with instant responses, enhancing user interaction and satisfaction.",
    icon: GlobeIcon,
  },
  {
    name: "Voice Interaction - (In Progress)",
    desc: "Integrate voice capabilities, allowing users to interact with your chatbot using voice commands.",
    icon: GlobeIcon,
  },
  {
    name: "Analytics Dashboard - (In Progress)",
    desc: "Access insightful analytics on chatbot performance, user interactions, and feedback to optimize experiences.",
    icon: GlobeIcon,
  },
  {
    name: "Multi-Platform Deployment - (In Progress)",
    desc: "Deploy your chatbots across various platforms, including websites and messaging apps, to reach your audience everywhere.",
    icon: GlobeIcon,
  },
];


export default async function Home() {
  const { userId } = await auth();
  console.log("userId: ", userId);

  if (userId) redirect("/dashboard");

  return (
    <main className="bg-gradient-to-bl from-white dark:from-gray-900 to-indigo-600 dark:to-indigo-900 flex-1 overflow-scroll p-2 lg:p-5 relative">
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>

      <div className="bg-white dark:bg-black/50 py-24 sm:p-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 capitalize">
              Your AI chatbot solution
            </h2>

            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl capitalize">
              Create custom chatbots effortlessly
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Welcome to{" "}
              <span className="font-bold text-indigo-600">Custom Chatbot Generator.</span>
              <br />
              <br />
              Design and deploy your own AI chatbots in minutes! Our tool allows you to
              customize your bot's personality and functionality, making it suitable for
              any application, from customer support to personal assistants. 
              Transform your ideas into interactive conversations with{" "}
              <span className="font-bold">Custom Chatbot Generator</span>, boosting your
              engagement and productivity effortlessly.
            </p>
          </div>

          <Button asChild className="mt-10">
            <Link href="/dashboard">
              {userId ? "Go to Your Chatbots" : "Get Started"}
            </Link>
          </Button>
        </div>

        {/* Screenshot Image Section */}
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              alt="App screenshot"
              // Replace with a relevant image for your application
              src=""
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />

            <div aria-hidden="true" className="relative">
              <div className="absolute bottom-0 -inset-x-32 dark:-inset-x-0 dark:rounded-b-lg bg-gradient-to-t from-white/95 dark:from-black pt-[5%]" />
            </div>
          </div>
        </div>

        {/* Feature Mapping */}
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 dark:text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature, index) => (
              <div key={index} className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                  />
                </dt>

                <dd>{feature.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
