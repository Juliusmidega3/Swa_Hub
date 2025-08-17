from django.contrib import admin
from .models import Profile, Strand, LessonPlan, SubStrand, Lesson, Question, Assignment, Submission, Progress, Test, Result, Attendance, Student

admin.site.register(Profile)
admin.site.register(Strand)
admin.site.register(SubStrand)
admin.site.register(Lesson)
admin.site.register(Question)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(Progress)
admin.site.register(Test)
admin.site.register(Result)
admin.site.register(Attendance)
admin.site.register(Student)
admin.site.register(LessonPlan)
