from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, StudyGroup
from .serializers import UserSerializer, StudyGroupSerializer

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAdminUser] # Fine-tuned from IsAuthenticated
