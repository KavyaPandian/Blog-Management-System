"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  PenSquare,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  BookOpen,
  Menu,
  X,
  Terminal,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#000000",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "border-color 0.2s ease",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4rem",
        }}
      >
        {/* Brand Logo - Minimalist Monochrome */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Terminal size={15} color="#000000" strokeWidth={2.5} />
          </div>
          <div>
            <span
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              DevBlog
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "1.5rem",
          }}
          className="desktop-nav"
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: isActive("/") ? "#ffffff" : "var(--text-secondary)",
              transition: "color 0.15s",
            }}
          >
            <BookOpen size={15} />
            Articles
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: isActive("/dashboard") ? "#ffffff" : "var(--text-secondary)",
                transition: "color 0.15s",
              }}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Controls & User Auth */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: "0.75rem",
          }}
          className="desktop-actions"
        >
          {isAuthenticated ? (
            <>
              <Link href="/posts/create" className="btn btn-primary" style={{ padding: "0.5rem 0.95rem" }}>
                <PenSquare size={14} />
                Write
              </Link>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  paddingLeft: "0.5rem",
                  borderLeft: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "1.85rem",
                      height: "1.85rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "#18181b",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: "#ffffff",
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ padding: "0.4rem 0.6rem" }}
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link href="/login" className="btn btn-secondary" style={{ padding: "0.45rem 0.85rem" }}>
                <LogIn size={14} />
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.45rem 0.85rem" }}>
                <UserPlus size={14} />
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-ghost mobile-menu-btn"
          style={{ padding: "0.45rem" }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: "#09090b",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.5rem 0",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: isActive("/") ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            <BookOpen size={16} />
            Articles
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem 0",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  color: isActive("/dashboard") ? "#ffffff" : "var(--text-secondary)",
                }}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                href="/posts/create"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                <PenSquare size={15} />
                Write New Post
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary"
                style={{ width: "100%" }}
              >
                <LogOut size={15} />
                Logout ({user?.username})
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: "100%" }}
              >
                <LogIn size={15} />
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                <UserPlus size={15} />
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-actions {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
