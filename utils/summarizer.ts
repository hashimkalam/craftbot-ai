const hfApiKey = process.env.HUGGING_FACE_API_TOKEN;

if (!hfApiKey) {
  throw new Error(
    "HUGGING_FACE_API_TOKEN is not defined in the environment variables"
  );
}

export const summarizeText = async (text: string): Promise<string> => {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 10, // Ensure a short summary
          min_length: 5,
          do_sample: false, // Ensure deterministic summary output
        },
      }),
    }
  );

  const result = (await response.json()) as { summary_text: string }[];

  if (response.ok) {
    return result[0].summary_text;
  } else {
    throw new Error(`Failed to summarize: ${JSON.stringify(result)}`);
  }
};
