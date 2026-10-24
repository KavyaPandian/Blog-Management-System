"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toast: showToast,
        success: (msg) => showToast(msg, "success"),
        error: (msg) => showToast(msg, "error"),
        info: (msg) => showToast(msg, "info"),
      }}
    >
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: "400px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-in"
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 1.15rem",
              borderRadius: "var(--radius-md)",
              backdropFilter: "blur(16px)",
              background:
                t.type === "success"
                  ? "rgba(16, 185, 129, 0.18)"
                  : t.type === "error"
                  ? "rgba(244, 63, 94, 0.18)"
                  : "rgba(99, 102, 241, 0.18)",
              border: `1px solid ${
                t.type === "success"
                  ? "rgba(16, 185, 129, 0.4)"
                  : t.type === "error"
                  ? "rgba(244, 63, 94, 0.4)"
                  : "rgba(99, 102, 241, 0.4)"
              }`,
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            {t.type === "success" && <CheckCircle2 size={18} color="#34d399" />}
            {t.type === "error" && <AlertCircle size={18} color="#fb7185" />}
            {t.type === "info" && <Info size={18} color="#818cf8" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
