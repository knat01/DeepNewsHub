export async function fetchNewsFromDeepSeek() {
  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = `Generate the top 5 news headlines for ${currentDate}. For each news item, provide a title, detailed content, and timestamp. Format the response as a JSON array where each object has the structure: {"title": "string", "content": "string", "timestamp": "ISO date string"}. Make the content informative and engaging.`;

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