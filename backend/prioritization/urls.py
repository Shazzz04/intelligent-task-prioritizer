from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

# The router automatically creates the API routes for us
router = DefaultRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
]