from rest_framework.permissions import BasePermission

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request.user, "profile") and request.user.profile.role == "teacher")

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request.user, "profile") and request.user.profile.role == "student")
