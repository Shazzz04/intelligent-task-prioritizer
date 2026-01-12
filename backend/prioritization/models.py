from django.db import models
from django.utils import timezone

class Task(models.Model):
    # Core Task Info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True) 
    deadline = models.DateTimeField()
    
    # NEW: Status and Subtasks
    is_done = models.BooleanField(default=False)
    subtasks = models.JSONField(default=list, blank=True) # This saves your list of steps!
    
    # MCDM Input Variables
    credit_weight = models.IntegerField(default=15) 
    difficulty_level = models.IntegerField(default=5) 
    intensity = models.IntegerField(default=5) 
    
    # Algorithm Output
    priority_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Calculate Urgency
        time_diff = self.deadline - timezone.now()
        days_left = max(time_diff.total_seconds() / 86400, 0.1) 

        # 2. MCDM Formula Logic
        complexity = self.difficulty_level + self.intensity
        base_priority = (self.credit_weight * complexity) / days_left
        
        # 3. Store result
        self.priority_score = round(base_priority, 2)
        
        super(Task, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - Priority: {self.priority_score}"