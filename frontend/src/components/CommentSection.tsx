"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Comment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { MessageSquare, Send, Trash2, Clock, User as UserIcon } from "lucide-react";

interface CommentSectionProps {
  postId: number;
  initialCommentsCount: number;
  onCommentsCountChange?: (newCount: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialCommentsCount,
  onCommentsCountChange,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.getComments(postId);
      const list = Array.isArray(res) ? res : res.results || [];
      setComments(list);
      if (onCommentsCountChange) onCommentsCountChange(list.length);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isAuthenticated) {
      error("Please log in to add a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await api.addComment(postId, content.trim());
      const updated = [newComment, ...comments];
      setComments(updated);
      setContent("");
      success("Comment posted.");
      if (onCommentsCountChange) onCommentsCountChange(updated.length);
    } catch (err: any) {
      error(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await api.deleteComment(deleteTargetId);
      const updated = comments.filter((c) => c.id !== deleteTargetId);
      setComments(updated);
      success("Comment removed.");
      setDeleteTargetId(null);
      if (onCommentsCountChange) onCommentsCountChange(updated.length);
    } catch (err: any) {
      error(err.message || "Failed to delete comment.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="comments" style={{ marginTop: "3rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <MessageSquare size={18} color="#ffffff" />
        <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Discussion ({comments.length || initialCommentsCount})
        </h3>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <form
          onSubmit={handleAddComment}
          style={{
            padding: "1.25rem",
            backgroundColor: "#09090b",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div
              style={{
                width: "1.65rem",
                height: "1.65rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#18181b",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Commenting as <span style={{ color: "#ffffff" }}>{user?.username}</span>
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts or feedback..."
            rows={3}
            className="textarea-field"
            style={{ resize: "vertical", minHeight: "80px" }}
            required
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.75rem",
            }}
          >
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="btn btn-primary"
              style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
            >
              <Send size={13} />
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            marginBottom: "1.75rem",
            backgroundColor: "#09090b",
            border: "1px dashed var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            Sign in to join the conversation.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
            Sign in
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            padding: "2rem 1rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          No comments yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {comments.map((comment) => {
            const isOwner = user && user.id === comment.author?.id;
            const formattedDate = new Date(comment.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={comment.id}
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "#0c0c0e",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: "1.65rem",
                        height: "1.65rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "#18181b",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#ffffff",
                      }}
                    >
                      {comment.author?.username?.charAt(0).toUpperCase() || <UserIcon size={12} />}
                    </div>

                    <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#ffffff" }}>
                      {comment.author?.username || "Anonymous"}
                    </span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginLeft: "0.4rem",
                      }}
                    >
                      <Clock size={10} />
                      {formattedDate}
                    </span>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => setDeleteTargetId(comment.id)}
                      className="btn btn-ghost"
                      style={{ padding: "0.25rem 0.45rem" }}
                      title="Delete comment"
                    >
                      <Trash2 size={13} color="#f87171" />
                    </button>
                  )}
                </div>

                <p
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Comment"
        message="Are you sure you want to remove this comment?"
        isDeleting={isDeleting}
        onConfirm={handleDeleteComment}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
