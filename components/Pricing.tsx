"use client";
import { useRouter } from "next/navigation";

interface PricingProps {
  userId: string | null;
}

const Pricing: React.FC<PricingProps> = ({ userId }) => {
  const router = useRouter();

  const navigateToSignUp = (e: any) => {
    e.preventDefault();
    router.push("/sign-in");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        Available Plans
      </h2>
      <div className="flex flex-col md:flex-row md:gap-12 max-w-screen-lg mx-auto mt-4">
        {/* Standard Plan */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col items-center w-full ">
          <h3 className="text-xl font-semibold">Standard Plan</h3>
          <p className="text-lg text-gray-700 mt-2">Free for everyone!</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Ideal for basic usage with essential features.
          </p>
          <ul className="text-sm text-gray-600 mb-4">
            <li>🔹 Max 1 chatbot</li>
            <li>🔹 2 end scrapers</li>
            <li>🔹 150 total messages</li>
            <li>🔹 Top analytics section</li>
            <li className="text-red-500">
              ✖️ Top feedback section unavailable
            </li>
          </ul>
          <div className="mt-auto">
            <button
              onClick={(e) => navigateToSignUp(e)}
              className="dark:text-white text-lg md:text-base lg:text-lg py-1.5 px-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition"
            >
              {userId ? "Go to Your Chatbots" : "Get Started"}
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col items-center w-full mt-4 md:mt-0">
          <h3 className="text-xl font-semibold">Premium Plan</h3>
          <p className="text-lg text-gray-700 mt-2">$5 per month</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Enhanced features for more comprehensive usage.
          </p>
          <ul className="text-sm text-gray-600 mb-4">
            <li>🔹 Max 3 chatbots</li>
            <li>🔹 5 end scrapers</li>
            <li>🔹 500 total messages (each both)</li>
            <li>🔹 Top analytics section</li>
            <li>🔹 Top feedback section available</li>
          </ul>
          <div className="mt-auto">
          <button
              onClick={(e) => navigateToSignUp(e)}
              className="dark:text-white text-lg md:text-base lg:text-lg py-1.5 px-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition"
            >
              {userId ? "Go to Your Chatbots" : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
