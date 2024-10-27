import { client } from "@/graphql/ApolloClient";
import { INSERT_USER, UPDATE_USER } from "@/graphql/mutation";
import { formatISO } from "date-fns";

export async function registerNewUser(clerk_user_id: string, subscription_plan: string) {
  try {
    console.log("User registration started");

    // Create new user entry
    const userResult = await client.mutate({
      mutation: INSERT_USER,
      variables: {
        clerk_user_id,
        subscription_plan,
        created_at: formatISO(new Date()),
        updated_at: formatISO(new Date()),
      },
    });
    console.log("User successfully registered: ", userResult);

  } catch (error) {
    console.error(
      "Error registering new user: ",
      JSON.stringify(error, null, 2)
    );
  }
}


export async function updateUser(clerk_user_id: string | null, subscription_plan: string) {
    try {
      console.log("Subscription Plan Upgrade Started");
      console.log("clerk_user_id: ", clerk_user_id)
      console.log("subscription_plan: ", subscription_plan)
      console.log("updatedTime: ", formatISO(new Date()))

      // Create new user entry
      const userResult = await client.mutate({
        mutation: UPDATE_USER,
        variables: {
          clerk_user_id,
          subscription_plan,
          updated_at: formatISO(new Date()),
        },
      });
      console.log("Subscription Plan Upgraded: ", userResult);
  
    } catch (error) {
      console.error(
        "Error registering new user: ",
        JSON.stringify(error, null, 2)
      );
    }
  }
  