from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # This connects your prioritization logic to the 'api/' address
    path('api/', include('prioritization.urls')),
]