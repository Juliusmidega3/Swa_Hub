from django.db import models
from django.contrib.auth.models import User
import datetime
from datetime import date
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import jsonfield

# -------------------------
# User Roles
# -------------------------
class Role(models.TextChoices):
    STUDENT = "student", _("Student")
    TEACHER = "teacher", _("Teacher")

# -------------------------
# Student & Profile
# -------------------------
class Student(models.Model):
    full_name = models.CharField(max_length=100)
    enrolled_class = models.CharField(max_length=20)
    gender = models.CharField(max_length=10, default="Unknown")

    def __str__(self):
        return self.full_name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Role.choices)
    school = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

# -------------------------
# CBC structure
# -------------------------
class Strand(models.Model):
    name = models.CharField(max_length=120)
    grade = models.CharField(max_length=10, default="PP2")

    def __str__(self):
        return f"{self.grade} - {self.name}"

class SubStrand(models.Model):
    strand = models.ForeignKey(Strand, on_delete=models.CASCADE, related_name="sub_strands")
    name = models.CharField(max_length=120)

    def __str__(self):
        return f"{self.strand.grade} - {self.strand.name} - {self.name}"

class Lesson(models.Model):
    class_name = models.CharField(max_length=50, default="Unassigned")
    description = models.TextField(blank=True, null=True)
    date = models.DateField(default=datetime.date.today)
    strand = models.ForeignKey(Strand, on_delete=models.CASCADE, related_name="lessons")
    sub_strand = models.ForeignKey(SubStrand, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    objective = models.TextField(blank=True)
    content = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

# -------------------------
# Questions
# -------------------------
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
    data = models.JSONField(default=dict)
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.lesson.title} - {self.qtype}"

# -------------------------
# Assignments
# -------------------------
class Assignment(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="assignments")
    lesson_plan = models.ForeignKey("LessonPlan", on_delete=models.SET_NULL, null=True, blank=True, related_name="assignments")
    title = models.CharField(max_length=160)
    instructions = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.lesson.title})"

# -------------------------
# Submissions
# -------------------------
class Submission(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submissions")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="submissions")
    assignment = models.ForeignKey(Assignment, on_delete=models.SET_NULL, null=True, blank=True)
    answers = models.JSONField(default=dict)
    score = models.FloatField(default=0)
    total = models.FloatField(default=0)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# -------------------------
# Progress
# -------------------------
class Progress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress_entries")
    percent = models.PositiveIntegerField(default=0)
    stars = models.PositiveIntegerField(default=0)
    last_step = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

# -------------------------
# Tests & Results
# -------------------------
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

# -------------------------
# Attendance
# -------------------------
class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date = models.DateField(default=date.today)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("student", "date")

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"

# -------------------------
# Lesson Plans
# -------------------------
class LessonPlan(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_plans")
    strand = models.CharField(max_length=255)
    sub_strand = models.CharField(max_length=255)
    general_outcome = models.TextField()
    specific_outcome1 = models.TextField()
    specific_outcome2 = models.TextField(blank=True, null=True)
    specific_outcome3 = models.TextField(blank=True, null=True)
    enquiry_question = models.TextField()
    introduction = models.TextField()
    lesson_development = models.TextField()
    conclusion = models.TextField()
    reflection = models.TextField()
    assignment = jsonfield.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.strand} - {self.sub_strand} ({self.teacher.email})"

# -------------------------
# Signals: Auto-create profile
# -------------------------
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "profile"):
        Profile.objects.create(user=instance, role=Role.STUDENT)
