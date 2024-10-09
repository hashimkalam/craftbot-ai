"use client";

import { Button } from "@/components/ui/button";
import { CREATE_CHATBOT } from "@/graphql/mutation";
import { useMutation } from "@apollo/client";
import { useUser } from "@clerk/nextjs";
import { FormEvent, useState } from "react";
import { formatISO } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/images/just_logo.png";
import { PERSONALITIES } from "@/data/data";
import { CheckSquare, Square } from "lucide-react";

export const Personalities = ({ selectedPersonality, setSelectedPersonality }: { selectedPersonality: any, setSelectedPersonality:any }) => (
  <div className="flex flex-wrap justify-start mt-2">
    {PERSONALITIES.map(({ id, label }) => (
      <button
        key={id}
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission on button click
          setSelectedPersonality(id); // Set the selected personality
        }}
        className="flex items-center p-2 rounded border m-1 bg-gray-100 dark:bg-primary-DARK border-transparent"
      >
        {selectedPersonality === id ? (
          <CheckSquare className="mr-2 text-blue-500" />
        ) : (
          <Square className="mr-2 text-gray-500" />
        )}
        {label}
      </button>
    ))}
  </div>
);

const CreateChatBot = () => {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);

  const [createChatbot, { loading }] = useMutation(CREATE_CHATBOT);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.length > 20) {
      setError("Chatbot name cannot exceed 20 characters.");
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
      setError(null); // Clear error message on successful creation
      console.log("Bot created successfully:", data);

      router.push(`/dashboard/edit-chatbot/${data.insertChatbots.id}`);
    } catch (err) {
      console.error("Error creating chatbot:", err);
      setError("An error occurred while creating the chatbot."); // Set generic error message
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= 20) {
      setError(null);
    } else {
      setError("Chatbot name cannot exceed 20 characters.");
    }

    setName(value);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center bg-white dark:bg-primary-DARK shadow-lg p-10 rounded-md m-10 w-[90%] md:w-[80%]">
      <Image src={logo} alt="Logo" className="w-16 lg:w-24 flex-0 mb-4 lg:mb-0" />
      <div className="flex-1">
        <h1 className="text-xl lg:text-3xl font-semibold">Create</h1>
        <h2 className="font-light">
          Create a new chatbot to assist you in your conversations with your customers.
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col mt-6 border border-black p-2 rounded-md"
        >
          <div className="flex items-center">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Chatbot Name..."
              className="max-w-lg w-full border-none outline-none px-2 py-2 mt-2.5 rounded-l-xl"
              required
            />
            <Button
              type="submit"
              disabled={loading || !name || error !== null || !selectedPersonality}
              className="mt-2 w-fit"
            >
              {loading ? "Creating Chatbot" : "Create Chatbot"}
            </Button>
          </div>

          <Personalities
            selectedPersonality={selectedPersonality}
            setSelectedPersonality={setSelectedPersonality}
          />
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <p className="text-gray-300 mt-5">Example: Custom Support Chatbot</p>
      </div>
    </div>
  );
};

export default CreateChatBot;
