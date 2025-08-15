from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from .forms import LessonForm
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Strand, SubStrand, Lesson, Question, Assignment, Submission, Progress, Test, Result
from .serializers import (
    StrandSerializer, SubStrandSerializer, LessonSerializer, QuestionSerializer,
    AssignmentSerializer, SubmissionSerializer, ProgressSerializer, UserSerializer, TestSerializer, ResultSerializer
)
from .permissions import IsTeacher, IsStudent

class StrandViewSet(viewsets.ModelViewSet):
    queryset = Strand.objects.all()
    serializer_class = StrandSerializer
    permission_classes = [IsAuthenticated]

class SubStrandViewSet(viewsets.ModelViewSet):
    queryset = SubStrand.objects.all()
    serializer_class = SubStrandSerializer
    permission_classes = [IsAuthenticated]

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related("strand","sub_strand").all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pp2")
    def pp2_lessons(self, request):
        qs = self.get_queryset().filter(strand__grade="PP2", is_active=True)
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # If the user is a student
        if hasattr(user, 'student'):
            student_class = user.student.enrolled_class
            return Assignment.objects.filter(class_assigned=student_class)

        # If the user is a teacher, show only their class's assignments
        elif hasattr(user, 'teacher'):
            return Assignment.objects.filter(class_assigned=user.teacher.class_assigned)

        # If admin/staff, show all
        return Assignment.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        # Teacher can only create for their assigned class
        if hasattr(user, 'teacher'):
            serializer.save(class_assigned=user.teacher.class_assigned)
        else:
            serializer.save()


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related("student","lesson").all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Auto-mark MCQs; others left for teacher
        submission = serializer.save(student=self.request.user)
        total = 0
        score = 0
        answers = submission.answers or {}
        for q in submission.lesson.questions.all().order_by("order"):
            total += q.marks
            if str(q.id) not in answers:
                continue
            if q.qtype == "mcq":
                correct = q.data.get("answer")
                if answers[str(q.id)] == correct:
                    score += q.marks
            elif q.qtype == "fill":
                correct = (q.data.get("answer") or "").strip().lower()
                given = (answers[str(q.id)] or "").strip().lower()
                if given == correct:
                    score += q.marks
            # match/oral/upload are teacher-graded
        submission.total = total
        submission.score = score
        submission.save()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsTeacher])
    def grade(self, request, pk=None):
        sub = self.get_object()
        add_score = float(request.data.get("extra_score", 0))
        feedback = request.data.get("feedback", "")
        sub.score = min(sub.total, sub.score + add_score)
        sub.feedback = feedback
        sub.graded_by = request.user
        sub.save()
        return Response(SubmissionSerializer(sub).data)

class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

class MeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    lessons_count = Lesson.objects.filter(is_active=True).count()
    tests_count = Question.objects.count()  # All questions considered as tests
    teachers_count = User.objects.filter(profile__role="teacher").count()

    return Response({
        "lessonsCount": lessons_count,
        "testsCount": tests_count,
        "teachersCount": teachers_count
    })


def add_lesson(request):
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lesson_list')  # Change to your lesson list URL name
    else:
        form = LessonForm()
    return render(request, 'lessons/add_lesson.html', {'form': form})


# Test ViewSet
class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]


# Result ViewSet
class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]


# Dashboard stats
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response({
        "lessons_count": Lesson.objects.count(),
        "tests_count": Test.objects.count(),
        "results_count": Result.objects.count()
    })
