"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/graphql/apolloClient";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const EditChatbot = ({ params: { id } }: { params: { id: string } }) => {
  console.log("id ->", id);

  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const url = `${BASE_URL}/chatbot/${id}`;
    setUrl(url);
  }, [id]);

  return (
    <div className="px-0 md:p-10 h-[500vh]">
      <div className="text-white text-sm md:sticky md:top-10 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-[#2991ee] ">
        <h2 className="font-bold">Link to chat</h2>
        <p className="text-sm italic text-white">
          SHare the link to start conversations with your chatbot
        </p>
        W
        <div className="text-black flex items-center space-x-2">
          <Link href={url} className="w-full pointer hover:opacity-50">
            <Input value={url} readOnly className="pointer" />
          </Link>
          <Button
            size="sm"
            className="px-2"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success("Copied to clipboard")
            }}
          >
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditChatbot;
