import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

import logo from "@/public/images/just_logo.png";
import { ModeToggle } from "./ModeToggle";

const Header = () => {
  return (
    <div className="bg-white dark:bg-primary-DARK shadow-sm border-b-primary dark:border-b-white border-[1px] text-gray-800 flex justify-between p-5 py-2">
      <Link href="/" className="flex items-center text-4xl font-thin">
        <Image src={logo} alt="Logo" className="w-16 lg:w-24 mr-2 lg:mr-4" />
        <div className="space-y-1 dark:text-white">
          <h1>CraftBot</h1>
          <p className="text-sm">Your customizable AI chat bot</p>
        </div>
      </Link>

      <div className="flex items-center space-x-3 dark:text-white">
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton />
        </SignedOut>

        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
