import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser, Page } from "puppeteer";
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

// Content selectors
const contentSelectors: string[] = [
  "article",
  "main",
  ".content",
  ".article-content",
  "#main-content",
  ".main-content",
  ".post-content", // For blog posts
  ".entry-content", // For WordPress
  ".page-content", // For static pages
  "section", // General sections
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

// Page setup function
const setupPage = async (page: Page): Promise<void> => {
  page.setDefaultNavigationTimeout(config.timeout);
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });
};

// Content extraction function
const extractContent = async (page: Page): Promise<ScrapeResult> => {
  const title = await page.title();
  console.log("title: ", title);

  let paragraphs: string[] = [];

  // Modified paragraph extraction to avoid nested paragraphs
  for (const selector of contentSelectors) {
    // Only select direct paragraph children using '>'
    const directParagraphs = await page.$$eval(`${selector} > p`, (elements) =>
      elements.map((el) => el.textContent?.trim() || "")
    );

    // Also get paragraphs from other containers that might be semantic sections
    const containerParagraphs = await page.$$eval(
      `${selector} div > p, ${selector} section > p, ${selector} article > p`,
      (elements) => elements.map((el) => el.textContent?.trim() || "")
    );

    // Combine and deduplicate paragraphs
    const allParagraphs = [
      ...new Set([...directParagraphs, ...containerParagraphs]),
    ];

    if (allParagraphs.length > 0) {
      paragraphs = allParagraphs;
      break;
    }
  }

  // Fallback to direct p elements if no paragraphs are found, avoiding nesting
  if (paragraphs.length === 0) {
    const directParagraphs = await page.$$eval(
      "body > p, body > div > p, body > section > p, body > article > p",
      (elements) => elements.map((el) => el.textContent?.trim() || "")
    );
    paragraphs = [...new Set(directParagraphs)];
  }

  console.log("paragraphs: ", paragraphs);
  const cleanedParagraphs = cleanContent(paragraphs);
  console.log("cleanedParagraphs: ", cleanedParagraphs);

  // Modified heading extraction to avoid potential nesting
  const headings = cleanContent(
    await page.$$eval(
      "h1, h2, h3", // Simplified heading selection
      (elements) => elements.map((el) => el.textContent?.trim() || "")
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
  const browser: Browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await setupPage(page);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    return await extractContent(page);
  } catch (error) {
    if (retryCount < config.maxRetries) {
      console.log(`Retry ${retryCount + 1} for URL: ${url}`);
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );
      return scrapeWithRetry(url, retryCount + 1);
    }
    throw error;
  } finally {
    await browser.close();
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
