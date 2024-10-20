import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import https from "https";
import http from "http";
import fetch from "node-fetch"; // Ensure you install node-fetch

const hfApiKey = process.env.HUGGING_FACE_API_TOKEN;

if (!hfApiKey) {
  throw new Error(
    "HUGGING_FACE_API_KEY is not defined in the environment variables"
  );
}

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

// Helper function to summarize text using Hugging Face API
const summarizeText = async (text: string): Promise<string> => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${text}\n\nSummarize the key points in a clear, human-like manner. Focus on the most relevant and important achievements and roles. Avoid unnecessary details and repetition. Ensure the summary reads naturally, emphasizing clarity and conciseness.`,
        parameters: {
          max_length: 200, // Adjusted for concise output
          min_length: 100, // Ensuring some detail is kept
          do_sample: false, // Disable sampling for deterministic summaries
        },
      }),
    }
  );

  const result = (await response.json()) as { summary_text: string }[];

  if (response.ok) {
    return result[0].summary_text;
  } else {
    throw new Error(`Failed to summarize: ${result}`);
  }
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

    // Extract paragraphs (p) while avoiding unnecessary sections like footer, aside, and nav
    const paragraphs = Array.from(document.querySelectorAll("p"))
      .map((el) => {
        // Filter out content from irrelevant sections like footer, nav, and script
        if (
          el.closest("footer") ||
          el.closest("aside") ||
          el.closest("nav") ||
          el.closest("script")
        ) {
          return null; // Return null for irrelevant content
        }
        return el.textContent; // Keep relevant paragraph text
      })
      .filter(Boolean); // Filter out any `null` values

    // Filter out sections like advertisements and footers using jsdom selectors
    const mainContent = paragraphs.join("\n");

    // Prepare the text to be summarized with clear separation of relevant sections
    const promptText = `
      Title: ${title}
      Headings: ${headings.join("\n")}
      Main Content: ${mainContent}
    `;

    // Generate summary using Hugging Face model
    const scrapedDataSummary = await summarizeText(promptText);

    console.log("summary: ", scrapedDataSummary);

    // Return the scraped data and summary
    return NextResponse.json({
      title,
      headings,
      paragraphs,
      scrapedDataSummary,
    });
  } catch (error) {
    console.error("Error scraping website:", error);
    return NextResponse.json(
      { error: "Failed to scrape the website" },
      { status: 500 }
    );
  }
}
