import { client } from "@/graphql/ApolloClient";
import {
  INSERT_CHAT_SESSION,
  INSERT_GUEST,
  INSERT_MESSAGE,
} from "@/graphql/mutation";
import { formatISO } from "date-fns";

export async function startNewChat(
  guestName: string,
  guestEmail: string,
  chatbotId: number
) {
  try {
    // console.log("startNewChat creation started");
    // console.log("guestName: ", guestName);
    // console.log("guestEmail: ", guestEmail);
    // console.log("chatbotId: ", chatbotId);

    // create new guest entry
    const guestResult = await client.mutate({
      mutation: INSERT_GUEST,
      variables: {
        name: guestName,
        email: guestEmail,
        created_at: formatISO(new Date()),
      },
    });
    const guestId = guestResult?.data?.insertGuests?.id;
    // console.log("guestResult: ", guestResult);

    // initialize new chat session
    const chatSessionResult = await client.mutate({
      mutation: INSERT_CHAT_SESSION,
      variables: {
        chatbot_id: chatbotId,
        guest_id: guestId,
        created_at: formatISO(new Date()),
      },
    });
    const chatSessionId = chatSessionResult?.data?.insertChat_sessions?.id;
    // console.log("chatSessionResult: ", chatSessionResult);

    // insert initial message
    const messageResult = await client.mutate({
      mutation: INSERT_MESSAGE,
      variables: {
        chat_session_id: chatSessionId,
        sender: "ai",
        content: `Welcome ${guestName}!\n How can I assist you today?`,
        created_at: formatISO(new Date()),
      },
    });
    // console.log("messageResult: ", messageResult);

    // console.log("New Chat Successfully Created!! :>>>> ");
    return chatSessionId;
  } catch (error) {
    console.error(
      "Error starting new chat session: ",
      JSON.stringify(error, null, 2)
    );
  }
}
