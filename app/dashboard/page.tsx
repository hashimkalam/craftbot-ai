import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-10 bg-white dark:bg-primary-DARK m-10 rounded-lg w-full">
      <h1 className="text-4xl font-light">
        Welcome to <span className="text-primary font-semibold">CraftBot</span>
      </h1>

      <h2 className="mt-2 mb-10 dark:text-white">
        Your customizable AI chat agent that helps you manage your customer
        conversations.
      </h2>

      <Link href="/dashboard/create-chatbot">
        <Button className="bg-primary/95 hover:bg-primary text-white">
          Lets get started by creating your first chatbot
        </Button>
      </Link>
    </main>
  );
}
