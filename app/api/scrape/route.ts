import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom"; // Import jsdom
import axios from "axios"; // For HTTP requests
import { summarizeText } from "@/utils/summarizeText";
import { ScrapeConfig, ScrapedResponse, ScrapeResult } from "@/types/types";

// Configuration
const config: ScrapeConfig = {
  maxRetries: 3,
  timeout: 60000, // 60 seconds
  minContentLength: 10,
  maxParagraphs: 15,
};

// Boilerplate patterns
const boilerplatePatterns: RegExp[] = [
  /cookie policy/i,
  /privacy policy/i,
  /terms of service/i,
  /accept cookies/i,
  /newsletter signup/i,
  /subscribe to our/i,
  /follow us on/i,
  /share this/i,
  /copyright © /i,
  /all rights reserved/i,
  /for confidential support/i,
  /call the samaritans/i,
  /suicide prevention/i,
  /helpline/i,
  /support line/i,
  /crisis line/i,
  /\b1-800-[0-9-]+\b/i,
  /\b0800[0-9 ]+\b/i,
  /\b08457[0-9 ]+\b/i,
  /samaritans\.org/i,
  /suicidepreventionlifeline\.org/i,
  /for details/i,
  /click here/i,
  /visit (a local|http)/i,
];

// Content selectors - modified to cover more scenarios
const contentSelectors: string[] = [
  "article",
  "main",
  ".content",
  ".article-content",
  "#main-content",
  ".main-content",
  ".post-content",
  ".entry-content",
  ".page-content",
  "section",
  "div", // Adding div to cover general content blocks
];

// Content cleaning functions
const isBoilerplateContent = (text: string): boolean =>
  boilerplatePatterns.some((pattern) => pattern.test(text));

const cleanContent = (content: string[]): string[] =>
  content
    .filter((text) => text && text.length >= 10 && !isBoilerplateContent(text))
    .filter((text) => {
      const hasExcessiveNumbers = (text.match(/\d/g) || []).length > 10;
      const hasExcessiveUrls =
        (text.match(/\b(https?:\/\/|www\.)\S+/g) || []).length > 3;
      return !hasExcessiveNumbers && !hasExcessiveUrls;
    })
    .map((text) =>
      text
        .replace(/\s+/g, " ")
        .replace(/\b\d{5,}\b/g, "")
        .trim()
    );

// Content extraction function
const extractContent = async (html: string): Promise<ScrapeResult> => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const title = document.title;
  console.log("title: ", title);

  let paragraphs: string[] = [];

  // Extract paragraphs using content selectors
  for (const selector of contentSelectors) {
    const elements = document.querySelectorAll(`${selector} p`);
    const paragraphTexts = Array.from(elements).map(
      (el) => el.textContent?.trim() || ""
    );

    if (paragraphTexts.length > 0) {
      paragraphs = paragraphTexts;
      break;
    }
  }

  console.log("paragraphs: ", paragraphs);
  const cleanedParagraphs = cleanContent(paragraphs);
  console.log("cleanedParagraphs: ", cleanedParagraphs);

  const headings = cleanContent(
    Array.from(document.querySelectorAll("h1, h2, h3")).map(
      (el) => el.textContent?.trim() || ""
    )
  );

  // Construct mainContent
  let mainContent = "";

  if (headings.length > 0) {
    mainContent += headings.map((heading) => `${heading}`).join("\n\n");
  }

  if (cleanedParagraphs.length > 0) {
    mainContent +=
      (mainContent ? "\n\n" : "") +
      cleanedParagraphs.map((para) => `${para}`).join("\n\n");
  }

  console.log("mainContent: ", mainContent);

  return {
    title,
    headings,
    paragraphs: cleanedParagraphs,
    mainContent,
  };
};

// Main scraping function with retries
const scrapeWithRetry = async (
  url: string,
  retryCount = 0
): Promise<ScrapeResult> => {
  try {
    const { data: html } = await axios.get(url, { timeout: config.timeout });
    return await extractContent(html);
  } catch (error) {
    if (retryCount < config.maxRetries) {
      console.log(`Retry ${retryCount + 1} for URL: ${url}`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );
      return scrapeWithRetry(url, retryCount + 1);
    }
    throw error;
  }
};

// Main handler
export async function POST(
  req: NextRequest
): Promise<
  NextResponse<ScrapedResponse | { error: string; details?: string }>
> {
  try {
    const { url } = (await req.json()) as { url?: string };

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log(`Starting scrape for URL: ${url}`);
    const startTime = Date.now();

    const { title, headings, paragraphs, mainContent } = await scrapeWithRetry(
      url
    );

    if (mainContent.length < config.minContentLength) {
      console.log("Insufficient content found");
      return NextResponse.json(
        { error: "Not enough content to summarize" },
        { status: 400 }
      );
    }

    const scrapedDataSummary = await summarizeText(mainContent);
    const duration = Date.now() - startTime;

    const response: ScrapedResponse = {
      title,
      headings,
      paragraphs: paragraphs.slice(0, config.maxParagraphs), // Limit paragraphs returned
      scrapedDataSummary,
      metadata: {
        processingTimeMs: duration,
        totalParagraphs: paragraphs.length,
        contentLength: mainContent.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing request:", error);

    return NextResponse.json(
      {
        error: "Failed to process the website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
