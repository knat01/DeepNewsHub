export async function fetchNewsFromDeepSeek() {
  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Please provide the top news headlines and summaries for ${currentDate}. Format the response as JSON with title, content, and timestamp fields.`;

  try {
    const response = await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    return response.json();
  } catch (error) {
    throw new Error("Error fetching news: " + (error as Error).message);
  }
}
