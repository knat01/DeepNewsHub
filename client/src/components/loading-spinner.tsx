import { useEffect, useState } from "react";

const loadingMessages = [
  "Scanning global news sources...",
  "Analyzing trending topics...",
  "Finding the most relevant stories...",
  "Categorizing news articles...",
  "Verifying sources and facts...",
  "Preparing your personalized news feed..."
];

interface LoadingSpinnerProps {
  isError?: boolean;
}

export default function LoadingSpinner({ isError }: LoadingSpinnerProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-muted-foreground text-center animate-pulse">
        {isError ? "Retrying news fetch..." : loadingMessages[messageIndex]}
      </p>
    </div>
  );
}