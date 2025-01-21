import type { Express } from "express";
import { createServer, type Server } from "http";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export function registerRoutes(app: Express): Server {
  app.post("/api/news", async (req, res) => {
    if (!DEEPSEEK_API_KEY) {
      return res.status(500).json({
        message: "DeepSeek API key is not configured",
      });
    }

    try {
      const { prompt } = req.body;

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("DeepSeek API error response:", error);
        throw new Error(`DeepSeek API error: ${error}`);
      }

      const data = await response.json();
      console.log("DeepSeek API raw response:", JSON.stringify(data, null, 2));

      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error("Invalid DeepSeek API response structure:", data);
        throw new Error("Invalid response format from DeepSeek API");
      }

      try {
        // Extract the JSON part from the response using a more flexible regex
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/\[\s*{[\s\S]*?}\s*\]/);

        if (!jsonMatch) {
          console.error("Could not find JSON in content:", content);
          throw new Error("Could not find valid JSON in response");
        }

        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const cleanJsonStr = jsonStr.replace(/^```json\s*|\s*```$/g, '').trim();
        const newsData = JSON.parse(cleanJsonStr);

        // Ensure each news item has a category
        const processedNewsData = newsData.map((item: any) => {
          if (!item.category) {
            // Determine category based on content
            const text = (item.title + " " + item.content).toLowerCase();
            if (text.includes("quantum") || text.includes("ai") || text.includes("tech")) {
              item.category = "Technology";
            } else if (text.includes("climate") || text.includes("environment")) {
              item.category = "Environment";
            } else if (text.includes("health") || text.includes("medical")) {
              item.category = "Health";
            } else if (text.includes("space") || text.includes("research")) {
              item.category = "Science";
            } else if (text.includes("government") || text.includes("policy")) {
              item.category = "Politics";
            }
          }
          return item;
        });

        res.json(processedNewsData);
      } catch (parseError) {
        console.error("Parse error:", parseError, "Content:", content);
        // If JSON parsing fails, return a more informative error
        throw new Error(`Failed to parse news data: ${parseError.message}`);
      }
    } catch (error) {
      console.error("News API error:", error);
      res.status(500).json({
        message: "Error fetching news: " + (error as Error).message,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}