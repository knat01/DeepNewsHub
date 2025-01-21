import { useState } from "react";
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
  category?: string; // Added category property
};

// Helper function to categorize news
function categorizeNews(news: NewsItem[]): Record<string, NewsItem[]> {
  const categories = {
    "Technology": ["quantum", "computing", "ai", "technology"],
    "Science": ["research", "scientific", "study", "mars", "space"],
    "Health": ["medical", "health", "drug", "treatment", "disease"],
    "Environment": ["climate", "environmental", "energy", "sustainable"],
    "Politics": ["government", "policy", "political", "international"],
  };

  const categorizedNews: Record<string, NewsItem[]> = {
    "Featured": [],
    "Technology": [],
    "Science": [],
    "Health": [],
    "Environment": [],
    "Politics": [],
    "Other": [],
  };

  news.forEach(item => {
    const text = (item.title + " " + item.content).toLowerCase();
    let assigned = false;

    // Assign to first matching category
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categorizedNews[category].push({...item, category});
        assigned = true;
        break;
      }
    }

    // If no category matched, put in Other
    if (!assigned) {
      categorizedNews["Other"].push({...item, category: "Other"});
    }

    // Also add important news to Featured
    if (text.includes("breakthrough") || text.includes("historic") || text.includes("first")) {
      categorizedNews["Featured"].push({...item, category: "Featured"});
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(categorizedNews).filter(([_, items]) => items.length > 0)
  );
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("Featured");

  const categorizedNews = categorizeNews(news);
  const categories = Object.keys(categorizedNews);

  const { mutate: fetchNews, isPending } = useMutation({
    mutationFn: fetchNewsFromDeepSeek,
    onSuccess: (data) => {
      setNews(data);
      setActiveCategory("Featured");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
          <LoadingSpinner />
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