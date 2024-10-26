// components/CreateChatBot.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CREATE_CHATBOT } from "@/graphql/mutation";
import { useMutation } from "@apollo/client";
import { useUser } from "@clerk/nextjs";
import { FormEvent, lazy, Suspense, useState } from "react";
import { formatISO } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/images/just_logo.webp";
import Loading from "@/app/dashboard/loading";
import { Chatbot } from "@/types/types";
const Personalities = lazy(() => import("@/components/Personalities"));

interface CreateChatBotProps {
  subscriptionPlan: string | undefined;
  chatbots: Chatbot[];
}

const CreateChatBot = ({ subscriptionPlan, chatbots }: CreateChatBotProps) => {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(
    null
  );

  const [createChatbot, { loading }] = useMutation(CREATE_CHATBOT);

  // Determine the maximum limit based on the subscription plan
  let maxLimit = 0;
  if (subscriptionPlan === "normal") {
    maxLimit = 1;
  } else if (subscriptionPlan === "premium") {
    maxLimit = 5;
  }

  console.log("chatbots: ", chatbots)
  // Count existing chatbots
  const existingChatbotCount = chatbots?.length || 0;
  console.log("existingChatbotCount: ", existingChatbotCount)



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.length > 26) {
      setError("Chatbot name cannot exceed 26 characters.");
      return;
    }

    try {
      const { data } = await createChatbot({
        variables: {
          clerk_user_id: user?.id,
          name,
          created_at: formatISO(new Date()),
          personality: selectedPersonality,
        },
      });

      // Reset form fields
      setName("");
      setSelectedPersonality(null);
      setError(null);

      router.push(`/dashboard/edit-chatbot/${data.insertChatbots.id}`);
    } catch (err) {
      console.error("Error creating chatbot:", err);
      setError("An error occurred while creating the chatbot.");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 26) {
      setError(null);
    } else {
      setError("Chatbot name cannot exceed 26 characters.");
    }

    setName(value);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center bg-white dark:bg-primary-DARK shadow-lg p-10 rounded-md m-10 w-[90%] md:w-[80%]">
      <Image
        src={logo}
        alt="Logo"
        className="w-16 lg:w-24 flex-0 mb-4 lg:mb-0"
        loading="lazy"
      />
      <div className="flex-1">
        <h1 className="text-xl lg:text-3xl font-semibold">Create</h1>
        <h2 className="font-light">
          Create a new chatbot to assist you in your conversations with your
          customers.
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col mt-6 border border-black p-2 rounded-md"
        >
          <div className="flex items-center bg-gray-100 dark:bg-primary/10 p-1 rounded-lg">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Chatbot Name..."
              className="max-w-lg w-full border-none outline-none px-2 py-2 rounded-l-xl bg-gray-100 dark:bg-primary/0"
              required
            />
            <Button
              type="submit"
              disabled={
                loading ||
                existingChatbotCount >= maxLimit || // Disable if max limit reached
                !name ||
                error !== null ||
                !selectedPersonality
              }
              className="w-fit text-white"
            >
              {loading ? "Creating Chatbot" : "Create Chatbot"}
            </Button>
          </div>

          <Suspense fallback={<Loading />}>
            <Personalities
              selectedPersonality={selectedPersonality}
              setSelectedPersonality={setSelectedPersonality}
            />
          </Suspense>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Show a message if the user has reached the limit */}
        {existingChatbotCount >= maxLimit && (
          <p className="text-red-500 mt-2">
            You have reached your limit of {maxLimit} chatbot(s) for this plan.
          </p>
        )}

        <p className="text-gray-300 mt-5">Example: Custom Support Chatbot</p>
      </div>
    </div>
  );
};

export default CreateChatBot;
