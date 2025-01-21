export async function fetchNewsFromDeepSeek() {
  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Generate today's top news headlines (${currentDate}) across different categories:
  - 2 Technology stories
  - 2 Political stories
  - 2 Science/Space stories
  - 2 Health/Medical stories
  - 2 Environmental stories

  For each story, provide:
  - A compelling title
  - Detailed content (150-200 words)
  - An accurate timestamp
  - A specific category tag

  Format as a JSON array with objects having this structure:
  {
    "title": "string",
    "content": "string",
    "timestamp": "ISO date string",
    "category": "string" (one of: "Technology", "Politics", "Science", "Health", "Environment")
  }

  Make stories diverse, informative, and engaging.`;

  try {
    const response = await fetch("/api/news", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Error fetching news: " + (error as Error).message);
  }
}