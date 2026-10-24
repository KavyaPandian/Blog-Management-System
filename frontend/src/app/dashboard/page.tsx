"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardData, Post } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import {
  FileText,
  MessageSquare,
  Heart,
  PenSquare,
  ExternalLink,
  Edit3,
  Trash2,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load Dashboard Stats & My Posts
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [dashStats, postsData] = await Promise.all([
          api.getDashboard(),
          api.getPosts({ author: user.id }),
        ]);

        setStats(dashStats);
        const list = Array.isArray(postsData) ? postsData : postsData.results || [];
        setMyPosts(list);
      } catch (err: any) {
        error(err.message || "Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleDeletePost = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await api.deletePost(deleteTargetId);
      setMyPosts((prev) => prev.filter((p) => p.id !== deleteTargetId));
      if (stats) {
        setStats({
          ...stats,
          my_posts: Math.max(0, stats.my_posts - 1),
          total_posts: Math.max(0, stats.total_posts - 1),
        });
      }
      success("Article deleted.");
      setDeleteTargetId(null);
    } catch (err: any) {
      error(err.message || "Failed to delete article.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      {/* Welcome Banner - Minimalist */}
      <div
        style={{
          padding: "2rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
          backgroundColor: "#09090b",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 500,
              marginBottom: "0.6rem",
            }}
          >
            Dashboard
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.025em" }}>
            Welcome back, {user?.username}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Overview of your articles and platform activity.
          </p>
        </div>

        <Link href="/posts/create" className="btn btn-primary" style={{ padding: "0.65rem 1.25rem" }}>
          <PenSquare size={15} />
          Create Article
        </Link>
      </div>

      {/* Metrics Stat Cards Grid - Clean Monochrome */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* My Posts */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "#0c0c0e",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={18} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: "0.785rem", color: "var(--text-muted)", fontWeight: 500 }}>
              My Articles
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
              {stats?.my_posts ?? 0}
            </p>
          </div>
        </div>

        {/* My Comments */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "#0c0c0e",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageSquare size={18} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: "0.785rem", color: "var(--text-muted)", fontWeight: 500 }}>
              My Comments
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
              {stats?.my_comments ?? 0}
            </p>
          </div>
        </div>

        {/* Platform Total Posts */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "#0c0c0e",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={18} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: "0.785rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Platform Posts
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
              {stats?.total_posts ?? 0}
            </p>
          </div>
        </div>

        {/* Platform Total Likes */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            backgroundColor: "#0c0c0e",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={18} color="#ffffff" />
          </div>
          <div>
            <p style={{ fontSize: "0.785rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Total Likes
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
              {stats?.total_likes ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* My Articles Management Section */}
      <section
        style={{
          padding: "1.75rem",
          backgroundColor: "#09090b",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Your Published Articles</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {myPosts.length} total
          </span>
        </div>

        {myPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", color: "var(--text-muted)" }}>
            <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>You haven&apos;t written any articles yet.</p>
            <Link href="/posts/create" className="btn btn-primary">
              <PenSquare size={14} />
              Write your first article
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {myPosts.map((post) => {
              const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={post.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#0c0c0e",
                    border: "1px solid var(--border-subtle)",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ flex: "1 1 280px" }}>
                    <Link
                      href={`/posts/${post.id}`}
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      {post.title}
                      <ExternalLink size={13} color="var(--text-muted)" />
                    </Link>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginTop: "0.25rem",
                        fontSize: "0.785rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={11} />
                        {formattedDate}
                      </span>
                      <span>&bull;</span>
                      <span>{post.likes_count} likes</span>
                      <span>&bull;</span>
                      <span>{post.comments_count} comments</span>
                      {post.category && (
                        <>
                          <span>&bull;</span>
                          <span style={{ color: "var(--text-secondary)" }}>{post.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="btn btn-secondary"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.825rem" }}
                    >
                      <Edit3 size={13} />
                      Edit
                    </Link>

                    <button
                      onClick={() => setDeleteTargetId(post.id)}
                      className="btn btn-danger"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.825rem" }}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Article"
        message="Are you sure you want to permanently delete this article? This action cannot be reversed."
        isDeleting={isDeleting}
        onConfirm={handleDeletePost}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
