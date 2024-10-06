"use client";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import logo from "@/public/images/just_logo.png";
import { ModeToggle } from "./ModeToggle";
import { SIDEBAR_OPTIONS } from "@/data/data";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center text-4xl font-thin">
      <Image
        src={logo}
        alt="Logo"
        className="w-12 lg:w-16 mr-2 lg:mr-4 transition-all duration-300 ease-in-out"
      />
      <div className="hidden group-hover:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out transform group-hover:translate-x-2 space-y-1 dark:text-white">
        <h1>CraftBot</h1>
        <p className="text-sm">Your customizable AI chat bot</p>
      </div>
    </Link>
  );
};

const NavigationLinks = () => {
  return (
    <ul className="gap-5 flex lg:flex-col mt-4">
      {SIDEBAR_OPTIONS.map((link, index) => {
        const Icon = link.icon;
        return (
          <li className="flex-1" key={index}>
            <Link
              href={link.href}
              className="sidebar-button justify-center group-hover:justify-start flex items-center"
            >
              <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
              <div className="hidden group-hover:inline-block">
                <p className="text-xl">{link.title}</p>
                <p className="text-sm font-extralight">{link.subtitle}</p>
              </div>
            </Link>
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

      <SignedOut>
        <SignInButton />
      </SignedOut>

      <ModeToggle />
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
