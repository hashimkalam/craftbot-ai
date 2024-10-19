"use client";

import Image from "next/image";
import logo from "@/public/images/just_logo.webp";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  FormEvent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Input } from "../ui/input";
import Loading from "@/app/dashboard/loading";
import { toast } from "sonner";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_CHATBOT } from "@/graphql/mutation";
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from "@/types/types";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";

const Personalities = lazy(() => import("@/components/Personalities"));

function ChatbotDetails({ id }: { id: string }) {
  const [chatbotState, setChatbotState] = useState({
    name: "",
    personality: null as string | null,
  });
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    isEditOpen: false,
  });

  const { data, loading, error } = useQuery<
    GetChatbotByIdResponse,
    GetChatbotByIdVariables
  >(GET_CHATBOT_BY_ID, {
    variables: { id },
  });

  useEffect(() => {
    if (data) {
      setChatbotState((prevState) => ({
        ...prevState,
        name: data.chatbots?.name || "",
        personality: data.chatbots?.personality || null,
      }));
    }
  }, [data]);

  const [updateChatbot] = useMutation(UPDATE_CHATBOT, {
    refetchQueries: ["GetChatbotById"],
  });

  const handleUpdateChatbot = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const promise = updateChatbot({
          variables: {
            id,
            name: chatbotState.name,
            personality: chatbotState.personality,
          },
        });
        toast.promise(promise, {
          loading: "Updating...",
          success: "Chatbot successfully updated",
          error: "Failed to update chatbot",
        });
        setDialogState((prev) => ({ ...prev, isEditOpen: false }));
      } catch (err) {
        console.error("Failed to update chatbot: ", err);
      }
    },
    [updateChatbot, id, chatbotState]
  );

  return (
    <div className="flex space-x-4">
      <div className="flex items-center justify-between w-full space-x-2 lg:space-x-4 mt-4">
        <Image
          src={logo}
          alt="Logo"
          className="w-16 lg:w-24 flex-shrink-0"
          loading="lazy"
        />

        <div className="flex-grow">
          <p className="w-full border-none bg-transparent text-lg md:text-xl lg:text-2xl font-bold">
            {chatbotState.name}
          </p>

          <p className="w-full border-none bg-transparent text-xs md:text-sm lg:text-sm">
            {chatbotState.personality}
          </p>
        </div>

        <Button
          className="text-white hover:bg-green-700 flex-shrink-0"
          onClick={() =>
            setDialogState((prev) => ({ ...prev, isEditOpen: true }))
          }
        >
          Edit
        </Button>
      </div>

      <Dialog
        open={dialogState.isEditOpen}
        onOpenChange={(open) =>
          setDialogState((prev) => ({ ...prev, isEditOpen: open }))
        }
      >
        <DialogContent className="w-[80%] lg:max-w-[425px] py-10">
          <form onSubmit={handleUpdateChatbot} className="space-y-4">
            <div>
              <Input
                value={chatbotState.name}
                onChange={(e) =>
                  setChatbotState((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder={chatbotState.name}
                className="w-full border-none bg-gray-200 dark:bg-primary-DARK/50 text-xl font-bold"
              />

              <Suspense fallback={<Loading />}>
                <Personalities
                  selectedPersonality={chatbotState.personality}
                  setSelectedPersonality={(personality: string) =>
                    setChatbotState((prev) => ({ ...prev, personality }))
                  }
                />
              </Suspense>
            </div>
            <Button
              className="text-white hover:bg-green-700 w-full"
              type="submit"
            >
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChatbotDetails;
