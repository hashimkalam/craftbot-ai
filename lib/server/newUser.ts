import { client } from "@/graphql/ApolloClient";
import { INSERT_USER } from "@/graphql/mutation";
import { formatISO } from "date-fns";

export async function registerNewUser(clerk_user_id: string, subscription_plan: string) {
  try {
    // Log user information (optional)
    console.log("User registration started");

    // Create new user entry
    const userResult = await client.mutate({
      mutation: INSERT_USER,
      variables: {
        clerk_user_id,
        subscription_plan,
        created_at: formatISO(new Date()),
      },
    });
    // Log the successful registration
    console.log("User successfully registered: ", userResult);

  } catch (error) {
    console.error(
      "Error registering new user: ",
      JSON.stringify(error, null, 2)
    );
  }
}
