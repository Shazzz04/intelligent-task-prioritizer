from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'description', 
            'deadline', 
            'credit_weight', 
            'difficulty_level', 
            'intensity', 
            'grade_impact',
            'priority_score',
            'is_done',
            'student_name',
        ]