import { INSERT_FEEDBACK } from "@/graphql/mutation";
import { serverClient } from "@/lib/server/serverClient";
import { NextRequest, NextResponse } from "next/server";
import { formatISO } from "date-fns";

export async function POST(req: NextRequest) {
  console.log("Received request for feedback submission."); // Log the request receipt

  const { id, content } = await req.json(); // Expecting id and feedback content
  console.log("Extracted data: ", { id, content }); // Log the extracted data

  try {
    // Validate inputs
    if (!id || !content) {
      console.warn("Validation failed: Missing id or content."); // Log validation warning
      return NextResponse.json({ error: "Guest ID and content are required." }, { status: 400 });
    }

    // Log before saving feedback
    console.log("Saving feedback to the database...");

    // Save feedback in the database
    const feedbackResult = await serverClient.mutate({
      mutation: INSERT_FEEDBACK, // Ensure you have a GraphQL mutation to insert feedback
      variables: {
        chat_session_id: Number(id),
        content,
        created_at: formatISO(new Date()), // Current timestamp
      },
    });

    console.log("Feedback saved successfully: ", feedbackResult); // Log successful save result

    // Define a simple AI response message
    const aiResponseMessage = "Sure, noted! I'll take that into account."; // You can customize this message

    return NextResponse.json({
      id: feedbackResult?.data?.insertFeedback?.id, // Adjust according to your mutation response structure
      content,
      aiResponse: aiResponseMessage, // Adding AI response to the JSON response
    });
  } catch (error) {
    console.error("Error saving feedback: ", error); // Log error details
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  } finally {
    console.log("Feedback submission process completed."); // Log the end of the process
  }
}
