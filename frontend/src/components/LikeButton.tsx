"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";

interface LikeButtonProps {
  postId: number;
  initialLikesCount: number;
  size?: "sm" | "md" | "lg";
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikesCount,
  size = "md",
}) => {
  const { isAuthenticated } = useAuth();
  const { error, success } = useToast();
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      error("Please log in to like this post.");
      return;
    }

    if (loading) return;

    setLoading(true);

    const willLike = !isLiked;
    setIsLiked(willLike);
    setLikesCount((prev) => (willLike ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (willLike) {
        const res = await api.likePost(postId);
        if (typeof res.likes_count === "number") {
          setLikesCount(res.likes_count);
        }
        success("Liked post.");
      } else {
        const res = await api.unlikePost(postId);
        if (typeof res.likes_count === "number") {
          setLikesCount(res.likes_count);
        }
      }
    } catch (err: any) {
      setIsLiked(!willLike);
      setLikesCount((prev) => (willLike ? Math.max(0, prev - 1) : prev + 1));
      error(err.message || "Failed to update like status.");
    } finally {
      setLoading(false);
    }
  };

  const iconSizes = { sm: 14, md: 16, lg: 18 };
  const fontSizes = { sm: "0.8rem", md: "0.85rem", lg: "0.9rem" };
  const paddings = {
    sm: "0.3rem 0.6rem",
    md: "0.45rem 0.8rem",
    lg: "0.55rem 1rem",
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: paddings[size],
        borderRadius: "var(--radius-sm)",
        border: isLiked
          ? "1px solid #52525b"
          : "1px solid var(--border-subtle)",
        backgroundColor: isLiked ? "#18181b" : "transparent",
        color: isLiked ? "#ffffff" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontSize: fontSizes[size],
        fontWeight: 500,
        boxShadow: "none",
      }}
      title={isLiked ? "Unlike" : "Like"}
    >
      <Heart
        size={iconSizes[size]}
        fill={isLiked ? "#ffffff" : "none"}
        color={isLiked ? "#ffffff" : "currentColor"}
      />
      <span>{likesCount}</span>
    </button>
  );
};
