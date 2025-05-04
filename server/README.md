# Booki Chat Server

WebSocket chat server for the Booki app. This server handles real-time messaging between customers and travel agencies.

## Local Development with Bun

1. Install dependencies:
```
cd server
bun install
```

2. Create a `.env` file in the server directory with the following variables:
```
# Server ports
WS_PORT=3001
HTTP_PORT=3002

# Database connection
DATABASE_URL="postgresql://username:password@hostname:port/database"

# Other settings
NODE_ENV=development
```

3. Run the development server:
```
bun run dev
```

The WebSocket server will run on port 3001 and the HTTP API on port 3002 by default.

## Database Configuration

This microservice uses the same Neon PostgreSQL database as your Next.js app. To get it working properly:

1. Use the same `DATABASE_URL` that your main application uses
2. Make sure the `db/schema.ts` file in your root project includes all the tables needed for chat functionality
3. Create a `chatMessages` table in your database if you haven't already

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:

   - **Name**: booki-chat-server
   - **Environment**: Node
   - **Region**: Choose region closest to users
   - **Branch**: main (or your branch)
   - **Root Directory**: server
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Set environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `PORT`: Render will set this automatically
   - Any other required variables

5. Deploy the service

## Connecting Your Next.js App

Update your Next.js app's environment variables to point to the deployed chat server:

```
# .env.local in your Next.js project
NEXT_PUBLIC_WS_URL=wss://your-render-app.onrender.com
NEXT_PUBLIC_CHAT_API_URL=https://your-render-app.onrender.com
```

This enables your frontend to connect to the chat microservice. 