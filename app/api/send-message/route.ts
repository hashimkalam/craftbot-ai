import {
  GET_MESSAGES_BY_CHAT_SESSION_ID,
  INSERT_MESSAGE,
  UPDATE_CHATBOT,
} from "@/graphql/mutation";
import { GET_CHATBOT_BY_ID } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatbotByIdResponse,
  MessagesByChatSessionIdResponse,
} from "@/types/types";
import { formatISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { CohereClient } from "cohere-ai";

const cohereApiKey = process.env.COHERE_API_KEY;

if (!cohereApiKey) {
  throw new Error("COHERE_API_KEY is not defined in the environment variables");
}

// Initialize the Cohere client
const cohere = new CohereClient({
  token: cohereApiKey,
});

export async function POST(req: NextRequest) {
  const { chat_session_id, chatbot_id, content, name, personality } =
    await req.json();

  try {
    // Fetch chatbot characteristics
    const { data } = await serverClient.query<GetChatbotByIdResponse>({
      query: GET_CHATBOT_BY_ID,
      variables: { id: chatbot_id },
    });

    const chatbot = data.chatbots;

    if (!chatbot) {
      return NextResponse.json({ error: "chatbot not found" }, { status: 404 });
    }

    // Fetch user's previous messages
    const { data: messagesData } =
      await serverClient.query<MessagesByChatSessionIdResponse>({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });
    const prevMessages = messagesData.chat_sessions.messages;

    // Format message for Cohere
    const formattedPrevMessages = prevMessages.map((message) => ({
      role: message.sender === "ai" ? "system" : "user",
      content: message.content,
    }));

    // Combine characteristics into a system prompt
    const chatbotCharacteristics = chatbot.chatbot_characteristics
      .map((char) => char.content)
      .join(" + ");

    // Construct the prompt using the specified format
    const prompt = [
      {
        role: "system",
        content: `Role: Assistant to ${name}

        Tasks:
        - Assist with inquiries based on chatbot characteristics.
        - Provide responses that are concise and relevant.

        Specific:
        - Focus on ${chatbotCharacteristics}.
        - Maintain a tone based on the personality: ${personality}.
        - Limit responses to a maximum of 200 characters.

        Context:
        - Previous exchanges: ${JSON.stringify(formattedPrevMessages)}.

        Example:
        - If the user asks about a specific topic within the defined scope, provide a clear and structured response that reflects the chatbot's personality.

        Notes:
        - Correct minor typos automatically.
        - Use relevant emojis sparingly.
        - Prioritize brevity and clarity.
        - Skip scope reminders for on-topic questions.`,
      },
      ...formattedPrevMessages,
      {
        role: "user",
        content: content,
      },
    ];

    // Generate response using Cohere
    const response = await cohere.generate({
      model: "command", // Ensure you use the correct model name
      prompt: prompt.map((p) => p.content).join("\n"), // Join prompt array as a string
      maxTokens: 250, // Adjust token limit as needed
    });

    const aiResponse = response.generations[0].text.trim();

    if (!aiResponse) {
      return NextResponse.json({
        error: "failed to generate AI response",
        status: 500,
      });
    }

    // Save user's message in the database
    await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        sender: "user",
        content,
        created_at: formatISO(new Date()),
      },
    });

    // Save AI response too
    const aiMessageResult = await serverClient.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id,
        sender: "ai",
        content: aiResponse,
        created_at: formatISO(new Date()),
      },
    });

    // Increment the message count for the chatbot
    const updatedMessageCount = chatbot.message_count + 2;
    console.log("updatedMessageCount: (from server) ", updatedMessageCount);

    const updateResponse = await serverClient.mutate({
      mutation: UPDATE_CHATBOT,
      variables: {
        id: chatbot.id,
        name: chatbot.name,
        personality: chatbot.personality,
        message_count: updatedMessageCount,
      },
    });
    console.log("Update response:", updateResponse);

    return NextResponse.json({
      id: aiMessageResult?.data?.insertMessages?.id,
      content: aiResponse,
    });
  } catch (error) {
    console.error("error sending msg: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
