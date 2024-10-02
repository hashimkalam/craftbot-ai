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
import { GET_FEEDBACK_BY_CHAT_SESSION_ID, GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { startNewChat } from "@/lib/server/startNewChat";
import {
  Feedback,
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
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [mode, setMode] = useState(0);

  // form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
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

   // Fetch Messages
   const {
    loading: loadingMessages,
    error: errorMessages,
    data: messagesData,
  } = useQuery(GET_MESSAGES_BY_CHAT_SESSION_ID, {
    variables: { chat_session_id: chatId },
    skip: !chatId,
  });

  // Fetch Feedback
  const {
    loading: loadingFeedback,
    error: errorFeedback,
    data: feedbackData,
  } = useQuery(GET_FEEDBACK_BY_CHAT_SESSION_ID, {
    variables: { chat_session_id: chatId },
    skip: !chatId,
  });
  

  // data has the messages content
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData?.chat_sessions?.messages);
    }
  }, [messagesData]);
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

  // onsubmit function
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

  async function onSubmitFeedback(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const { message: formMessage } = values;

    const feedback = formMessage;
    form.reset();

    // Open form box if necessary data not taken - email and name
    if (!name || !email) {
      setIsOpen(true);
      setLoading(false);
      return;
    }

    // Optimistically update UI with user's message
    const userFeedback: Feedback = {
      id: Date.now(),
      chat_session_id: chatId,
      content: feedback,
      created_at: new Date().toISOString(), 
    };

    // showing loading state for ai response
    const loadingMessage: Message = {
      id: Date.now() + 1,
      content: "AI Thinking...",
      created_at: new Date().toISOString(),
      chat_session_id: chatId,
      sender: "ai",
    };

    // Set messages
    setFeedback((prevFeedback) => [...prevFeedback, userFeedback]);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,  
          content: feedback,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("AI result response: ", result);

      // Updating loading message from AI with actual response
      setFeedback((prevFeedback) =>
        prevFeedback.map((feedback) =>
          feedback.id === loadingMessage.id
            ? { ...feedback, content: result.content, id: result.id }
            : feedback
        )
      );

      // Optionally handle any UI feedback on success
    } catch (error) {
      console.error("Error sending feedback: ", error);
      // Optionally handle UI error feedback
    } finally {
      setLoading(false); // Ensure loading state is reset
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
        <div className="pb-4 border-b sticky top-0 z-50 bg-primary py-5 px-10 text-white md:rounded-t-lg flex items-center space-x-4">
          <Image src={logo} alt="Logo" className="w-16 lg:w-24 mr-2 lg:mr-4" />
          <div>
            <h1 className="truncate text-lg">{chatbotData?.chatbots.name}</h1>
            <p className="text-sm text-gray-300">Typically replies instantly</p>
          </div>
        </div>
        <div className="flex justify-evenly text-center text-white">
          <button
            onClick={() => setMode(0)}
            className={`cursor-pointer w-full py-2 ${
              mode === 0 ? "bg-primary font-bold" : "bg-primary/80"
            }`}
          >
            Get To Know More
          </button>
          <p
            onClick={() => setMode(1)}
            className={`cursor-pointer w-full py-2 ${
              mode === 1 ? "bg-primary font-bold" : "bg-primary/80"
            }`}
          >
            Feedback
          </p>
        </div>

        <Messages
          messages={messages}
          feedback={feedback}
          chatbotName={chatbotData?.chatbots?.name!}
          mode={mode}
        />
        <Form {...form}>
          <form
            onSubmit={mode===0 ? form.handleSubmit(onSubmit) : form.handleSubmit(onSubmitFeedback)}
            className="flex items-center sticky bottom-0 z-50 space-x-4 drop-shadow-lg p-4 bg-gray-100 rounded-md"
          >
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
                      className="p-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-full"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              Send
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ChatbotPage;
