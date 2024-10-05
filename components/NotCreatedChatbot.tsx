import { Button } from "./ui/button";
import Link from "next/link";

function NotCreatedChatbot() {
  return (
    <div className="shadow-md rounded-md p-3 bg-white dark:bg-primary-DARK">
      <p>
        You have not created any chatbots yet to even have sessions. Click on
        the button below to create one!
      </p>
      <Link href="/dashboard/create-chatbot">
        <Button className="bg-primary/90 hover:bg-primary text-white p-3 rounded-md mt-5">
          Create Chatbot
        </Button>
      </Link>
    </div>
  );
}

export default NotCreatedChatbot;
