import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import https from "https";
import http from "http";

import { CohereClient } from "cohere-ai";

const cohereApiKey = process.env.COHERE_API_KEY;

if (!cohereApiKey) {
  throw new Error("COHERE_API_KEY is not defined in the environment variables");
}

// Initialize the Cohere client
const cohere = new CohereClient({
  token: cohereApiKey,
});

// Helper function to fetch HTML from the given URL
const fetchHTML = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol.get(url, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        resolve(data);
      });

      response.on("error", (err) => {
        reject(err);
      });
    });
  });
};

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch HTML from the given URL
    const html = await fetchHTML(url);

    // Parse HTML using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract title
    const title =
      document.querySelector("title")?.textContent || "No title found";

    // Extract headings (h1, h2, h3, h4, h5, h6)
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).map((el) => el.textContent);

    // Extract paragraphs (p)
    const paragraphs = Array.from(document.querySelectorAll("p")).map(
      (el) => el.textContent
    );

    // Generate summary from Cohere
    const promptText = `${title}\n\nHeadings:\n${headings.join(
      "\n"
    )}\n\nParagraphs:\n${paragraphs.join("\n")}`; 
    const prompt = `Summarize the following data concisely, retaining only the crucial details. \n${promptText}`;

    const cohereResponse = await cohere.generate({
      model: "command",
      prompt: prompt, // Here, we pass the plain string prompt
      maxTokens: 500, // Adjust this as needed
    });
    const scrapedDataSummary = cohereResponse.generations[0].text;

    console.log("summary: ", scrapedDataSummary);

    // Return the scraped data
    return NextResponse.json({
      title,
      headings,
      paragraphs,
      scrapedDataSummary
    });
  } catch (error) {
    console.error("Error scraping website:", error);
    return NextResponse.json(
      { error: "Failed to scrape the website" },
      { status: 500 }
    );
  }
}
