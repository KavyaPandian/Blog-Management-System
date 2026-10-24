"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Post } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Tag,
  Share2,
  Check,
} from "lucide-react";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await api.getPost(id);
        setPost(data);
      } catch (err: any) {
        error(err.message || "Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const isAuthor = user && post && user.id === post.author.id;

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      success("Article deleted successfully.");
      router.push("/");
    } catch (err: any) {
      error(err.message || "Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Article Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          The article you are looking for does not exist or may have been deleted.
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={15} />
          Return to Feed
        </Link>
      </div>
    );
  }

  const readingTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="container" style={{ maxWidth: "820px", paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Back button */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          fontWeight: 500,
          marginBottom: "1.75rem",
        }}
      >
        <ArrowLeft size={15} />
        Back to articles
      </Link>

      {/* Article Header Card */}
      <header
        style={{
          padding: "2rem",
          marginBottom: "2rem",
          backgroundColor: "#09090b",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {/* Category & Read Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {post.category ? (
            <span className="badge">
              <Tag size={11} />
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
              fontSize: "0.785rem",
              color: "var(--text-muted)",
            }}
          >
            <Clock size={11} />
            {readingTime} min read
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: "1.5rem",
            color: "#ffffff",
            letterSpacing: "-0.025em",
          }}
        >
          {post.title}
        </h1>

        {/* Author & Action Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#18181b",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#ffffff",
              }}
            >
              {post.author.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <p style={{ fontWeight: 600, fontSize: "0.925rem", color: "var(--text-primary)" }}>
                {post.author.username}
              </p>
              <p
                style={{
                  fontSize: "0.785rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Calendar size={11} />
                Published {formattedDate}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LikeButton postId={post.id} initialLikesCount={post.likes_count} size="md" />

            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem" }}
              title="Share Article"
            >
              {copied ? <Check size={14} color="#ffffff" /> : <Share2 size={14} />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>

            {/* Author Controls */}
            {isAuthor && (
              <>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="btn btn-secondary"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem" }}
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </Link>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger"
                  style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem" }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Article Body */}
      <article
        style={{
          padding: "2rem",
          backgroundColor: "#0c0c0e",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          lineHeight: 1.8,
          fontSize: "1rem",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
          {post.content}
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection
        postId={post.id}
        initialCommentsCount={post.comments_count}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be reversed."
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
