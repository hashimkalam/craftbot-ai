"use client";
import { 
  SignOutButton,
  SignedIn, 
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import logo from "@/public/images/just_logo.webp";
import { ModeToggle } from "./ModeToggle";
import { SIDEBAR_OPTIONS } from "@/data/data";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center text-4xl font-thin justify-center group-hover:justify-start"
    >
      <Image src={logo} alt="Logo" className="w-12 lg:w-16" />
      <div className="hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform group-hover:translate-x-2 space-y-1 text-black dark:text-white">
        <h1>CraftBot</h1>
      </div>
    </Link>
  );
};

const NavigationLinks = () => {
  return (
    <ul className="gap-5 flex lg:flex-col mt-4">
      {SIDEBAR_OPTIONS.map((link: any, index) => {
        const Icon = link.icon;

        return (
          <li className="flex-1" key={index}>
            {link?.href ? (
              <Link
                href={link.href}
                className="sidebar-button justify-center group-hover:justify-start flex items-center"
              >
                <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
                <div className="relative overflow-hidden flex flex-col">
                  <p className="hidden group-hover:inline-block transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0 text-xl">
                    {link.title}
                  </p>
                  <p className="hidden group-hover:inline-block transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0 text-sm font-extralight">
                    {link.subtitle}
                  </p>
                </div>
              </Link>
            ) : (
              <SignOutButton>
                <div className="flex flex-col text-center lg:text-left lg:flex-row items-center gap-2 p-4 rounded-md bg-red-500/95 dark:bg-red-800/75 hover:bg-red-500 dark:hover:bg-red-800 justify-center group-hover:justify-start cursor-pointer h-full">
                  <div className="relative overflow-hidden flex space-x-2 ">
                    <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
                    <p className="hidden group-hover:inline-block transition-transform duration-300 ease-in-out transform translate-x-full group-hover:translate-x-0 text-xl">
                      {link.title}
                    </p>
                  </div>
                </div>
              </SignOutButton>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const SignInToggle = () => {
  return (
    <div className="flex items-center justify-center group-hover:justify-start space-x-2 dark:text-white">
      <SignedIn>
        <UserButton />
      </SignedIn>


      <div className="text-black dark:text-white">
        <ModeToggle />
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="bg-white dark:bg-primary-DARK text-white border-r-primary dark:border-r-white border-[1px] lg:rounded-r-3xl">
      {/* Main content section */}
      <div className="hidden lg:flex w-28 hover:w-80 transition-all duration-300 ease-in-out flex-col h-screen group sticky top-0 p-4">
        <div className="flex-grow">
          <Logo />
          <NavigationLinks />
        </div>

        {/* Sign-in and ModeToggle Section */}
        <SignInToggle />
      </div>

      <div className="lg:hidden p-4">
        <div className="flex items-center justify-between">
          <Logo /> <SignInToggle />
        </div>
        <div>
          <NavigationLinks />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
