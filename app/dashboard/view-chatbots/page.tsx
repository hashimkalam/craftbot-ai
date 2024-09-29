import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { GET_CHATBOT_BY_USER } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import {
  Chatbot,
  GetChatbotsByUserData,
  GetChatbotsByUserDataVariables,
} from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export const dynamic = "force-dynamic"; // prevent caching - for updated content

async function ViewChatbots() {
  const { userId } = await auth();
  if (!userId) return <div>User ID not found. Please log in.</div>;

  try {
    // get chatbots for user
    const response = await serverClient.query<
      GetChatbotsByUserData,
      GetChatbotsByUserDataVariables
    >({
      query: GET_CHATBOT_BY_USER,
      variables: {
        clerk_user_id: userId,
      },
    });

    const { data } = response;
    console.log("data: ", data);

    // Ensure data is properly fetched
    if (!data || !data.chatbotsList || data.chatbotsList.length === 0) {
      return (
        <div>
          <p>
            You have not created any chatbots yet. Click on the button below to
            create one!
          </p>
          <Link href="/dashboard/create-chatbot">
            <Button className="bg-[#64b5f5] text-white p-3 rounded-md mt-5">
              Create Chatbot
            </Button>
          </Link>
        </div>
      );
    }

    // sorting chatbots by created_at date
    const sortedChatbotsByUser: Chatbot[] = [...data.chatbotsList].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const filteredChatbots: Chatbot[] = sortedChatbotsByUser.filter(
      (chatbot) => chatbot.clerk_user_id === userId
    );
    console.log("filteredChatbots: ", filteredChatbots);

    return (
      <div className="flex-1 pb-20 p-10">
        <h1 className="text-xl lg:text-3xl font-semibold mb-5">
          Active Chatbots
        </h1>

        <ul className="flex flex-col space-y-5">
          {filteredChatbots.map((chatbot) => (
            <Link href={`/dashboard/edit-chatbot/${chatbot.id}`} key={chatbot.id}>
              <li className="relative p-10 border rounded-md max-w-3xl bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Avatar seed={chatbot.name} />
                    <h2 className="text-xl font-bold">{chatbot.name}</h2>
                  </div>
                  <p className="absolute top-5 right-5 text-xs text-gray-400">
                    Created: {new Date(chatbot.created_at).toLocaleString()}
                  </p>
                </div>

                <hr className="mt-2" />

                <div className="grid grid-cols-2 gap-10 md:gap-5 p-5">
                  <h3 className="italic">Characteristics</h3>
                  <ul className="text-xs">
                    {chatbot.chatbot_characteristics.length === 0 ? (
                      <p>No Characteristics Added Yet</p>
                    ) : (
                      chatbot.chatbot_characteristics.map((characteristic) => (
                        <li
                          className="list-disc break-words"
                          key={characteristic.id}
                        >
                          {characteristic.content}
                        </li>
                      ))
                    )}
                  </ul>

                  <h3 className="italic">No of Sessions: </h3>
                  <p>{chatbot.chat_sessions.length}</p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return <div>Error fetching chatbots. Please try again later.</div>;
  }
}

export default ViewChatbots;
