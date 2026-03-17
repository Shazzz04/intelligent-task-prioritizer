from django.db import models
from django.utils import timezone
from django.db.models import Max

class Task(models.Model):
    # Core Task Info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True) 
    deadline = models.DateTimeField()
    
    # Status and Subtasks
    is_done = models.BooleanField(default=False)
    subtasks = models.JSONField(default=list, blank=True)
    
    # MCDM Input Variables
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
        Formula: P = 100 x (0.65 x I + 0.25 x U + 0.10 x E)
        I = (C / C_max) x G        [Importance  — MCDM/WLC, Saaty 1980]
        U = 1 / (1 + H / 36)      [Urgency     — Steel 2007, Pareto]
        E = (D + In) / 20          [Effort      — Sweller 1994 CLT]
        Weights derived from AHP pairwise comparison (Saaty, 1980)
        """

        # Deadline validation — only blocks new tasks, not edits
        if not self.pk and self.deadline < timezone.now():
            raise ValueError("Deadline cannot be set in the past.")

        # STAGE 1: IMPORTANCE (0.65)
        # I = (C / C_max) x G
        max_credits = Task.objects.filter(is_done=False).aggregate(
            Max('credit_weight'))['credit_weight__max'] or 30
        max_credits = max(max_credits, 30)
        norm_credits = self.credit_weight / max_credits
        norm_grade = self.grade_impact / 100.0
        importance = norm_credits * norm_grade

        # STAGE 2: URGENCY (0.25)
        # U = 1 / (1 + H / 36)
        time_diff = self.deadline - timezone.now()
        hours_left = max(time_diff.total_seconds() / 3600, 0)
        urgency = 1.0 / (1.0 + (hours_left / 36.0))

        # STAGE 3: EFFORT (0.10)
        # E = (D + In) / 20
        effort = (self.difficulty_level + self.intensity) / 20.0
        effort = min(effort, 1.0)

        # FINAL: P = 100 x (0.65I + 0.25U + 0.10E)
        self.priority_score = round(
            100 * (
                0.65 * importance +
                0.25 * urgency +
                0.10 * effort
            ), 2
        )

        super(Task, self).save(*args, **kwargs)

    @property
    def urgency_category(self):
        """
        Categorization based on priority score.
        24hr override: any task due within 24 hours is always URGENT
        regardless of score — temporal proximity overrides all other
        factors (Steel, 2007). Reduces decision burden (Schwartz, 2004).
        """
        if self.priority_score is None:
            return "LOW"

        # 24 hour deadline override
        time_diff = self.deadline - timezone.now()
        hours_left = max(time_diff.total_seconds() / 3600, 0)
        if hours_left <= 24 and not self.is_done:
            return "URGENT"

        elif self.priority_score >= 50:
            return "URGENT"
        elif self.priority_score >= 25:
            return "MEDIUM"
        return "LOW"

    def __str__(self):
        return f"{self.title} - P:{self.priority_score} ({self.urgency_category})"