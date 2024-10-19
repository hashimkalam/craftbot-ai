import { SignUp } from "@clerk/nextjs";
import { Appearance } from "@clerk/types";
import logo from "@/public/images/logo.webp"; // Import your logo image
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import Image from "next/image";

const SignUpPage: React.FC = () => {
  // Define appearance configuration with TypeScript typing
  const appearance: Appearance = {
    elements: {
      card: "bg-white dark:bg-gray-800 p-8 rounded-lg", // Card background for light and dark mode
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      headerImage: "my-custom-image-class",
      formFieldInput:
        "p-3 border border-gray-300 dark:border-gray-600 rounded-lg", // Border for inputs
      footerActionLink: "text-primary hover:underline dark:text-blue-400", // Change link color in dark mode
      footer: "hidden",
      socialButtons: "dark:text-white",
      socialButton: "dark:text-white hover:underline",
      formFieldLabel:
        "dark:text-white text-[10px] md:text-[12px] lg:text-[14px]",
      formFieldError: "text-red-500 text-[10px] md:text-[12px] lg:text-[14px]",
      button:
        "bg-primary hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white",
    },
  };

  return (
    <div className="flex py-24 flex-col flex-1 justify-center items-center bg-primary dark:bg-primary-DARK relative">
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center mb-4 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
        <Image src={logo} alt="Logo" className="mb-4 w-32" priority />
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-2 text-primary dark:text-white">
          Create An Account
        </h1>
        <h2 className="text-sm md:text-[16px] lg:text-lg text-center text-gray-600 dark:text-white mb-4">
          Please sign up to continue
        </h2>
        <SignUp
          routing="hash"
          fallbackRedirectUrl="/"
          appearance={appearance}
        />
        <div className="flex items-center space-x-2 mt-6 text-xs md:text-sm lg:text-[16px]">
          <h1 className="text-gray-500 dark:text-white">
            Already have an account?
          </h1>
          <Link href="/sign-in" className="text-primary dark:text-blue-400">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
