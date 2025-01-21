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
  const previewContent = content.slice(0, 150) + (content.length > 150 ? "..." : "");

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
          <p className="text-muted-foreground">{previewContent}</p>
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