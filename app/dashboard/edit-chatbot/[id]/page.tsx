"use client";

import Image from "next/image";
import logo from "@/public/images/just_logo.png";

import { FormEvent, useEffect, useState, lazy, Suspense } from "react";

const Characteristic = lazy(() => import("@/components/Characteristic"));

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/graphql/ApolloClient";
import {
  ADD_CHARACTERISTIC,
  DELETE_CHATBOT,
  UPDATE_CHATBOT,
} from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from "@/types/types";
import { useMutation, useQuery } from "@apollo/client";
import { formatISO } from "date-fns";
import { Copy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import type { StaticImageData } from "next/image";
import Loading from "../../loading";

const EditChatbot = ({ params: { id } }: { params: { id: string } }) => {
  console.log("id ->", id);

  const [chatbotName, setChatbotName] = useState("");
  const [currentImage, setCurrentImage] = useState<StaticImageData | string>(
    logo
  );
  const [url, setUrl] = useState<string>("");
  const [newCharacteristic, setNewCharacteristic] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // delete chatbot mutation
  const [deleteChatbot] = useMutation(DELETE_CHATBOT, {
    refetchQueries: ["GetChatbotById"], // refresh chatbots after deletion
    awaitRefetchQueries: true,
  });

  // add characteristic mutation
  const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
    refetchQueries: ["GetChatbotById"],
  });

  // update chatbot mutation
  const [updateChatbot] = useMutation(UPDATE_CHATBOT, {
    refetchQueries: ["GetChatbotById"],
  });

  console.log("characteristics: ", Characteristic);

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
    }
  }, [data]);

  // updates url according to id changes
  useEffect(() => {
    const url = `${BASE_URL}/chatbot/${id}`;
    setUrl(url);
  }, [id]);

  // funtcion to delete chatbot
  const handleDelete = async (id: string) => {
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

  const handleUpdateChatbot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const promise = updateChatbot({
        variables: {
          id,
          name: chatbotName,
          image: currentImage,
        },
      });

      toast.promise(promise, {
        loading: "updating...",
        success: "chatbot name successfully updated",
        error: "failed to update chatbot name",
      });
    } catch (err) {
      console.error("Failed to update chatbot: ", err);
    }
  };

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
        <Image src={currentImage} alt="Logo" className="w-24 lg:w-32" />
      </div>
    );

  if (error) return <p>Error: {error.message}</p>;

  if (!data?.chatbots) return redirect("/dashboard/view-chatbots");

  console.log(
    "data?.chatbots?.chatbot_characteristics:-",
    data?.chatbots?.chatbot_characteristics
  );

  const updateIcon = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Accept only image files

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement; // Type casting to handle null check

      if (target && target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            // Only set the image if reader.result is a string (base64)
            setCurrentImage(reader.result);
          }
        };

        reader.readAsDataURL(file); // Read file as Data URL to display image
        console.log("reader.readAsDataURL(file): ", file);
      } else {
        // If no file is selected, reset to default logo
        setCurrentImage(logo);
      }
    };

    // Trigger the file input dialog
    input.click();
  };

  return (
    <div className="px-0 md:p-10 bg-gray-300 shadow-xl dark:bg-primary-DARK">
      <div className="text-white text-sm md:sticky md:top-10 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-primary dark:bg-primary-DARK">
        <h2 className="font-bold">Link to chat</h2>
        <p className="text-sm italic text-white">
          Share the link to start conversations with your chatbot
        </p>

        <div className="text-black flex items-center space-x-2">
          <Link href={url} className="w-full pointer hover:opacity-50">
            <Input value={url} readOnly className="pointer dark:bg-white" />
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

      <section className="relative mt-5 bg-white dark:bg-primary/20 p-5 md:p-10 rounded-lg">
        <Button
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-2"
          onClick={() => setIsOpen(true)}
        >
          X
        </Button>

        <div className="flex space-x-4">
          {/*<div onClick={updateIcon}>
            Use the `Image` component for static logo
            {typeof currentImage === "string" &&
            currentImage.startsWith("data:image") ? (
              // If it's a base64 image, use a normal <img> tag
              <img src={currentImage} alt="Logo" className="w-16 lg:w-24" />
            ) : (
              // If it's the default static image, use Next.js's Image component
              <Image src={currentImage} alt="Logo" className="w-16 lg:w-24" />
            )}
          </div>*/}
          <Image src={currentImage} alt="Logo" className="w-16 lg:w-24" />
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

        <div className="bg-gray-200 dark:bg-primary-DARK p-5 md:p-8 rounded-md mt-5">
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
            {data?.chatbots?.chatbot_characteristics.map((charac, index) => (
              <div key={index}>
                <Suspense fallback={<Loading />}>
                  <Characteristic key={charac.id} characteristic={charac} />
                </Suspense>
              </div>
            ))}
          </ul>
        </div>
      </section>

      <div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-full lg:max-w-[425px]">
            <p>Are you sure you want to delete?</p>
            <div className="space-x-4 flex ">
              <Button
                onClick={() => handleDelete(id)}
                className="bg-red-500 hover:bg-red-600 flex-1"
              >
                Yes
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-[#4d7dfb] hover:bg-[#3068f5] flex-1"
              >
                No
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditChatbot;
