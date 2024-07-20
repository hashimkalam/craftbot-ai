import {
  GET_MESSAGES_BY_CHAT_SESSION_ID,
  INSERT_MESSAGE,
} from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { formatISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  //desruct the json and get the values
  const { chat_session_id, chatbot_id, content, name } = await req.json();
  console.log(
    "chat_session_id: ",
    chat_session_id,
    " content: ",
    content,
    " chatbot_id: ",
    chatbot_id,
    " name: ",
    name
  );

  try {
    // fetch chatbot characteristics
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "chatbot not found" }, { status: 404 });
    }

    // fetch users prev msgs
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });
    const prevMessages = messagesData.chat_sessions.messages;

    // formating msg for cater openai criteria
    const formattedPrevMessages: ChatCompletionMessageParam[] =
      prevMessages.map((message) => ({
        role: message.sender === "ai" ? "system" : "user",
        name: message.sender === "ai" ? "system" : name,
        content: message.content,
      }));

    // combine characteristics into a symtem prompt
    const systemPrompt = chatbot.chatbot_characteristics
      .map((char) => char.content)
      .join(" + ");
    console.log("systemPrompt: ", systemPrompt);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        name: "system",
        content: `you are a helpful assistent talking to ${name}. if a generic question is asked which is not relevant or in the same scope or fomarin as the points in mentioned in the key info seciton, kindly inform the user the are only allowed to search for the specified content. Use Emojis where possible. here are some key info that you need to be aware of , these are elements your may be asked about: ${systemPrompt}`,
      },
      ...formattedPrevMessages,
      {
        role: "user",
        name: name,
        content: content,
      },
    ];

    // send msg to open ai api
    const openaiRes = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });

    const aiResponse = openaiRes?.choices?.[0]?.message?.content?.trim();

    // errpr msg if no response
    if (!aiResponse) {
      return NextResponse.json({
        error: "failed to generate ai response",
        status: 500,
      });
    }

    // save users msg in db
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        sender: "user",
        content,
        created_at: formatISO(new Date()),
      },
    });

    // save ai response too
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        sender: "ai",
        content,
        created_at: formatISO(new Date()),
      },
    });

    // return ap res to the client
    return NextResponse.json({
      id: aiMessageResult?.data?.insertMessages?.id,
      content: aiResponse,
    });

    
  } catch (error) {
    console.error("error sending msg: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
