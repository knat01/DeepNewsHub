import type { Express } from "express";
import { createServer, type Server } from "http";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1";

export function registerRoutes(app: Express): Server {
  app.post("/api/news", async (req, res) => {
    try {
      const { prompt } = req.body;

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-reasoner",
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from DeepSeek API");
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching news: " + (error as Error).message,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
