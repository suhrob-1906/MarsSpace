#!/bin/bash
# Render Deployment Script for MarsSpace Backend

echo "🚀 Starting MarsSpace Backend Deployment..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate --noinput

# Create superuser from environment variables (if not exists)
echo "👤 Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'superadmin')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'SuperAdmin2024!@#')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'superadmin@space.com')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password, role='ADMIN')
    print(f'✅ Superuser {username} created successfully!')
else:
    print(f'ℹ️  Superuser {username} already exists')
EOF

# Seed database with initial data
echo "🌱 Seeding database with initial data..."
python manage.py seed_db

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Deployment completed successfully!"
echo "🎉 MarsSpace Backend is ready!"
