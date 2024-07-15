import { serverClient } from "@/lib/server/serverClient";
import { gql, ApolloError } from "@apollo/client";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  // Extract query and variables from JSON body
  const { query, variables } = await request.json();

  console.log("Received query: ", query);
  console.log("Received variables: ", variables);

  try {
    let result;

    if (!query || typeof query !== "string") {
      throw new Error("Invalid query format.");
    }

    // Validate and sanitize query (optional step)

    if (query.trim().startsWith("mutation")) {
      result = await serverClient.mutate({
        mutation: gql`${query}`,
        variables,
      });
    } else {
      result = await serverClient.query({
        query: gql`${query}`,
        variables,
      });
    }

    console.log("result: ", result)
    const data = result.data;
    console.log("Query result: ", data);

    return NextResponse.json({ data }, { headers: corsHeaders });
  } catch (error) {
    console.error("GraphQL request error: ", error);

    // Return a meaningful error response
    const errorMessage = error instanceof ApolloError ? error.message : "Internal server error.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
