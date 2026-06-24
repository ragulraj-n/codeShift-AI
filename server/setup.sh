#!/bin/bash

# CodeShift Bootstrap Script
echo "⚡ Bootstrapping CodeShift Application..."

# Go to server directory
echo "📦 Installing server dependencies..."
npm install

# Setup server environment file if not exists
if [ ! -f .env ]; then
  echo "📄 Creating server .env file from template..."
  cp .env.example .env
  echo "⚠️  Remember to update server/.env with your actual HF_TOKEN and GOOGLE_CLIENT_ID!"
else
  echo "✅ Server .env file already exists."
fi

# Go to client directory
echo "📦 Installing client dependencies..."
cd ../client
npm install

# Setup client environment file if not exists
if [ ! -f .env ]; then
  echo "📄 Creating client .env file..."
  echo "VITE_API_URL=http://localhost:5000/api" > .env
  echo "VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com" >> .env
  echo "⚠️  Remember to update client/.env with your VITE_GOOGLE_CLIENT_ID!"
else
  echo "✅ Client .env file already exists."
fi

echo "🎉 CodeShift development environment setup is complete!"
echo "💡 To run the application:"
echo "   1. Start MongoDB locally (or configure MONGODB_URI in server/.env)"
echo "   2. Start the Backend: cd server && npm run dev"
echo "   3. Start the Frontend: cd client && npm run dev"
