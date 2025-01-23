from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Parent
from .serializers import ParentDetailSerlaizer

# Create your views here.


class ParentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ParentDetailSerlaizer
    queryset = Parent.objects.all()
    pagination_class = None
    
    def get_queryset(self):
        return Parent.objects.filter(user = self.request.user)
