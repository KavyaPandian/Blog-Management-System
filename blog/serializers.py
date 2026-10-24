from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"]
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True
    )
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "content",
            "author",
            "category",
            "category_id",
            "comments_count",
            "likes_count",
            "created_at",
            "updated_at"
        ]

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_likes_count(self, obj):
        return obj.likes.count()

    # Field-level validation    
    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Title must be at least 5 characters."
            )
        return value

    # Field-level validation
    def validate_content(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Content must be at least 20 characters."
            )
        return value

    # Object-level validation (safe for partial PATCH)
    def validate(self, data):
        title = data.get("title")
        content = data.get("content")

        if title is None and self.instance:
            title = self.instance.title
        if content is None and self.instance:
            content = self.instance.content

        if title and content and title.strip() == content.strip():
            raise serializers.ValidationError(
                "Title and content cannot be the same."
            )
        return data


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "content",
            "created_at",
        ]
        read_only_fields = [
            "post",
            "author",
            "created_at",
        ]
        
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = "__all__"
        read_only_fields = [
            "user"
        ]
        
