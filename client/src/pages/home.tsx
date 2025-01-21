import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Newspaper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NewsCard from "@/components/news-card";
import LoadingSpinner from "@/components/loading-spinner";
import { fetchNewsFromDeepSeek } from "@/lib/api";

type NewsItem = {
  title: string;
  content: string;
  timestamp: string;
};

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { toast } = useToast();

  const { mutate: fetchNews, isPending } = useMutation({
    mutationFn: fetchNewsFromDeepSeek,
    onSuccess: (data) => {
      setNews(data);
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Real-Time News</h1>
          <p className="text-muted-foreground">
            Get the latest news with a single click
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
        ) : (
          <div className="grid gap-6">
            {news.map((item, index) => (
              <NewsCard key={index} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}