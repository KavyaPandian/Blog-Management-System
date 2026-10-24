"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Category, Post } from "@/types";
import { api } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { CategoryPills } from "@/components/CategoryPills";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [ordering, setOrdering] = useState("-created_at");
  const [loading, setLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        const list = Array.isArray(res) ? res : res.results || [];
        setCategories(list);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    };
    fetchCats();
  }, []);

  // Load Posts when filters change
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPosts({
        page: currentPage,
        search: debouncedSearch,
        category: selectedCategory ?? undefined,
        ordering,
      });

      if (data && data.results) {
        setPosts(data.results);
        setTotalCount(data.count || data.results.length);
        setTotalPages(Math.ceil((data.count || data.results.length) / 10) || 1);
      } else if (Array.isArray(data)) {
        setPosts(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (e) {
      console.error("Failed to load posts", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategory, ordering]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
      {/* Hero Banner Section - Minimalist Black & White */}
      <section
        style={{
          padding: "3.5rem 2rem",
          marginBottom: "3rem",
          backgroundColor: "#09090b",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ maxWidth: "700px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              fontWeight: 500,
              marginBottom: "1.25rem",
            }}
          >
            Engineering & Technology Notes
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: "1rem",
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Insights & Ideas for{" "}
            <span style={{ color: "var(--text-secondary)" }}>Modern Developers</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "1.75rem",
              maxWidth: "580px",
            }}
          >
            A minimal, distraction-free space for technical tutorials, engineering reflections,
            and software architecture.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/posts/create" className="btn btn-primary">
              <PenSquare size={15} />
              Publish an Article
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              <TrendingUp size={15} />
              Platform Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Top Row: Search Input + Ordering Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {/* Search Field */}
            <div
              style={{
                position: "relative",
                flex: "1 1 320px",
                maxWidth: "480px",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="input-field"
                style={{ paddingLeft: "2.4rem" }}
              />
            </div>

            {/* Sort Dropdown */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                <SlidersHorizontal size={13} />
                Sort:
              </span>
              <select
                value={ordering}
                onChange={(e) => {
                  setOrdering(e.target.value);
                  setCurrentPage(1);
                }}
                className="select-field"
                style={{ width: "auto", padding: "0.55rem 0.85rem", fontSize: "0.85rem" }}
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Categories Pill Bar */}
          <CategoryPills
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              setCurrentPage(1);
            }}
          />
        </div>
      </section>

      {/* Posts Count Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
          {totalCount} {totalCount === 1 ? "article" : "articles"}
        </span>
      </div>

      {/* Main Content Feed */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-panel"
              style={{
                height: "240px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Loading...
              </span>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            maxWidth: "460px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#18181b",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <FileText size={20} color="var(--text-secondary)" />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.4rem" }}>
            No articles found
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            {searchQuery
              ? `No articles matched "${searchQuery}".`
              : selectedCategory
              ? "No articles in this category."
              : "No articles published yet."}
          </p>
          <Link href="/posts/create" className="btn btn-primary">
            <PenSquare size={15} />
            Write the First Post
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginTop: "3rem",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <ChevronLeft size={15} />
            Previous
          </button>

          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: "0.45rem 0.75rem" }}
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
