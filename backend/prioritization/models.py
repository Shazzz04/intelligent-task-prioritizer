from django.db import models
from django.utils import timezone
import math

class Task(models.Model):
    # Core Task Info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True) 
    deadline = models.DateTimeField()
    
    # Status and Subtasks
    is_done = models.BooleanField(default=False)
    subtasks = models.JSONField(default=list, blank=True)
    
    # MCDM Input Variables (Aligned with Section 2.1 of your Proposal)
    credit_weight = models.IntegerField(default=15) 
    difficulty_level = models.IntegerField(default=5) # 1-10
    intensity = models.IntegerField(default=5)      # 1-10
    grade_impact = models.IntegerField(default=5)   # NEW: Added from your proposal (Weightage %)
    
    # Algorithm Output
    priority_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Calculate Urgency using a Logarithmic or Reciprocal decay
        # This prevents the score from exploding to infinity
        time_diff = self.deadline - timezone.now()
        hours_left = max(time_diff.total_seconds() / 3600, 1) # Min 1 hour to avoid div by zero

        # 2. Advanced MCDM Formula Logic (Weighted Linear Combination)
        # We give higher weight to credits and grade impact as per academic needs
        importance = (self.credit_weight * 0.4) + (self.grade_impact * 0.6)
        effort = (self.difficulty_level + self.intensity) / 2
        
        # Urgency factor: Tasks due sooner get a multiplier
        # 1000/hours_left ensures that as hours decrease, priority increases exponentially
        urgency_multiplier = 100 / math.log10(hours_left + 10) 

        # Final Priority Calculation
        base_priority = (importance * effort) * urgency_multiplier
        
        # 3. Store result
        self.priority_score = round(base_priority, 2)
        
        super(Task, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - Priority: {self.priority_score}"