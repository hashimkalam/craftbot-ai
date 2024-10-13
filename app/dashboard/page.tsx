import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser()
 
  return (
    <main className="p-10 bg-white dark:bg-primary-DARK m-10 rounded-lg w-full">
      <h1 className="text-4xl font-light">
        Hi {user?.firstName} - Welcome to <span className="text-primary font-semibold">CraftBot</span> 
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
