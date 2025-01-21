// Create WebSocket connection
let ws: WebSocket | null = null;

export function setupNewsWebSocket(
  onNewsBatch: (news: any[]) => void,
  onError: (error: string) => void,
  onComplete: () => void
) {
  if (ws) {
    ws.close();
  }

  // Use the same host as the current page with the specific WebSocket path
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}/ws/news`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.error) {
      onError(data.error);
    } else if (data.type === "news_batch") {
      onNewsBatch(data.data);
    } else if (data.type === "complete") {
      onComplete();
    }
  };

  ws.onerror = () => {
    onError("WebSocket connection error");
  };

  return {
    fetchNews: () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send("fetch_news");
      } else {
        onError("WebSocket not connected");
      }
    },
    close: () => {
      ws?.close();
      ws = null;
    }
  };
}