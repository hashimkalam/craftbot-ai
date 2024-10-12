"use client";

import Image from "next/image";
import logo from "@/public/images/just_logo.webp";

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
 
import Loading from "../../loading";

import mammoth from "mammoth";
import { CopyToClipboard } from "react-copy-to-clipboard"; 
import Personalities from "@/components/Personalities";
import Form from "@/components/Form";

const EditChatbot = ({ params: { id } }: { params: { id: string } }) => {
  // console.log("id ->", id);

  const [chatbotName, setChatbotName] = useState("");
  const [url, setUrl] = useState<string>("");
  const [newCharacteristic, setNewCharacteristic] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(
    null
  );

  const embedCode = `
  <!-- Chatbot IFrame Code -->
  <iframe 
    id="chatbot-iframe" 
    src="${url}"  <!-- Replace with your embed URL -->
    width="500px" 
    height="500px" 
    style="border: none; overflow: hidden;"
    allowfullscreen>
  </iframe>
  `;

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

  // console.log("characteristics: ", Characteristic);

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
          personality: selectedPersonality,
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
        <Loading />
      </div>
    );

  if (error) return <p>Error: {error.message}</p>;

  if (!data?.chatbots) return redirect("/dashboard/view-chatbots");

  // console.log( "data?.chatbots?.chatbot_characteristics:-",    data?.chatbots?.chatbot_characteristics);

  // Type the event parameter to include the target file input
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // Use optional chaining to safely access the first file
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result; // Use optional chaining here as well

        // Use mammoth to extract text from the DOCX file
        try {
          if (arrayBuffer instanceof ArrayBuffer) {
            const { value } = await mammoth.extractRawText({ arrayBuffer });
            setNewCharacteristic(value);
          } else {
            console.error(
              "Error: arrayBuffer is not an instance of ArrayBuffer"
            );
          }
        } catch (error) {
          console.error("Error extracting text from DOCX:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="px-0 md:p-10 bg-gray-300 shadow-xl dark:bg-primary-DARK">
      <div className="text-white text-sm  sm:max-w-lg ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-primary dark:bg-primary/20">
        <h2 className="font-bold">Link to chat</h2>
        <p className="text-sm italic text-white">
          Share the link to start conversations with your chatbot
        </p>

        <div className="text-black flex items-center space-x-2">
          <CopyToClipboard
            text={embedCode}
            onCopy={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
            }}
          >
            <Button className="text-white">
              {copied ? "Copied!" : "Copy IFrame"}
            </Button>
          </CopyToClipboard>
          <Link href={url} className="w-full pointer hover:opacity-50">
            <Input value={url} readOnly className="pointer dark:bg-white" />
          </Link>
          <Button
            size="sm"
            className="px-2 text-white"
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
          <Image src={logo} alt="Logo" className="w-16 lg:w-24 " />
          <form
            onSubmit={handleUpdateChatbot}
            className="flex flex-1 space-2-x items-center"
          >
            <div>
              <Input
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                placeholder={chatbotName}
                className="w-full border-none bg-transparent text-xl font-bold"
              />
              <Personalities
                selectedPersonality={selectedPersonality}
                setSelectedPersonality={setSelectedPersonality}
              />
         
            </div>
            <Button
              type="submit"
              disabled={!chatbotName}
              className="text-white"
            >
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
              placeholder="Example: If customers asks for process, provide pricing page: www.example.com/pricing"
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
              className="flex-grow"
            />
            <Input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="flex-none w-52"
            />
            

            <Button
              type="submit"
              disabled={!newCharacteristic}
              className="flex-none text-white"
            >
              Add
            </Button>
          </form>
          
        <Form id={id} />

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

      <>
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
      </>
    </div>
  );
};

export default EditChatbot;
