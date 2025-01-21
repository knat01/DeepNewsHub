import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from "react";
import NewsDetailsDialog from "./news-details-dialog";

interface NewsCardProps {
  title: string;
  content: string;
  timestamp: string;
  category?: string;
}

export default function NewsCard({ title, content, timestamp, category }: NewsCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
  const previewContent = paragraphs[0].slice(0, 150) + (paragraphs[0].length > 150 ? "..." : "");

  // Extract key points from content
  const keyPoints = content
    .split(".")
    .filter(sentence => sentence.trim().length > 20)
    .slice(0, 1)
    .map(point => point.trim() + ".");

  return (
    <>
      <Card 
        className="transition-all hover:shadow-lg cursor-pointer" 
        onClick={() => setShowDetails(true)}
      >
        <CardHeader>
          {category && (
            <span className="text-xs font-medium text-primary-foreground bg-primary px-2 py-1 rounded-full w-fit">
              {category}
            </span>
          )}
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          <time className="text-sm text-muted-foreground">
            {format(new Date(timestamp), "PPP")}
          </time>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{previewContent}</p>
          {keyPoints.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-primary">Key Takeaway:</p>
              <p className="text-sm text-muted-foreground">{keyPoints[0]}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <NewsDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        title={title}
        content={content}
        timestamp={timestamp}
      />
    </>
  );
}