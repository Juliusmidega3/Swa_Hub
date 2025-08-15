from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Strand, SubStrand, Lesson, Question, Assignment, Submission, Progress, Test, Result

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = ["user", "role", "school"]

class StrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Strand
        fields = "__all__"

class SubStrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubStrand
        fields = "__all__"

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"

class LessonSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    strand_name = serializers.CharField(source="strand.name", read_only=True)
    sub_strand_name = serializers.CharField(source="sub_strand.name", read_only=True)
    class Meta:
        model = Lesson
        fields = ["id","strand","strand_name","sub_strand","sub_strand_name","title","objective","content","is_active","questions"]

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"
        read_only_fields = ['class_assigned']

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = ["score","total","graded_by"]

class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = "__all__"


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = "__all__"

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = "__all__"