"use client";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_CHARACTERISTIC } from "@/graphql/mutation";
import { formatISO } from "date-fns";
import { toast } from "sonner";
import { GetChatbotByIdResponse, GetChatbotByIdVariables } from "@/types/types";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

function Form({ id }: { id: string }) {
  const [url, setUrl] = useState<string>("");
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    headings: string[];
    paragraphs: string[];
    scrapedDataSummary: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedSummary, setEditedSummary] = useState<string>("");

  // Add characteristic mutation
  const [addCharacteristic] = useMutation(ADD_CHARACTERISTIC, {
    refetchQueries: ["GetChatbotById"],
  });

  // Query to get chatbot details by ID
  const { data } = useQuery<GetChatbotByIdResponse, GetChatbotByIdVariables>(
    GET_CHATBOT_BY_ID,
    { variables: { id } }
  );

  // Function to add characteristic
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
      console.error("Failed to add characteristic: ", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scrape the website");
      }

      const data = await response.json();
      setScrapedData(data);

      if (data.scrapedDataSummary) {
        setEditedSummary(data.scrapedDataSummary); // Set the summary for editing
        setIsOpen(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setUrl("");
    }
  };

  const handleEditClick = () => {
    setEditMode(true); // Enable edit mode
  };

  const handleSaveClick = () => {
    if (scrapedData) {
      setScrapedData({
        ...scrapedData,
        scrapedDataSummary: editedSummary, // Save the edited summary
      });
    }
    setEditMode(false); // Disable edit mode
  };

  const handleSubmitSummary = async () => {
    const finalSummary = editMode
      ? editedSummary
      : scrapedData?.scrapedDataSummary;

    if (finalSummary) {
      // Call the function to add characteristic with the final summary (either edited or original)
      await handleAddCharacteristic(finalSummary);
      setIsOpen(false);
      setEditMode(false);
    }
  };

  //  console.log("error from frontend: ", error);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex items-center space-x-2"
      >
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          required
        />
        <Button
          type="submit"
          className="flex-none text-white"
          disabled={loading || !url}
        >
          {loading ? "Scraping..." : "Scrape"}
        </Button>
      </form>
      <p className="text-red-700 font-semibold mb-4">{error}</p>

      {/* Dialog for Scraped Data Summary */}
      {scrapedData?.scrapedDataSummary && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="h-[80%] flex flex-col">
            <DialogTitle>Scraped Data Summary</DialogTitle>
            <DialogHeader className="flex-grow overflow-y-scroll">
              {/* Adjust height and scroll */}
              <DialogDescription className="flex-grow h-full">
                {editMode ? (
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    className="border p-2 w-full h-full" // Ensure the textarea takes up the full height
                    rows={5}
                  />
                ) : (
                  <p>{scrapedData.scrapedDataSummary}</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {editMode ? (
                <button
                  onClick={handleSaveClick}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleSubmitSummary}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default Form;
