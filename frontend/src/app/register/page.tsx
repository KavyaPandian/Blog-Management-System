"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { UserPlus, Eye, EyeOff, Terminal, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [redirectUrl, setRedirectUrl] = useState("/");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) setRedirectUrl(redirect);
    }
  }, []);

  const passwordMatch = password.length > 0 && password === confirmPassword;
  const passwordLengthValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      error("Username is required.");
      return;
    }

    if (!passwordLengthValid) {
      error("Password must be at least 6 characters long.");
      return;
    }

    if (!passwordMatch) {
      error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim() || undefined,
        password,
      });

      success("Registration successful.");
      router.push(redirectUrl);
    } catch (err: any) {
      error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 12rem)",
        paddingTop: "2rem",
        paddingBottom: "4rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.25rem 2rem",
          backgroundColor: "#09090b",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div
            style={{
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.85rem",
            }}
          >
            <Terminal size={18} color="#000000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", letterSpacing: "-0.025em" }}>
            Create Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Start publishing and engaging with the community.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input-field"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose password"
                className="input-field"
                style={{ paddingRight: "2.5rem" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`input-field ${
                confirmPassword.length > 0 && !passwordMatch ? "input-error" : ""
              }`}
              required
            />
          </div>

          {password.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                fontSize: "0.785rem",
                marginBottom: "0.85rem",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: passwordLengthValid ? "#ffffff" : "var(--text-muted)",
                }}
              >
                <CheckCircle2 size={12} /> At least 6 characters
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: passwordMatch ? "#ffffff" : "var(--text-muted)",
                }}
              >
                <CheckCircle2 size={12} /> Passwords match
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordMatch || !passwordLengthValid}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.75rem", padding: "0.7rem 1rem" }}
          >
            <UserPlus size={15} />
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-subtle)",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link
            href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            style={{
              color: "#ffffff",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            Sign in
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
