import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Newspaper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NewsCard from "@/components/news-card";
import LoadingSpinner from "@/components/loading-spinner";
import { fetchNewsFromDeepSeek } from "@/lib/api";
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

// Helper function to categorize news
function categorizeNews(news: NewsItem[]): Record<string, NewsItem[]> {
  const mainCategories = ["Technology", "Politics", "Science", "Health", "Environment"];

  const categorizedNews: Record<string, NewsItem[]> = {
    "Featured": [],
    "Technology": [],
    "Politics": [],
    "Science": [],
    "Health": [],
    "Environment": [],
  };

  news.forEach(item => {
    // Add every article to Featured
    categorizedNews["Featured"].push(item);

    // Also add to its specific category if it exists
    const category = item.category || "Other";
    if (categorizedNews[category]) {
      categorizedNews[category].push(item);
    }
  });

  return Object.fromEntries(
    Object.entries(categorizedNews).filter(([_, items]) => items.length > 0)
  );
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Featured");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const categorizedNews = categorizeNews(news);
  const categories = Object.keys(categorizedNews);

  const { mutate: fetchNews, isPending, isError } = useMutation({
    mutationFn: fetchNewsFromDeepSeek,
    onSuccess: (data) => {
      setNews(data);
      setActiveCategory("Featured");
      setRetryCount(0); // Reset retry count on success
    },
    onError: (error) => {
      if (retryCount < MAX_RETRIES) {
        // Automatically retry on error
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchNews();
        }, 2000); // Wait 2 seconds before retrying
      } else {
        toast({
          title: "Error",
          description: "Unable to fetch news after multiple attempts. Please try again later.",
          variant: "destructive",
        });
        setRetryCount(0);
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Real-Time News with DeepSeek R1 Reasoning</h1>
          <p className="text-muted-foreground">
            Stay informed with the latest news and developments
          </p>
          <Button
            size="lg"
            onClick={() => fetchNews()}
            disabled={isPending}
            className="h-16 px-8 text-lg"
          >
            {isPending ? (
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

        {isPending ? (
          <LoadingSpinner isError={isError} />
        ) : news.length > 0 ? (
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full justify-start mb-6 overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2"
                >
                  {category}
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