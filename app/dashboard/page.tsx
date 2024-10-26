import { Button } from "@/components/ui/button";
import { registerNewUser } from "@/lib/server/newUser"; 
import { fetchUserData } from "@/utils/fetchUserData";
import Link from "next/link";
import { redirect } from "next/navigation"; 

export default async function Home() {
  let user;

  try {
    user = await fetchUserData();
  } catch (error) {
    console.error("Error fetching user: ", error);
    redirect("/");
    return; // Ensure no further code runs after redirect
  }

  // If user is available, proceed to register new user
  await registerNewUser(user.clerkUserId, "standard");

  return (
    <main className="p-10 bg-white dark:bg-primary-DARK m-10 rounded-lg w-full">
      <h1 className="text-4xl font-light">
        Hi {user.firstName} - Welcome to{" "}
        <span className="text-primary font-semibold">CraftBot</span>
      </h1>

      <h2 className="mt-2 mb-10 dark:text-white">
        Your customizable AI chat agent that helps you manage your customer
        conversations.
      </h2>

      <Link href="/dashboard/create-chatbot">
        <Button className="bg-primary/95 hover:bg-primary text-white">
          Get started by creating your first chatbot
        </Button>
      </Link>
    </main>
  );
}
