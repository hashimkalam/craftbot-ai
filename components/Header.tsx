import Link from "next/link"; 
import Avatar from "./Avatar";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <div className="bg-white shadow-sm text-gray-800 flex justify-between p-5">
      <Link href="/" className="flex items-center text-4xl font-thin">
        <Avatar seed="PAPAFAM Support Agent" />
        <div className="space-y-1">
          <h1>Assitly</h1>
          <p className="text-sm">Your customizable AI chat bot</p>
        </div>
      </Link>


      <div className="flex items-center">
        <SignedIn>
          <UserButton showName />
        </SignedIn>

        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </div>
  );
};

export default Header;
