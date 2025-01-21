import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewsDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  timestamp: string;
}

export default function NewsDetailsDialog({
  open,
  onOpenChange,
  title,
  content,
  timestamp,
}: NewsDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <time className="text-sm text-muted-foreground">
            {format(new Date(timestamp), "PPP")}
          </time>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">{content}</p>
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Key Points:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {content
                  .split(".")
                  .filter(sentence => sentence.trim().length > 20)
                  .slice(0, 3)
                  .map((point, index) => (
                    <li key={index}>{point.trim()}.</li>
                  ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
