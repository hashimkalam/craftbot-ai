// components/CreateChatBotWrapper.tsx 
import { fetchUserByClerkId } from "@/utils/fetchUserData"; 
import { auth } from "@clerk/nextjs/server";
import CreateChatBot from "./CreateChatBot";
import { fetchChatbots } from "@/utils/fetchChatbots";

export default async function CreateChatBotWrapper() {
  const { userId } = await auth();
  if (!userId) {
    return null; // Or redirect to login
  }

  const userData = await fetchUserByClerkId(userId);
  const subscriptionPlan = userData.subscription_plan;

  //user_2nD5yCDaT7JeFZazzpfZPFPAoEH
  console.log("userId:(create chatbot) ", userId    )

  const chatbots = await fetchChatbots(userId);

  return <CreateChatBot subscriptionPlan={subscriptionPlan} chatbots={chatbots} />;
}
