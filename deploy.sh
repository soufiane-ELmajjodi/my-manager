#!/bin/bash

# Simple script to prepare for deployment
echo "🚀 Preparing GPS Manager for deployment..."

# 1. Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# 2. Ensure sensitive files are ignored
echo "🛡️ Checking .gitignore..."
if ! grep -q "credentials.json" .gitignore; then
  echo "credentials.json" >> .gitignore
fi
if ! grep -q ".env" .gitignore; then
  echo ".env" >> .gitignore
fi

# 3. Instruction for GitHub
echo ""
echo "✅ Preparation complete!"
echo "------------------------------------------------"
echo "Next steps to host for FREE:"
echo "1. Create a PRIVATE repository on GitHub."
echo "2. Run these commands:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git remote add origin YOUR_REPO_URL"
echo "   git push -u origin main"
echo ""
echo "3. Go to Render.com → New Web Service → Connect this repo."
echo "   - Root Directory: Use default or leave empty"
echo "   - Build Command: cd server && npm install"
echo "   - Start Command: node server/index.js"
echo ""
echo "4. Go to Vercel.com → New Project → Connect this repo."
echo "   - Framework: Vite"
echo "   - Root Directory: app"
echo "------------------------------------------------"
