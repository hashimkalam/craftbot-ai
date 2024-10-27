import { updateUser } from "@/lib/server/newUser";
import { fetchUserByClerkId } from "@/utils/fetchUserData";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth(); // Get the authenticated user's ID
    const subscription = await fetchUserByClerkId(userId);
    return NextResponse.json({ subscriptionPlan: subscription.subscription_plan });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { subscriptionPlan } = await request.json();
    const { userId } = await auth(); // Authenticate the user and get their userId

    // Update the user's subscription in the database
    await updateUser(userId, subscriptionPlan);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
