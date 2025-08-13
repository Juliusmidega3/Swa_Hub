from django.contrib import admin
from .models import Profile, Strand, SubStrand, Lesson, Question, Assignment, Submission, Progress

admin.site.register(Profile)
admin.site.register(Strand)
admin.site.register(SubStrand)
admin.site.register(Lesson)
admin.site.register(Question)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(Progress)
