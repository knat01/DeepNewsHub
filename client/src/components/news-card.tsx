import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface NewsCardProps {
  title: string;
  content: string;
  timestamp: string;
}

export default function NewsCard({ title, content, timestamp }: NewsCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <time className="text-sm text-muted-foreground">
          {format(new Date(timestamp), "PPP")}
        </time>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}
