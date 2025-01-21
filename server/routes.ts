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
          model: "deepseek-reasoner",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Invalid response format from DeepSeek API");
      }

      try {
        // Extract the JSON part from the response
        const jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/) || 
                         content.match(/\[\s*{[\s\S]*}\s*\]/);

        if (!jsonMatch) {
          throw new Error("Could not find valid JSON in response");
        }

        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const newsData = JSON.parse(jsonStr);

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
            } else {
              item.category = "Other";
            }
          }
          return item;
        });

        res.json(processedNewsData);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        // If JSON parsing fails, structure the raw content as a single news item
        res.json([{
          title: "News Update",
          content: content,
          timestamp: new Date().toISOString(),
          category: "Other"
        }]);
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