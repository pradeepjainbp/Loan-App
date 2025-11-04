#!/bin/bash

# Loan App - Push to GitHub Script
# This script helps you push your code to GitHub

echo "🚀 Loan App - GitHub Push Helper"
echo "================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Run: git init"
    exit 1
fi

echo "✅ Git repository detected"
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Error: GitHub username is required"
    exit 1
fi

# Prompt for repository name
read -p "Enter repository name (default: loan-app): " REPO_NAME
REPO_NAME=${REPO_NAME:-loan-app}

# Construct repository URL
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "📋 Repository Details:"
echo "   Username: $GITHUB_USERNAME"
echo "   Repository: $REPO_NAME"
echo "   URL: $REPO_URL"
echo ""

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists"
    read -p "Do you want to update it? (y/n): " UPDATE_REMOTE
    
    if [ "$UPDATE_REMOTE" = "y" ] || [ "$UPDATE_REMOTE" = "Y" ]; then
        echo "Updating remote origin..."
        git remote set-url origin "$REPO_URL"
        echo "✅ Remote updated"
    fi
else
    echo "Adding remote origin..."
    git remote add origin "$REPO_URL"
    echo "✅ Remote added"
fi

echo ""
echo "📤 Ready to push to GitHub!"
echo ""
read -p "Push to GitHub now? (y/n): " PUSH_NOW

if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
    echo ""
    echo "Pushing to GitHub..."
    echo "You may be prompted for your GitHub credentials."
    echo "Use your Personal Access Token as the password."
    echo ""
    
    # Try to push
    if git push -u origin master; then
        echo ""
        echo "🎉 Success! Your code is now on GitHub!"
        echo "View it at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    else
        echo ""
        echo "⚠️  Push failed. Trying with main branch..."
        git branch -M main
        if git push -u origin main; then
            echo ""
            echo "🎉 Success! Your code is now on GitHub!"
            echo "View it at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
        else
            echo ""
            echo "❌ Push failed. Please check:"
            echo "   1. Repository exists on GitHub"
            echo "   2. You have the correct permissions"
            echo "   3. You're using a Personal Access Token"
            echo ""
            echo "Manual push command:"
            echo "   git push -u origin master"
        fi
    fi
else
    echo ""
    echo "📝 To push manually, run:"
    echo "   git push -u origin master"
    echo ""
    echo "Or if using main branch:"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo ""
echo "✅ Done!"

