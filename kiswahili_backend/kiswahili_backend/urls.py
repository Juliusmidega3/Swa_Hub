from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from lessons.views import (
    StrandViewSet, SubStrandViewSet, LessonViewSet, QuestionViewSet,
    AssignmentViewSet, SubmissionViewSet, ProgressViewSet, MeViewSet,
    dashboard_data  # <-- import the dashboard view
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r"strands", StrandViewSet, basename="strand")
router.register(r"substrands", SubStrandViewSet, basename="substrand")
router.register(r"lessons", LessonViewSet, basename="lesson")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"progress", ProgressViewSet, basename="progress")
router.register(r"me", MeViewSet, basename="me")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/dashboard-data/", dashboard_data, name="dashboard-data"),  # <-- add this
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
