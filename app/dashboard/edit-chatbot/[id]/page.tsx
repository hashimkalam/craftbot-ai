"use client";

import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/graphql/ApolloClient";
import { ADD_CHARACTERISTIC, DELETE_CHATBOT } from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from "@/types/types";
import { useMutation, useQuery } from "@apollo/client";
import { formatISO } from "date-fns";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import Loading from "../../loading";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

// Lazy-loaded components
const ChatbotDetails = lazy(
  () => import("@/components/editchatbot/ChatbotDetails")
);
const Characteristic = lazy(() => import("@/components/Characteristic"));
const Form = lazy(() => import("@/components/Form"));
const LinkToChat = lazy(() => import("@/components/editchatbot/LinkToChat"));

// Import mammoth normally, but we'll use it in a lazy manner
import mammoth from "mammoth";

const EditChatbot = ({ params: { id } }: { params: { id: string } }) => {
  const [url, setUrl] = useState<string>("");
  const [newCharacteristic, setNewCharacteristic] = useState<string>("");
  const [docState, setDocState] = useState({
    data: "",
    isOpen: false,
    editMode: false,
    editedData: "",
  });
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    isEditOpen: false,
  });

  const [deleteChatbot] = useMutation(DELETE_CHATBOT, {
    refetchQueries: ["GetChatbotById"],
    awaitRefetchQueries: true,
  });

  const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
    refetchQueries: ["GetChatbotById"],
  });

  const { data, loading, error } = useQuery<
    GetChatbotByIdResponse,
    GetChatbotByIdVariables
  >(GET_CHATBOT_BY_ID, {
    variables: { id },
  });

  useEffect(() => {
    setUrl(`${BASE_URL}/chatbot/${id}`);
  }, [id]);

  const handleDelete = useCallback(async () => {
    try {
      const promise = deleteChatbot({ variables: { id } });
      toast.promise(promise, {
        loading: "Deleting",
        success: "Successfully deleted Chatbot",
        error: "Failed to delete Chatbot",
      });
    } catch (error) {
      console.error("Error deleting chatbot: ", error);
      toast.error("Failed to delete chatbot");
    }
  }, [deleteChatbot, id]);

  const handleAddCharacteristic = useCallback(
    async (content: string) => {
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
    },
    [addCharacteristic, id]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result;
          try {
            if (arrayBuffer instanceof ArrayBuffer) {
              const { value } = await mammoth.extractRawText({ arrayBuffer });
              setDocState((prev) => ({ ...prev, data: value, isOpen: true }));
              // Clear the file input after successful upload
              event.target.value = "";
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
    },
    []
  );

  const toggleEditMode = useCallback(() => {
    setDocState((prev) => ({
      ...prev,
      editMode: !prev.editMode,
      editedData: !prev.editMode ? prev.data : prev.editedData,
    }));
  }, []);

  const handleSubmitDoc = useCallback(async () => {
    await handleAddCharacteristic(docState.data);
    setDocState((prev) => ({ ...prev, isOpen: false, editMode: false }));
  }, [handleAddCharacteristic, docState.data]);

  if (loading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.chatbots) return redirect("/dashboard/view-chatbots");

  return (
    <div className="px-0 md:p-10 bg-gray-300 shadow-xl dark:bg-primary-DARK">
      <Suspense fallback={<Loading />}>
        <LinkToChat url={url} />
      </Suspense>

      <section className="relative mt-5 bg-white dark:bg-primary/20 p-5 md:p-10 rounded-lg">
        <Button
          variant="destructive"
          className="absolute top-2 right-2 h-8 w-2"
          onClick={() => setDialogState((prev) => ({ ...prev, isOpen: true }))}
        >
          X
        </Button>

        <Suspense fallback={<Loading />}>
          <ChatbotDetails id={id} />
        </Suspense>

        <h2 className="text-xl font-bold mt-10">
          Here&apos;s what your AI knows
        </h2>
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

          <Suspense fallback={<Loading />}>
            <Form id={id} />
          </Suspense>

          <ul className="flex flex-wrap-reverse gap-5">
            {data?.chatbots?.chatbot_characteristics.map((charac) => (
              <Suspense key={charac.id} fallback={<Loading />}>
                <Characteristic characteristic={charac} />
              </Suspense>
            ))}
          </ul>
        </div>
      </section>

      <Dialog
        open={docState.isOpen}
        onOpenChange={(open) =>
          setDocState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="h-[80%] flex flex-col">
          <DialogTitle>Doc Data</DialogTitle>

          <DialogHeader className="flex-grow overflow-y-scroll">
            <DialogDescription className="flex-grow h-full">
              {docState.editMode ? (
                <textarea
                  value={docState.editedData}
                  onChange={(e) =>
                    setDocState((prev) => ({
                      ...prev,
                      editedData: e.target.value,
                    }))
                  }
                  className="border p-2 w-full h-full resize-none"
                  rows={5}
                />
              ) : (
                <p>{docState.data}</p>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={toggleEditMode} variant="secondary">
              {docState.editMode ? "Save" : "Edit"}
            </Button>
            <Button onClick={handleSubmitDoc} variant="default">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogState.isOpen}
        onOpenChange={(open) =>
          setDialogState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="w-[80%] lg:max-w-[425px]">
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <div className="space-x-4 flex">
            <Button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 flex-1"
            >
              Yes
            </Button>
            <Button
              onClick={() =>
                setDialogState((prev) => ({ ...prev, isOpen: false }))
              }
              className="bg-[#4d7dfb] hover:bg-[#3068f5] flex-1"
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditChatbot;
