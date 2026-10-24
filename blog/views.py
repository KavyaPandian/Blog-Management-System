from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User

from .models import Post, Category, Comment, Like
from .serializers import (
    PostSerializer,
    CategorySerializer,
    RegisterSerializer,
    CommentSerializer,
)
from .permissions import IsAuthorOrReadOnly, IsCommentOwnerOrReadOnly


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_posts = Post.objects.count()
        total_comments = Comment.objects.count()
        total_likes = Like.objects.count()
        my_posts = Post.objects.filter(author=request.user).count()
        my_comments = Comment.objects.filter(author=request.user).count()

        return Response({
            "total_post": total_posts,
            "total_posts": total_posts,
            "total_comments": total_comments,
            "total_likes": total_likes,
            "my_posts": my_posts,
            "my_comments": my_comments,
        })


class Registerview(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related("author", "category").all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthorOrReadOnly]

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
    ]
    search_fields = ["title", "content"]
    filterset_fields = ["category", "author"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"], url_path="like", permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(
            post=post,
            user=request.user
        )

        if not created:
            return Response(
                {"message": "You already liked this post."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {"message": "Post liked.", "likes_count": post.likes.count()},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], url_path="unlike", permission_classes=[IsAuthenticated])
    def unlike(self, request, pk=None):
        post = self.get_object()
        like = Like.objects.filter(
            post=post,
            user=request.user
        ).first()

        if not like:
            return Response(
                {"message": "You have not liked this post."},
                status=status.HTTP_400_BAD_REQUEST
            )

        like.delete()
        return Response(
            {"message": "Post unliked.", "likes_count": post.likes.count()},
            status=status.HTTP_200_OK
        )


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsCommentOwnerOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs.get("post_id")
        if post_id:
            return Comment.objects.filter(post_id=post_id).select_related("author")
        return Comment.objects.all().select_related("author")

    def perform_create(self, serializer):
        post_id = self.kwargs.get("post_id")
        post = get_object_or_404(Post, pk=post_id)
        serializer.save(
            author=self.request.user,
            post=post
        )
        
        
        
