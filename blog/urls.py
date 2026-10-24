from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path
from .views import DashboardView

router = DefaultRouter()
router.register("posts", PostViewSet, basename="post")
router.register("categories", CategoryViewSet, basename="category")

comment_list = CommentViewSet.as_view({
    "get": "list",
    "post": "create",
})
comment_detail = CommentViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

urlpatterns = [
    path("auth/register/", Registerview.as_view(), name="register"),
    path("posts/<int:post_id>/comments/", comment_list, name="post-comments"),
    path("comments/<int:pk>/", comment_detail, name="comment-detail"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
urlpatterns += router.urls
