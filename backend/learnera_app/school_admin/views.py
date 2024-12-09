from django.shortcuts import render
from rest_framework import generics, viewsets
from .models import SchoolAdmin
from .serializers import SchoolAdminSerializer


# Create your views here.

class SchoolAdminListCreateView(generics.ListCreateAPIView):
    queryset = SchoolAdmin.objects.all()
    serializer_class = SchoolAdminSerializer