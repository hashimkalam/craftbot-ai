import logo from "@/public/images/just_logo.webp";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "../loading";
import { fetchChatbots } from "@/utils/fetchChatbots";
import { lazy } from "react";
const NotCreatedChatbot = lazy(() => import("@/components/NotCreatedChatbot"));

export const dynamic = "force-dynamic"; // prevent caching - for updated content

async function ViewChatbots() {
  const { userId } = await auth();
  if (!userId) return <div>User ID not found. Please log in.</div>;
  console.log("userId:(view chatbot) ", userId )

  try {
    const chatbots = await fetchChatbots(userId);

    return (
      <div className="flex-1 pb-20 p-10">
        <h1 className="text-xl lg:text-3xl font-semibold mb-5">
          Active Chatbots ({chatbots.length})
        </h1>

        {chatbots.length === 0 ? (
          <Suspense fallback={<Loading />}>
            <NotCreatedChatbot />
          </Suspense>
        ) : (
          <ul className="flex flex-col space-y-5">
            {chatbots.map((chatbot) => (
              <Link
                href={`/dashboard/edit-chatbot/${chatbot.id}`}
                key={chatbot.id}
              >
                <li className="relative p-4 md:p-7 lg:p-10 border rounded-md max-w-3xl bg-white dark:bg-primary-DARK">
                  <div className="flex justify-between items-center">
                    <p className="absolute top-5 right-5 text-[10px] md:text-xs text-gray-400">
                      Created: {new Date(chatbot.created_at).toLocaleString()}
                    </p>

                    <div className="flex items-center space-x-2 lg:space-x-4 mt-6 lg:mt-0">
                      <Image
                        src={logo}
                        alt="Logo"
                        className="w-16 lg:w-24 mr-2 lg:mr-4"
                        loading="lazy"
                      />
                      <h2 className="text-xl font-bold">{chatbot.name}</h2>
                    </div>
                  </div>

                  <hr className="mt-2" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-5 p-5">
                    <h3 className="italic">Characteristics</h3>
                    <p>
                      {chatbot.chatbot_characteristics.length > 0
                        ? chatbot.chatbot_characteristics.length
                        : "No Characteristics Added Yet"}
                    </p>

                    <h3 className="italic">No of Sessions: </h3>
                    <p>{chatbot.chat_sessions.length}</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    );
  } catch (error) {
    return <div>Error fetching chatbots. Please try again later.</div>;
  }
}

export default ViewChatbots;
