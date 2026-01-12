from django.shortcuts import render
from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    # This sorts the list by the highest priority score automatically
    queryset = Task.objects.all().order_by('-priority_score')
    serializer_class = TaskSerializer
