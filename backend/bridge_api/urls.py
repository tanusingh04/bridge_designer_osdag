from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, ValidateInputsView, CalculateGeometryView

router = DefaultRouter()
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('validate/', ValidateInputsView.as_view(), name='validate-inputs'),
    path('calculate/', CalculateGeometryView.as_view(), name='calculate-geometry'),
]

