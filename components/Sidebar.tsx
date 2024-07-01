import { BotMessageSquare, PencilLine, SearchIcon } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="bg-white text-white p-5">
      <ul className="gap-5 flex lg:flex-col">
        <li className="flex-1">
          <Link href="/create-chatbot" className="sidebar-button">
            <BotMessageSquare className="h-6 w-6 lg:h-8 lg:w-8" />
            <div className="hidden md:inline">
              <p className="text-xl">Create</p>
              <p className="text-sm font-extralight">New Chatbot</p>
            </div>
          </Link>
        </li>

        <li className="flex-1">
          <Link href="/view-chatbots" className="sidebar-button">
            <PencilLine className="h-6 w-6 lg:h-8 lg:w-8" />
            <div className="hidden md:inline">
              <p className="text-xl">Edit</p>
              <p className="text-sm font-extralight">Chatbots</p>
            </div>
          </Link>
        </li>

        <li className="flex-1">
          <Link href="/review-sessions" className="sidebar-button">
            <SearchIcon className="h-6 w-6 lg:h-8 lg:w-8" />
            <div className="hidden md:inline">
              <p className="text-xl">View</p>
              <p className="text-sm font-extralight">Sessions</p>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
