from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from lessons.views import (
    StrandViewSet,
    SubStrandViewSet,
    LessonViewSet,
    QuestionViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    ProgressViewSet,
    MeViewSet,
    dashboard_data,
    dashboard_stats,
    TestViewSet,
    ResultViewSet,
    AttendanceViewSet,
    StudentViewSet,
    today_attendance,  # direct import for custom attendance view
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# -----------------------------
# DRF router
# -----------------------------
router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="student")
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"strands", StrandViewSet, basename="strand")
router.register(r"substrands", SubStrandViewSet, basename="substrand")
router.register(r"lessons", LessonViewSet, basename="lesson")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"progress", ProgressViewSet, basename="progress")
router.register(r"tests", TestViewSet, basename="test")
router.register(r"results", ResultViewSet, basename="result")
router.register(r"me", MeViewSet, basename="me")

# -----------------------------
# URL patterns
# -----------------------------
urlpatterns = [
    path("admin/", admin.site.urls),
    

    # API routes from router
    path("api/", include(router.urls)),

    # Custom Attendance Today endpoint
    path("api/attendance/today/", today_attendance, name="today-attendance"),

    # JWT Authentication
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Dashboard endpoints
    path("api/dashboard-data/", dashboard_data, name="dashboard-data"),
    path("api/teacher/dashboard-stats/", dashboard_stats, name="teacher-dashboard-stats"),
]

# Serve media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
