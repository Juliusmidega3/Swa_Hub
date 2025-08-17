from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Strand, SubStrand, Lesson, Question, Assignment, Submission,
    Progress, Test, Result, Attendance, LessonPlan, Student
)

# -------------------------
# User & Profile
# -------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "role", "school"]


# -------------------------
# Students
# -------------------------
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'full_name', 'enrolled_class', 'gender']


# -------------------------
# CBC Structure
# -------------------------
class StrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strand
        fields = "__all__"


class SubStrandSerializer(serializers.ModelSerializer):
    strand_name = serializers.CharField(source="strand.name", read_only=True)

    class Meta:
        model = SubStrand
        fields = ["id", "strand", "strand_name", "name"]


# -------------------------
# Lessons & Questions
# -------------------------
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = Assignment
        fields = ["id", "lesson", "lesson_title", "title", "instructions", "due_date"]
        read_only_fields = ["lesson_title"]


class LessonSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    strand_name = serializers.CharField(source="strand.name", read_only=True)
    sub_strand_name = serializers.CharField(source="sub_strand.name", read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id", "class_name", "description", "date", "strand", "strand_name",
            "sub_strand", "sub_strand_name", "title", "objective", "content",
            "is_active", "questions"
        ]


# -------------------------
# Submissions
# -------------------------
class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = ["score", "total", "graded_by"]


# -------------------------
# Progress
# -------------------------
class ProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = Progress
        fields = "__all__"


# -------------------------
# Tests & Results
# -------------------------
class TestSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)

    class Meta:
        model = Test
        fields = "__all__"


class ResultSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source="test.title", read_only=True)

    class Meta:
        model = Result
        fields = "__all__"


# -------------------------
# Attendance
# -------------------------
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "student", "student_name", "teacher", "date", "status", "notes"]
        read_only_fields = ["teacher"]


# -------------------------
# Lesson Plans
# -------------------------
class LessonPlanSerializer(serializers.ModelSerializer):
    teacher_email = serializers.CharField(source="teacher.email", read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)  # Nested assignments

    class Meta:
        model = LessonPlan
        fields = [
            "id", "teacher", "teacher_email", "strand", "sub_strand",
            "general_outcome", "specific_outcome1", "specific_outcome2",
            "specific_outcome3", "enquiry_question", "introduction",
            "lesson_development", "conclusion", "reflection", "assignment",
            "created_at", "assignments"
        ]
        read_only_fields = ['teacher', 'created_at']
