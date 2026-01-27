#!/usr/bin/env bash
# Build script for Render deployment
set -o errexit

echo "🚀 Starting MarsSpace Backend Build..."

cd backend

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Seed database
echo "🌱 Seeding database..."
python manage.py seed_db

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build completed successfully!"
