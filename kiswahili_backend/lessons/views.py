from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.utils import timezone

from .models import (
    Strand, SubStrand, Lesson, LessonPlan, Question, Assignment,
    Submission, Progress, Test, Result, Attendance, Student
)
from .serializers import (
    StrandSerializer, SubStrandSerializer, LessonSerializer, LessonPlanSerializer,
    QuestionSerializer, AssignmentSerializer, SubmissionSerializer, ProgressSerializer,
    UserSerializer, TestSerializer, ResultSerializer, AttendanceSerializer, StudentSerializer
)
from .permissions import IsTeacher
from .forms import LessonForm


# -------------------------
# Students
# -------------------------
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("full_name")
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]


# -------------------------
# Strands & SubStrands
# -------------------------
class StrandViewSet(viewsets.ModelViewSet):
    queryset = Strand.objects.all()
    serializer_class = StrandSerializer
    permission_classes = [IsAuthenticated]


class SubStrandViewSet(viewsets.ModelViewSet):
    queryset = SubStrand.objects.all()
    serializer_class = SubStrandSerializer
    permission_classes = [IsAuthenticated]


# -------------------------
# Lessons
# -------------------------
class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related("strand", "sub_strand").all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pp2")
    def pp2_lessons(self, request):
        qs = self.get_queryset().filter(strand__grade="PP2", is_active=True)
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)


# -------------------------
# Questions
# -------------------------
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsTeacher]


# -------------------------
# Assignments
# -------------------------
class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student'):
            return Assignment.objects.filter(lesson__class_name=user.student.enrolled_class)
        return Assignment.objects.all()

    def perform_create(self, serializer):
        serializer.save()


# -------------------------
# Submissions
# -------------------------
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related("student", "lesson").all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        submission = serializer.save(student=self.request.user)
        total, score = 0, 0
        answers = submission.answers or {}

        for q in submission.lesson.questions.all().order_by("order"):
            total += q.marks
            if str(q.id) not in answers:
                continue
            if q.qtype == "mcq":
                if answers[str(q.id)] == q.data.get("answer"):
                    score += q.marks
            elif q.qtype == "fill":
                correct = (q.data.get("answer") or "").strip().lower()
                given = (answers[str(q.id)] or "").strip().lower()
                if given == correct:
                    score += q.marks

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


# -------------------------
# Progress
# -------------------------
class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]


# -------------------------
# Me (profile endpoint)
# -------------------------
class MeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response(UserSerializer(request.user).data)


# -------------------------
# Dashboard Data
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    return Response({
        "lessonsCount": Lesson.objects.filter(is_active=True).count(),
        "testsCount": Question.objects.count(),
        "teachersCount": User.objects.filter(profile__role="teacher").count(),
    })


def add_lesson(request):
    if request.method == 'POST':
        form = LessonForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lesson_list')
    else:
        form = LessonForm()
    return render(request, 'lessons/add_lesson.html', {'form': form})


# -------------------------
# Results
# -------------------------
class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pp2")
    def pp2_results(self, request):
        qs = self.get_queryset().filter(test__lesson__strand__grade="PP2")
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)


# -------------------------
# Tests
# -------------------------
class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pp2")
    def pp2_tests(self, request):
        qs = self.get_queryset().filter(lesson__strand__grade="PP2")
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)


# -------------------------
# Dashboard Stats
# -------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response({
        "total": {
            "lessons_count": Lesson.objects.count(),
            "tests_count": Test.objects.count(),
            "results_count": Result.objects.count()
        },
        "pp2": {
            "lessons_count": Lesson.objects.filter(strand__grade="PP2").count(),
            "tests_count": Test.objects.filter(lesson__strand__grade="PP2").count(),
            "results_count": Result.objects.filter(test__lesson__strand__grade="PP2").count()
        }
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_dashboard_stats(request):
    lessons_count = Lesson.objects.filter(is_active=True).count()
    tests_count = Test.objects.count()
    results_count = Result.objects.count()

    recent_lessons = Lesson.objects.filter(is_active=True).order_by("-date")[:5]
    recent_tests = Test.objects.order_by("-date")[:5]
    recent_results = Result.objects.select_related("test", "test__lesson").order_by("-created_at")[:5]

    return Response({
        "lessons_count": lessons_count,
        "tests_count": tests_count,
        "results_count": results_count,
        "recent_lessons": [{"id": l.id, "title": l.title, "date": l.date} for l in recent_lessons],
        "recent_tests": [{"id": t.id, "title": t.title, "lesson": t.lesson.title, "date": t.date} for t in recent_tests],
        "recent_results": [{"id": r.id, "student_name": r.student_name, "test": r.test.title, "score": r.score} for r in recent_results]
    })


# -------------------------
# Attendance
# -------------------------
class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "teacher"):
            return Attendance.objects.filter(student__enrolled_class=user.teacher.class_assigned).order_by("-date")
        return Attendance.objects.all().order_by("-date")

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    @action(detail=False, methods=["get"])
    def today(self, request):
        today = timezone.localdate()
        qs = self.get_queryset().filter(date=today).order_by("student__full_name")
        return Response(self.get_serializer(qs, many=True).data)


# -------------------------
# Lesson Plans
# -------------------------
class LessonPlanViewSet(viewsets.ModelViewSet):
    serializer_class = LessonPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LessonPlan.objects.filter(teacher=self.request.user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
