from django.db import models
from django.contrib.auth.models import User
import datetime
from django.utils.translation import gettext_lazy as _

class Role(models.TextChoices):
    STUDENT = "student", _("Student")
    TEACHER = "teacher", _("Teacher")

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Role.choices)
    school = models.CharField(max_length=120, blank=True)
    def __str__(self): return f"{self.user.username} ({self.role})"

# CBC structure
class Strand(models.Model):
    name = models.CharField(max_length=120)            # e.g., Kusikiliza na Kuzungumza
    grade = models.CharField(max_length=10, default="PP2")
    def __str__(self): return f"{self.grade} - {self.name}"

class SubStrand(models.Model):
    strand = models.ForeignKey(Strand, on_delete=models.CASCADE, related_name="sub_strands")
    name = models.CharField(max_length=120)           # e.g., Salamu
    def __str__(self): return f"{self.strand.grade} - {self.strand.name} - {self.name}"

class Lesson(models.Model):
    class_name = models.CharField(max_length=50, default="Unassigned")  # ✅ Default for existing rows
    description = models.TextField(blank=True, null=True)
    date = models.DateField(default=datetime.date.today)
    strand = models.ForeignKey(Strand, on_delete=models.CASCADE, related_name="lessons")
    sub_strand = models.ForeignKey(SubStrand, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)          # e.g., Majina ya Wanyama
    objective = models.TextField(blank=True)          # learning outcome
    content = models.JSONField(default=dict)          # steps/games/audio refs
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class QuestionType(models.TextChoices):
    MCQ = "mcq", _("Multiple Choice")
    FILL = "fill", _("Fill in the blank")
    MATCH = "match", _("Matching")
    ORAL = "oral", _("Oral recording")
    UPLOAD = "upload", _("Upload image")

class Question(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="questions")
    qtype = models.CharField(max_length=20, choices=QuestionType.choices)
    prompt = models.TextField()
    data = models.JSONField(default=dict)  # options, correct answer, pairs, etc.
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)
    def __str__(self): return f"{self.lesson.title} - {self.qtype}"

class Assignment(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=160)
    instructions = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)

class Submission(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submissions")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="submissions")
    assignment = models.ForeignKey(Assignment, on_delete=models.SET_NULL, null=True, blank=True)
    answers = models.JSONField(default=dict)       # {question_id: value}
    score = models.FloatField(default=0)
    total = models.FloatField(default=0)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress_entries")
    percent = models.PositiveIntegerField(default=0)  # 0..100
    stars = models.PositiveIntegerField(default=0)    # gamified
    last_step = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    

class Test(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="tests")
    title = models.CharField(max_length=255)
    total_marks = models.PositiveIntegerField(default=0)
    date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Result(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="results")
    student_name = models.CharField(max_length=255)
    score = models.FloatField(default=0)
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_name} - {self.test.title}"


# Auto-create Profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "profile"):
        Profile.objects.create(user=instance, role=Role.STUDENT)
