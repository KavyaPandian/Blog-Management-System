"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { ArrowLeft, PenSquare, Send, CheckCircle2 } from "lucide-react";

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { success, error } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      error("You must be logged in to create a post.");
      router.push("/login?redirect=/posts/create");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        const list = Array.isArray(res) ? res : res.results || [];
        setCategories(list);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    };
    fetchCategories();
  }, []);

  const titleValid = title.trim().length >= 5;
  const contentValid = content.trim().length >= 20;
  const differentValid = title.trim().toLowerCase() !== content.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleValid) {
      error("Title must be at least 5 characters.");
      return;
    }

    if (!contentValid) {
      error("Content must be at least 20 characters.");
      return;
    }

    if (!differentValid) {
      error("Title and content cannot be identical.");
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await api.createPost({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId === "" ? null : Number(categoryId),
      });

      success("Post created successfully.");
      router.push(`/posts/${newPost.id}`);
    } catch (err: any) {
      error(err.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "760px", paddingTop: "2.5rem", paddingBottom: "5rem" }}>
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

      <div
        style={{
          padding: "2.25rem",
          backgroundColor: "#09090b",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.75rem" }}>
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
            }}
          >
            <PenSquare size={16} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.025em" }}>
              Create Article
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Publish your ideas with the community.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Post Title */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Title</label>
              <span style={{ fontSize: "0.75rem", color: titleValid ? "#ffffff" : "var(--text-muted)" }}>
                {title.trim().length}/5 chars min
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building Scalable Web APIs"
              className={`input-field ${title.length > 0 && !titleValid ? "input-error" : ""}`}
              required
            />
          </div>

          {/* Category Dropdown */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
              className="select-field"
            >
              <option value="">No Category (General)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Post Content */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Content</label>
              <span style={{ fontSize: "0.75rem", color: contentValid ? "#ffffff" : "var(--text-muted)" }}>
                {content.trim().length}/20 chars min
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article body..."
              rows={12}
              className={`textarea-field ${content.length > 0 && !contentValid ? "input-error" : ""}`}
              required
            />
          </div>

          {/* Validation Checklist */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#0c0c0e",
              border: "1px solid var(--border-subtle)",
              marginBottom: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              fontSize: "0.8rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: titleValid ? "#ffffff" : "var(--text-muted)",
              }}
            >
              <CheckCircle2 size={13} /> Title has at least 5 characters
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: contentValid ? "#ffffff" : "var(--text-muted)",
              }}
            >
              <CheckCircle2 size={13} /> Content has at least 20 characters
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: differentValid ? "#ffffff" : "var(--text-muted)",
              }}
            >
              <CheckCircle2 size={13} /> Title and content are distinct
            </span>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <Link href="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !titleValid || !contentValid || !differentValid}
              className="btn btn-primary"
              style={{ padding: "0.65rem 1.5rem" }}
            >
              <Send size={14} />
              {submitting ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
