import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DevBlog | Minimalist Developer Publishing Platform",
  description:
    "A minimalist, distraction-free publishing platform powered by Django and Next.js.",
  keywords: ["engineering", "blog", "django", "next.js", "technology", "programming"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Navbar />

              <main style={{ flex: 1 }}>{children}</main>

              <footer
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  backgroundColor: "#000000",
                  padding: "2.5rem 1.5rem 2rem",
                  marginTop: "4rem",
                }}
              >
                <div
                  className="container"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    DevBlog
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.825rem", maxWidth: "440px" }}>
                    Minimalist publishing platform built with Next.js, Django REST Framework, and PostgreSQL.
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    &copy; {new Date().getFullYear()} DevBlog. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
