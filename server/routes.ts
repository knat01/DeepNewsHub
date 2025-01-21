import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws/news"  // Specify a path for our WebSocket to avoid conflicts with Vite
  });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    ws.on("message", async (message) => {
      if (message.toString() === "fetch_news") {
        if (!DEEPSEEK_API_KEY) {
          ws.send(JSON.stringify({
            error: "DeepSeek API key is not configured"
          }));
          return;
        }

        try {
          // Make 4 separate calls to get 5 stories each
          for (let batch = 0; batch < 4; batch++) {
            const prompt = `Generate 5 diverse news headlines and stories for today (${new Date().toISOString().split('T')[0]}) across different categories.
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
                    content: prompt + "\n\nFor each story, also include a source section with: \n- Source name (e.g., Reuters, Associated Press)\n- Source URL (the original article URL)",
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
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
              console.error("Invalid DeepSeek API response structure:", data);
              throw new Error("Invalid response format from DeepSeek API");
            }

            try {
              const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                               content.match(/\[\s*{[\s\S]*?}\s*\]/);

              if (!jsonMatch) {
                console.error("Could not find JSON in content:", content);
                throw new Error("Could not find valid JSON in response");
              }

              const jsonStr = jsonMatch[1] || jsonMatch[0];
              const cleanJsonStr = jsonStr.replace(/^```json\s*|\s*```$/g, '').trim();
              const newsData = JSON.parse(cleanJsonStr);

              const processedNewsData = newsData.map((item: any) => {
                if (!item.category) {
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

                if (!item.source) {
                  item.source = {
                    name: "DeepSeek News",
                    url: "#",
                  };
                }

                return item;
              });

              // Send each batch immediately
              ws.send(JSON.stringify({
                type: "news_batch",
                data: processedNewsData,
                batchNumber: batch + 1,
                totalBatches: 4,
              }));

            } catch (parseError) {
              console.error("Parse error:", parseError, "Content:", content);
              ws.send(JSON.stringify({
                error: `Failed to parse news data: ${(parseError as Error).message}`
              }));
            }

            // Add a small delay between batches to prevent rate limiting
            if (batch < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          // Send completion message
          ws.send(JSON.stringify({ type: "complete" }));

        } catch (error) {
          console.error("News API error:", error);
          ws.send(JSON.stringify({
            error: "Error fetching news: " + (error as Error).message
          }));
        }
      }
    });
  });

  // Keep the REST endpoint for backward compatibility
  app.post("/api/news", (_req, res) => {
    res.status(400).json({
      message: "Please use the WebSocket connection for real-time news updates"
    });
  });

  return httpServer;
}