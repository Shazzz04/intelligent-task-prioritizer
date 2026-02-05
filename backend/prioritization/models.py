from django.db import models
from django.utils import timezone
from django.db.models import Max
import math

class Task(models.Model):
    # Core Task Info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True) 
    deadline = models.DateTimeField()
    
    # Status and Subtasks
    is_done = models.BooleanField(default=False)
    subtasks = models.JSONField(default=list, blank=True)
    
    # MCDM Input Variables (Core Criteria for Intelligent Prioritization)
    credit_weight = models.IntegerField(default=15) 
    difficulty_level = models.IntegerField(default=5)  # Scale: 1-10
    intensity = models.IntegerField(default=5)         # Scale: 1-10
    grade_impact = models.IntegerField(default=5)      # Weightage % (0-100)
    
    # Algorithm Output
    priority_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """
        UNIVERSITY STUDENT PRIORITY ENGINE v2.0
        The save method calculates the priority score using Multi-Criteria 
        Decision Making (MCDM) logic.
        """
        # Calculate time remaining
        time_diff = self.deadline - timezone.now()
        hours_left = max(time_diff.total_seconds() / 3600, 0)
        
        # STAGE 1: IMPORTANCE (65% TOTAL WEIGHT)
        max_credits = Task.objects.filter(is_done=False).aggregate(Max('credit_weight'))['credit_weight__max'] or 30
        max_credits = max(max_credits, 30) 
        norm_credits = self.credit_weight / max_credits
        
        norm_grade = self.grade_impact / 100.0
        
        # INCREASED MULTIPLIER: Reward high-impact tasks more
        grade_multiplier = 1.0 + (norm_grade * 0.8) 
        
        # Recalculated importance with the higher multiplier
        importance = (0.50 * norm_credits * grade_multiplier) + (0.15 * norm_grade)
        
        # STAGE 2: URGENCY (25%)
        # 36-hour ramp correctly identifies the "danger zone"
        urgency = 1.0 / (1.0 + (hours_left / 36.0))
        
        # STAGE 3: EFFORT (10%)
        effort_raw = (self.difficulty_level + self.intensity) / 20.0
        effort = min(effort_raw, 1.0)
        
        # Final weighted sum calculation
        self.priority_score = round(
            100 * (
                0.65 * importance +      
                0.25 * urgency +         
                0.10 * (1.0 - effort)    
            ), 2
        )

        super(Task, self).save(*args, **kwargs)

    @property
    def urgency_category(self):
        """
        Refined thresholds to ensure high-stakes academic tasks 
        trigger the correct visual warnings.
        """
        if self.priority_score is None:
            return "LOW"
        # Threshold at 50 ensures critical tasks like Thesis turn RED
        elif self.priority_score >= 50: 
            return "URGENT"
        # Threshold at 25 captures moderate importance
        elif self.priority_score >= 25:
            return "MEDIUM"
        return "LOW"

    def __str__(self):
        return f"{self.title} - P:{self.priority_score} ({self.urgency_category})"