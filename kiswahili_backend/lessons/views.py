from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from .models import Attendance
from .forms import LessonForm
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Strand, SubStrand, Lesson, Question, Assignment, Submission, Progress, Test, Result, Attendance, Student
from .serializers import (
    StrandSerializer, SubStrandSerializer, LessonSerializer, QuestionSerializer,
    AssignmentSerializer, SubmissionSerializer, ProgressSerializer, UserSerializer, TestSerializer, ResultSerializer,  AttendanceSerializer, StudentSerializer
)
from .permissions import IsTeacher, IsStudent
from django.utils import timezone
from django.utils.timezone import now


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("full_name") # or 'id'
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

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



class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pp2")
    def pp2_results(self, request):
        # Filter results related to PP2 lessons
        qs = self.get_queryset().filter(test__lesson__strand__grade="PP2")
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pp2")
    def pp2_tests(self, request):
        # Filter by PP2 grade using lesson relationship
        qs = self.get_queryset().filter(lesson__strand__grade="PP2")
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True)
        return self.get_paginated_response(ser.data)



# Dashboard stats

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    # Total counts
    total_lessons = Lesson.objects.count()
    total_tests = Test.objects.count()
    total_results = Result.objects.count()

    # PP2-specific counts
    pp2_lessons = Lesson.objects.filter(strand__grade="PP2").count()
    pp2_tests = Test.objects.filter(lesson__strand__grade="PP2").count()
    pp2_results = Result.objects.filter(test__lesson__strand__grade="PP2").count()


    return Response({
        "total": {
            "lessons_count": total_lessons,
            "tests_count": total_tests,
            "results_count": total_results
        },
        "pp2": {
            "lessons_count": pp2_lessons,
            "tests_count": pp2_tests,
            "results_count": pp2_results
        }
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_dashboard_stats(request):
    """
    Returns counts and recent items for the teacher portal dashboard.
    """
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
        "recent_lessons": [
            {"id": l.id, "title": l.title, "date": l.date} for l in recent_lessons
        ],
        "recent_tests": [
            {"id": t.id, "title": t.title, "lesson": t.lesson.title, "date": t.date} for t in recent_tests
        ],
        "recent_results": [
            {"id": r.id, "student_name": r.student_name, "test": r.test.title, "score": r.score} for r in recent_results
        ]
    })


# Attendance ViewSet
# -----------------------------
class AttendanceViewSet(viewsets.ModelViewSet):
    """
    CRUD for Attendance
    Teachers see students in their class only
    Admin/staff see all
    """
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Teachers see students in their assigned class
        if hasattr(user, "teacher"):
            student_class = user.teacher.class_assigned
            return Attendance.objects.filter(student__enrolled_class=student_class).order_by("-date")
        # Admin/staff see all attendance records
        return Attendance.objects.all().order_by("-date")

    def perform_create(self, serializer):
        """
        Auto-assign the teacher creating the record
        """
        serializer.save(teacher=self.request.user)

    @action(detail=False, methods=["get"])
    def today(self, request):
        """
        Returns only today's attendance records
        """
        today = timezone.localdate()
        qs = self.get_queryset().filter(date=today).order_by("student__full_name")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
def today_attendance(request):
    from datetime import date
    today = date.today()
    attendance_list = Attendance.objects.filter(date=today)
    data = [{"student": att.student.name, "status": att.status} for att in attendance_list]
    return Response(data)