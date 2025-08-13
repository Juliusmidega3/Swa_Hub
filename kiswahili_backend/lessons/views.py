from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Strand, SubStrand, Lesson, Question, Assignment, Submission, Progress
from .serializers import (
    StrandSerializer, SubStrandSerializer, LessonSerializer, QuestionSerializer,
    AssignmentSerializer, SubmissionSerializer, ProgressSerializer, UserSerializer
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
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

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
