"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Post } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { LikeButton } from "@/components/LikeButton";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  Calendar,
  MessageSquare,
  Edit3,
  Trash2,
  Clock,
  ArrowUpRight,
  Tag,
} from "lucide-react";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user && user.id === post.author.id;

  const readingTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      success("Post deleted successfully.");
      setShowDeleteModal(false);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      error(err.message || "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article
        className="glass-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1.5rem",
          backgroundColor: "#0c0c0e",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          transition: "border-color 0.15s ease",
        }}
      >
        <div>
          {/* Header Metadata: Category + Reading Time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.85rem",
              gap: "0.5rem",
            }}
          >
            {post.category ? (
              <span className="badge">
                <Tag size={10} />
                {post.category.name}
              </span>
            ) : (
              <span className="badge">General</span>
            )}

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
              }}
            >
              <Clock size={11} />
              {readingTime} min read
            </span>
          </div>

          {/* Post Title */}
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              lineHeight: 1.35,
              marginBottom: "0.6rem",
              letterSpacing: "-0.02em",
            }}
          >
            <Link
              href={`/posts/${post.id}`}
              style={{
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "baseline",
                gap: "0.3rem",
              }}
            >
              {post.title}
              <ArrowUpRight size={14} style={{ opacity: 0.5 }} />
            </Link>
          </h2>

          {/* Post Excerpt */}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.885rem",
              lineHeight: 1.55,
              marginBottom: "1.25rem",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.content}
          </p>
        </div>

        <div>
          {/* Author & Date Details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-subtle)",
              marginBottom: "0.85rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#18181b",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "#ffffff",
                }}
              >
                {post.author.username.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.825rem", fontWeight: 500, color: "var(--text-primary)" }}>
                  {post.author.username}
                </span>
                <span
                  style={{
                    fontSize: "0.725rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <Calendar size={10} />
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Author Controls (Edit & Delete) */}
            {isAuthor && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="btn btn-ghost"
                  style={{ padding: "0.35rem 0.5rem" }}
                  title="Edit post"
                >
                  <Edit3 size={13} color="var(--text-secondary)" />
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-ghost"
                  style={{ padding: "0.35rem 0.5rem" }}
                  title="Delete post"
                >
                  <Trash2 size={13} color="#f87171" />
                </button>
              </div>
            )}
          </div>

          {/* Engagement Footer: Likes + Comments */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <LikeButton postId={post.id} initialLikesCount={post.likes_count} size="sm" />

            <Link
              href={`/posts/${post.id}#comments`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                padding: "0.3rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#09090b",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <MessageSquare size={13} />
              <span>{post.comments_count}</span>
            </Link>
          </div>
        </div>
      </article>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Article"
        message="Are you sure you want to permanently delete this post? This action cannot be reversed."
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};
