import Sidebar from "@/components/Sidebar";
import { fetchUserByClerkId } from "@/utils/fetchUserData";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  // Redirect to sign-in if userId is not available
  if (!userId) {
    redirect("/sign-in");
    return null; // Ensure no further code runs after redirect
  }

  const userData = await fetchUserByClerkId(userId);
  const subscriptionPlan = userData.subscription_plan;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col flex-1 lg:flex-row bg-gray-100 dark:bg-primary-DARK/80 relative">
        <Sidebar />
        <div className="lg:absolute right-5 top-5 ml-5 mt-2 lg:mt-0">
          <h2 className="text-lg font-semibold">Subscription Plan:</h2>
          <p>{subscriptionPlan}</p>
        </div>
        <div className="flex-1 flex justify-center lg:justify-start items-start max-w-5xl mx-auto w-full lg:my-[2%]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
