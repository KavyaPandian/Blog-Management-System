"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Category, Post } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { ArrowLeft, Edit3, Save, CheckCircle2 } from "lucide-react";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load post and categories
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [postData, catData] = await Promise.all([
          api.getPost(id),
          api.getCategories(),
        ]);

        setTitle(postData.title);
        setContent(postData.content);
        setCategoryId(postData.category ? postData.category.id : "");

        const catList = Array.isArray(catData) ? catData : catData.results || [];
        setCategories(catList);

        if (user && postData.author.id !== user.id) {
          error("You do not have permission to edit this post.");
          router.push(`/posts/${id}`);
        }
      } catch (err: any) {
        error(err.message || "Failed to load post data.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const titleValid = title.trim().length >= 5;
  const contentValid = content.trim().length >= 20;
  const differentValid = title.trim().toLowerCase() !== content.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleValid || !contentValid || !differentValid) {
      error("Please fix validation requirements before saving.");
      return;
    }

    setSubmitting(true);
    try {
      await api.updatePost(id, {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId === "" ? null : Number(categoryId),
      });

      success("Post updated successfully.");
      router.push(`/posts/${id}`);
    } catch (err: any) {
      error(err.message || "Failed to update post.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "760px", paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      <Link
        href={`/posts/${id}`}
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
        Back to article
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
            <Edit3 size={16} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.025em" }}>
              Edit Article
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Update your published content.
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
              className={`input-field ${!titleValid ? "input-error" : ""}`}
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
              rows={12}
              className={`textarea-field ${!contentValid ? "input-error" : ""}`}
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
            <Link href={`/posts/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !titleValid || !contentValid || !differentValid}
              className="btn btn-primary"
              style={{ padding: "0.65rem 1.5rem" }}
            >
              <Save size={14} />
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
