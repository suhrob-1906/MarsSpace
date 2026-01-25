from rest_framework import viewsets, permissions
from .models import EduverseCategory, EduverseVideo, BlogPost
from .serializers import EduverseCategorySerializer, EduverseVideoSerializer, BlogPostSerializer

class EduverseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EduverseCategory.objects.all()
    serializer_class = EduverseCategorySerializer

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
