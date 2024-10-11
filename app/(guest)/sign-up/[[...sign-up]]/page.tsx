import { SignUp } from "@clerk/nextjs";
import { Appearance } from "@clerk/types";
import logo from "@/public/images/logo.webp"; // Import your logo image
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";

const SignUpPage: React.FC = () => {
  // Define appearance configuration with TypeScript typing
  const appearance: Appearance = {
    elements: {
      card: "bg-white dark:bg-gray-800 p-8 rounded-lg", // Card background for light and dark mode
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      headerImage: "my-custom-image-class",
      formFieldInput: "p-3 border border-gray-300 dark:border-gray-600 rounded-lg", // Border for inputs
      footerActionLink: "text-primary hover:underline dark:text-blue-400", // Change link color in dark mode
      footer: "hidden",
      socialButtons: "dark:text-white", // Ensure social buttons text is white in dark mode
      socialButton: "dark:text-white hover:underline", // Change color for individual social buttons
      formFieldLabel: "dark:text-white", // Set form field labels to white
      formFieldError: "text-red-500", // Set error messages to red for visibility 
      button: "bg-primary hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white", // Button styles
    },
  };

  return (
    <div className="flex py-24 flex-col flex-1 justify-center items-center bg-primary dark:bg-primary-DARK relative">
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center mb-4 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl"> {/* Main sign-in container */}
        <img src={logo.src} alt="Logo" className="mb-4 w-32" />
        <h1 className="text-3xl font-semibold text-center mb-2 text-primary dark:text-white">
          Create an Account
        </h1>
        <h2 className="text-lg text-center text-gray-600 dark:text-white mb-4">
          Please sign up to continue
        </h2>
        <SignUp
          routing="hash"
          fallbackRedirectUrl="/"
          appearance={appearance}
        />
        <div className="flex items-center space-x-2 mt-6">
          <h1 className="text-gray-500 dark:text-white">Already have an account?</h1>
          <Link href='/sign-in' className="text-primary dark:text-blue-400">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
