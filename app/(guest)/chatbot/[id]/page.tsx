"use client";

import logo from "@/public/images/just_logo.png";
import Messages from "@/components/Messages";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { startNewChat } from "@/lib/server/startNewChat";
import {
  GetChatbotByIdResponse,
  Message,
  MessageByChatSessionIdVariables,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod"; // validation library for forms
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Mic } from "lucide-react";
import VoiceOver from "@/components/VoiceOver";

const formSchema = z.object({
  message: z.string().min(2, "Your message is too short!!"),
});

function ChatbotPage({ params: { id } }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [chatId, setChatId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // const [sentiment, setSentiment] = useState<string>("");
  const [voice, setVoice] = useState(false);

  // form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: ""
    },
  });

  // Getting chatbot data
  const { data: chatbotData } = useQuery<GetChatbotByIdResponse>(
    GET_CHATBOT_BY_ID,
    {
      variables: { id },
    }
  );

  console.log("chatbotData: ", chatbotData);

  // get messages by chatsessionId
  const {
    loading: loadingQuery,
    error,
    data,
  } = useQuery<
    MessagesByChatSessionIdResponse,
    MessageByChatSessionIdVariables
  >(GET_MESSAGES_BY_CHAT_SESSION_ID, {
    variables: {
      chat_session_id: chatId,
    },
    skip: !chatId,
  });

  // data has the messages content
  useEffect(() => {
    if (data) {
      setMessages(data?.chat_sessions?.messages);
    }
  }, [data]);
  console.log("messages: ", messages);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const chatId = await startNewChat(name, email, Number(id));
    console.log("chatId: ", chatId);

    setChatId(chatId);
    setLoading(false);
    setIsOpen(false);
  };

  // onsuvmit function
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const { message: formMessage } = values;

    const message = formMessage;
    form.reset();

    // open form box if necesssary data not taken - email and name
    if (!name || !email) {
      setIsOpen(true);
      setLoading(false);
      return;
    }

    // do not suvmit is msg is empty
    if (!message.trim()) {
      return;
    }
    /*
    try {
      const response = await fetch('/api/analyzeSentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }


      const data = await response.json();
      // Assuming the response contains 'sentiment' and 'score'
      console.log(data)
      setSentiment(data.sentiment); // 'positive', 'negative', or 'neutral'
    } catch (error) {
      console.error('Error sending feedback:', error);
    }*/

    // optimistically update ui w user's msg
    const userMessage: Message = {
      id: Date.now(),
      content: message,
      created_at: new Date().toISOString(),
      chat_session_id: chatId,
      sender: "user",
    };

    // showing loading state for ai response
    const loadingMessage: Message = {
      id: Date.now() + 1,
      content: "AI Thinking...",
      created_at: new Date().toISOString(),
      chat_session_id: chatId,
      sender: "ai",
    };

    // set messages
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      loadingMessage,
    ]);

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          chat_session_id: chatId,
          chatbot_id: id,
          content: message,
        }),
      });

      const result = await response.json();
      console.log("ai result response: ", result);

      // updatin loading msg from ai with actual response
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === loadingMessage.id
            ? { ...msg, content: result.content, id: result.id }
            : msg
        )
      );
    } catch (error) {
      console.error("error sendin msg: ", error);
    }
  }

  return (
    <div className="w-full flex bg-gray-100">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full lg:max-w-[425px]">
          <form onSubmit={handleInfoSubmit}>
            <DialogHeader>
              <DialogTitle>Lets help you out!</DialogTitle>
              <DialogDescription>
                I just need a few details to get started
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>

                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hashim Kalam"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Email
                </Label>

                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hashiimkalam@gmail.com"
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!name || !email || loading}>
                {!loading ? "Continue" : "Loading..."}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-2xl md:mt-10">
        <div className="pb-4 border-b sticky top-0 z-50 bg-[#4d7dfb] py-5 px-10 text-white md:rounded-t-lg flex items-center space-x-4">
          <Image src={logo} alt="Logo" className="w-16 lg:w-24 mr-2 lg:mr-4" />
          <div>
            <h1 className="truncate text-lg">{chatbotData?.chatbots.name}</h1>
            <p className="text-sm text-gray-300">Typically replies instantly</p>
          </div>
        </div>

        {voice ? (
          <div className="h-full flex items-center justify-center relative">
            <button
              onClick={() => setVoice(false)}
              className="absolute top-5 right-5"
            >
              Back To Text
            </button>
            <div>
           

              <VoiceOver />
            </div>
          </div>
        ) : (
          <>
            {" "}
            <Messages
              messages={messages}
              chatbotName={chatbotData?.chatbots?.name!}
            />
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center sticky bottom-0 z-50 space-x-4 drop-shadow-lg p-4 bg-gray-100 rounded-md"
              >
                <button
                  onClick={() => setVoice(true)}
                  className="border-[2px] border-black rounded-full p-2 opacity-90 hover:opacity-100 hover:bg-primary hover:text-white ease-in-out duration-300 cursor-pointer"
                >
                  <Mic />
                </button>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel hidden>Message</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type a messsage..."
                          {...field}
                          className="p-8"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-full"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isValid
                  }
                >
                  Send
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatbotPage;
