
# News Aggregator Application

A modern web application that aggregates and displays news articles using AI-powered content generation. Built with React, Express, and TypeScript.

## Features

- Real-time news aggregation using DeepSeek AI
- Categorized news display (Technology, Politics, Science, Health, Environment)
- Responsive card-based UI
- Article preview with key takeaways
- Detailed article view in modal dialog
- Category filtering

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui Components
  - React Query

- Backend:
  - Express.js
  - DeepSeek API Integration
  - WebSocket Support

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file and add your DeepSeek API key:
```
DEEPSEEK_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend server
- `/db` - Database schema and configurations
- `/components` - Reusable UI components
- `/pages` - Application pages and routes

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## License

MIT
