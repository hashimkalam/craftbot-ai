import { GET_USER_BY_ID } from "@/graphql/query";
import { serverClient } from "@/lib/server/serverClient";
import { User } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";

export const fetchUserData = async () => {
  const user = await currentUser();

  // Check if the user exists
  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    clerkUserId: user.id, // Assuming you want the same ID as clerk_user_id
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || null, // Get the primary email address
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const fetchUserByClerkId = async (
  clerk_user_id: string
): Promise<User> => {
  // Fetch the user by Clerk ID
  const response = await serverClient.query({
    query: GET_USER_BY_ID,
    variables: { clerk_user_id },
  });

  const user_data = response?.data?.user_data;

  // Check if user_data exists and return required fields
  if (!user_data) {
    throw new Error("No user data found for the provided Clerk ID.");
  }

  return {
    subscription_plan: user_data.subscription_plan,
  };
};
