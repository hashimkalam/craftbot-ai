"use client";

import Avatar from "@/components/Avatar";
import Characteristic from "@/components/Characteristic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/graphql/apolloClient";
import { ADD_CHARACTERISTIC, DELETE_CHATBOT } from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from "@/types/types";
import { useMutation, useQuery } from "@apollo/client";
import { formatISO } from "date-fns";
import { Copy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EditChatbot = ({ params: { id } }: { params: { id: string } }) => {
  console.log("id ->", id);

  const [chatbotName, setChatbotName] = useState("");
  const [url, setUrl] = useState<string>("");
  const [newCharacteristic, setNewCharacteristic] = useState<string>("");

  const [deleteChatbot] = useMutation(DELETE_CHATBOT, {
    refetchQueries: ["GetChatbotById"], // refresh chatbots after deletion
    awaitRefetchQueries: true,
  });

  const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
    refetchQueries: ["GetChatbotById"], // refresh chatbot after characteristic addition
  });

  console.log("characteristics: ", Characteristic)

  // extract id of chatbot
  const { data, loading, error } = useQuery<
    GetChatbotByIdResponse,
    GetChatbotByIdVariables
  >(GET_CHATBOT_BY_ID, {
    variables: { id },
  });

  useEffect(() => {
    if (data) {
      setChatbotName(data.chatbots?.name);

      console.log("chatbot name retrieved -> ", chatbotName);
    }
  }, [data]);

  // updates url according to id changes
  useEffect(() => {
    const url = `${BASE_URL}/chatbot/${id}`;
    setUrl(url);
  }, [id]);

  // funtcion to delete chatbot
  const handleDelete = async (id: string) => {
    // prompts for confirmation
    const isConfirmed = window.confirm(
      "Are u sure about deleting the chatbot?"
    );
    if (!isConfirmed) return;

    try {
      const promise = deleteChatbot({ variables: { id } }); // calls mutation function with chatbot id
      toast.promise(promise, {
        loading: "Deleting",
        success: "Successfully deleted CHatbot",
        error: "Failed to delete Chatbot",
      });
    } catch (error) {
      console.error("Error deleting chatbot: ", error);
      toast.error("Failed to delete chatbot");
    }
  };

  const handleUpdateChatbot = () => {};

  // add characteristic function
  const handleAddCharacteristic = async (content: string) => {
    try {
      const promise = addCharacteristic({
        variables: {
          chatbotId: Number(id),
          content,
          created_at: formatISO(new Date()), 
        },
      });

      toast.promise(promise, {
        loading: "Adding...",
        success: "Info added",
        error: "Failed to add",
      });
    } catch (error) {
      console.error("Failed to add characteristics: ", error);
    }
  };

  if (loading)
    return (
      <div className="mx-auto animate-spin p-10">
        <Avatar seed="PAPAFAM Support Agent" />
      </div>
    );

  if (error) return <p>Error: {error.message}</p>;

  if (!data?.chatbots) return redirect("/view-chatbots");


  console.log("data?.chatbots?.chatbot_characteristics:-", data?.chatbots?.chatbot_characteristics)

  return (
    <div className="px-0 md:p-10">
      <div className="text-white text-sm md:sticky md:top-10 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-[#2991ee] ">
        <h2 className="font-bold">Link to chat</h2>
        <p className="text-sm italic text-white">
          SHare the link to start conversations with your chatbot
        </p>

        <div className="text-black flex items-center space-x-2">
          <Link href={url} className="w-full pointer hover:opacity-50">
            <Input value={url} readOnly className="pointer" />
          </Link>
          <Button
            size="sm"
            className="px-2"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success("Copied to clipboard");
            }}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section className="relative mt-5 bg-white p-5 md:p-10 rounded-lg">
        <Button
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-2"
          onClick={() => handleDelete(id)}
        >
          X
        </Button>

        <div className="flex space-x-4">
          <Avatar seed={chatbotName} />

          <form
            onSubmit={handleUpdateChatbot}
            className="flex flex-1 space-2-x items-center"
          >
            <Input
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder={chatbotName}
              className="w-full border-none bg-transparent text-xl font-bold"
            />
            <Button type="submit" disabled={!chatbotName}>
              Update
            </Button>
          </form>
        </div>

        <h2 className="text-xl font-bold mt-10">Heres what your AI knows</h2>
        <p>
          Your chatbot is equipped with the following information to assist you
          in your conversation with your customers & users
        </p>

        <div className="bg-gray-200 p-5 md:p-8 rounded-md mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCharacteristic(newCharacteristic);
              setNewCharacteristic("");
            }}
            className="flex space-x-2 mb-5"
          >
            <Input
              type="text"
              placeholder="Example: If customers asks for proces, provide pricing page: www.example.com/pricing"
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
            />

            <Button type="submit" disabled={!newCharacteristic}>
              Add
            </Button>
          </form>

          <ul className="flex flex-wrap-reverse gap-5">
            {data?.chatbots?.chatbot_characteristics.map((charac) => (
              <Characteristic key={charac.id} characteristic={charac} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default EditChatbot;
