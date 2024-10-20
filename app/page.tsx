import ClientHome from "@/components/Opening/ClientHome";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // Redirect to dashboard if authenticated
  if (userId) {
    redirect("/dashboard");
  }

  // Pass `userId` as a prop to the client-side component
  return <ClientHome userId={userId} />;
}
