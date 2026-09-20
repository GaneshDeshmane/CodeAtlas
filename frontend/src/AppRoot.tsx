import React, { useEffect, useState } from "react";
import CodeAtlasLanding from "./CodeAtlasLanding";
import Dashboard from "./Dashboard";
import { getMe, logout } from "./api";

type View = "landing" | "dashboard";

function extractLabel(user: Record<string, unknown> | null): string | undefined {
  if (!user) return undefined;
  const displayName = (user as any).displayName as string | undefined;
  const emails = (user as any).emails as Array<{ value?: string }> | undefined;
  return displayName || emails?.[0]?.value || undefined;
}

export default function AppRoot() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<View>("landing");

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        if (u) setView("dashboard");
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    await logout();
    setUser(null);
    setView("landing");
  }

  if (checkingSession) {
    return (
      <div
        style={{
          background: "#000",
          color: "#9a9a9a",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  if (view === "dashboard" && user) {
    return <Dashboard userLabel={extractLabel(user)} onSignOut={handleSignOut} onBackToSite={() => setView("landing")} />;
  }

  return (
    <CodeAtlasLanding
      signedIn={Boolean(user)}
      onPrimaryCta={user ? () => setView("dashboard") : undefined}
    />
  );
}
