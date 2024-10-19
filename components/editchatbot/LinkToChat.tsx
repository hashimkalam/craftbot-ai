"use client";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function LinkToChat({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

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

  return (
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
          <Button className="bg-white text-black">
            {copied ? "Copied!" : "Copy IFrame"}
          </Button>
        </CopyToClipboard>
        <Link href={url} className="w-full pointer hover:opacity-50">
          <Input value={url} readOnly className="pointer dark:bg-white" />
        </Link>
        <Button
          size="sm"
          className="px-2 text-black bg-white"
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
  );
}

export default LinkToChat;
