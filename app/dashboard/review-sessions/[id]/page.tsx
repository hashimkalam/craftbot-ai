import MessagesContainer from "@/components/MessagesContainer";
import { GET_CHAT_SESSION_MESSAGES } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  GetChatSessionMessagesResponse,
  GetChatSessionMessagesVariables,
} from "@/types/types";

export const dynamic = "force-dynamic"; // no caching

async function ReviewSession({ params: { id } }: { params: { id: string } }) {
  try {
    // Parse and validate chat session ID
    const chatSessionId = parseInt(id);
    // console.log("chatSessionId(ReviewSession): ", chatSessionId);
    if (isNaN(chatSessionId)) {
      return <div>Invalid session ID.</div>;
    }

    const response = await serverClient.query<
      GetChatSessionMessagesResponse,
      GetChatSessionMessagesVariables
    >({
      query: GET_CHAT_SESSION_MESSAGES,
      variables: { id: chatSessionId },
    });

    // console.log("id: ", id);

    // destructure the response
    const {
      data: { chat_sessions },
    } = response;

    if (!chat_sessions) {
      return <div>No chat session found with this ID.</div>;
    }

    const chatSession = chat_sessions;
    const {
      created_at,
      messages,
      feedbacks,
      chatbots: { name },
      guests: { name: guestName, email },
    } = chatSession;

    // console.log("chatsession: ", chatSession);

    return (
      <div className="flex-1 p-10 pb-24">
        <h1 className="text-xl lg:text-3xl font-semibold">Session Review</h1>
        <p className="font-light text-xs text-gray-400 mt-2">
          Started at {new Date(created_at).toLocaleString()}
        </p>

        <h2 className="font-light mt-2">
          Between {name} &{" "}
          <span className="font-extrabold">
            {guestName} ({email})
          </span>
        </h2>

        {/* Pass fetched data to a client-side component */}
        <MessagesContainer
          messages={messages}
          feedbacks={feedbacks}
          chatbotName={name}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching chat session messages:", error);
    return (
      <div>Error fetching chat session messages. Please try again later.</div>
    );
  }
}

export default ReviewSession;
