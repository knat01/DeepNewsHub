import { useState, useEffect, useCallback } from "react";
import { Newspaper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NewsCard from "@/components/news-card";
import LoadingSpinner from "@/components/loading-spinner";
import { setupNewsWebSocket } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NewsItem = {
  title: string;
  content: string;
  timestamp: string;
  category?: string;
  source?: {
    name: string;
    url: string;
  };
};

function categorizeNews(news: NewsItem[]): Record<string, NewsItem[]> {
  const categories = {
    "Featured": news, // Featured now shows all articles
    "Technology": news.filter(item => item.category === "Technology"),
    "Politics": news.filter(item => item.category === "Politics"),
    "Science": news.filter(item => item.category === "Science"),
    "Health": news.filter(item => item.category === "Health"),
    "Environment": news.filter(item => item.category === "Environment"),
  };

  return Object.fromEntries(
    Object.entries(categories).filter(([_, items]) => items.length > 0)
  );
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleNewsBatch = useCallback((newBatch: NewsItem[]) => {
    setNews(prev => [...prev, ...newBatch]);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error("News fetch error:", error);
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      setTimeout(fetchNews, 2000);
    } else {
      toast({
        title: "Error",
        description: "Unable to fetch news after multiple attempts. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
      setRetryCount(0);
    }
  }, [retryCount, toast]);

  const handleComplete = useCallback(() => {
    setIsLoading(false);
    setRetryCount(0);
  }, []);

  const [wsApi, setWsApi] = useState<{ fetchNews: () => void; close: () => void } | null>(null);

  useEffect(() => {
    const api = setupNewsWebSocket(handleNewsBatch, handleError, handleComplete);
    setWsApi(api);
    return () => api.close();
  }, [handleNewsBatch, handleError, handleComplete]);

  const fetchNews = useCallback(() => {
    setNews([]);
    setIsLoading(true);
    wsApi?.fetchNews();
  }, [wsApi]);

  const categorizedNews = categorizeNews(news);
  const categories = Object.keys(categorizedNews);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Real-Time News</h1>
          <p className="text-muted-foreground">
            Stay informed with the latest news and developments
          </p>
          <Button
            size="lg"
            onClick={fetchNews}
            disabled={isLoading}
            className="h-16 px-8 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Fetching News...
              </>
            ) : (
              <>
                <Newspaper className="mr-2 h-5 w-5" />
                Fetch Latest News
              </>
            )}
          </Button>
        </div>

        {isLoading && news.length === 0 ? (
          <LoadingSpinner isError={retryCount > 0} />
        ) : news.length > 0 ? (
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full justify-start mb-6 overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2"
                >
                  {category} ({categorizedNews[category].length})
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categorizedNews[category].map((item, index) => (
                    <NewsCard key={index} {...item} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : null}
      </div>
    </div>
  );
}