from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        # Filter tasks by student_name from URL parameter
        # e.g. /api/tasks/?user=student1
        student_name = self.request.query_params.get('user', 'default')
        return Task.objects.filter(student_name=student_name).order_by('-priority_score')

    def perform_create(self, serializer):
        # Automatically assign student_name from URL parameter when creating
        student_name = self.request.query_params.get('user', 'default')
        serializer.save(student_name=student_name)