"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CREATE_CHATBOT } from "@/graphql/mutation";
import { useMutation } from "@apollo/client";
import { useUser } from "@clerk/nextjs";
import { FormEvent, useState } from "react";
import { formatISO } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/images/just_logo.png";

const CreateChatBot = () => {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null); // State for error message
  const router = useRouter();

  const [createChatbot, { data, loading, error: mutationError }] = useMutation(
    CREATE_CHATBOT,
    {
      variables: {
        clerk_user_id: user?.id,
        name,
        created_at: formatISO(new Date()), // Provide current date/time
      },
    }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.length > 20) {
      setError("Chatbot name cannot exceed 20 characters.");
      return;
    }

    try {
      const data = await createChatbot();
      setName("");
      setError(""); // Clear error message on successful creation
      console.log("Bot created successfully:", data);

      // Redirect to edit page or handle success message
      router.push(`/dashboard/edit-chatbot/${data.data.insertChatbots.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Update name state and error message
    if (value.length <= 20) {
      setError(null);
    } else setError("Chatbot name cannot exceed 20 characters.");

    setName(value);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center lg:flex-row md:space-x-10 bg-white dark:bg-primary-DARK shadow-lg p-10 rounded-md m-10 w-[80%]">
      <Image src={logo} alt="Logo" className="w-16 lg:w-24 flex-0" />
      <div className="flex-1">
        <h1 className="text-xl lg:text-3xl font-semibold">Create</h1>
        <h2 className="font-light">
          Create a new chatbot to assist you in your conversations with your
          customers
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row justify-between mt-6 border border-black p-1 rounded-md"
        >
          <input
            type="text"
            value={name}
            onChange={handleNameChange} // Handle name change
            placeholder="Chatbot Name..."
            className="max-w-lg mb-2 md:mb-0 border-none w-full outline-none outline-0 px-2"
            required
          />
          <Button type="submit" disabled={loading || !name || error !== null}>
            {loading ? "Creating Chatbot" : "Create Chatbot"}
          </Button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <p className="text-gray-300 mt-5">Example: Custom Support Chatbot</p>
      </div>
    </div>
  );
};

export default CreateChatBot;
