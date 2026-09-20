import React, { useState } from "react";
import "./DashboardNEW.css";
import { ingestRepository, askAgent, type Source } from "./api";

type IngestState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "ok"; repository: string }
  | { kind: "err"; message: string };

type ChatMessage =
  | { role: "user"; id: string; text: string }
  | { role: "assistant"; id: string; answer: string; sources: Source[] }
  | { role: "assistant-error"; id: string; message: string };

function uid() {
  return Math.random().toString(36).slice(2);
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <g transform="rotate(-30 12 12)">
        <circle cx="7.3" cy="3.2" r="1.45" />
        <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <circle cx="16.7" cy="20.8" r="1.45" />
      </g>
    </svg>
  );
}

export default function Dashboard({
  userLabel,
  onSignOut,
  onBackToSite,
}: {
  userLabel?: string;
  onSignOut: () => void;
  onBackToSite: () => void;
}) {
  const [repository, setRepository] = useState("");
  const [ingestState, setIngestState] = useState<IngestState>({ kind: "idle" });
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    const repo = repository.trim();
    if (!repo) return;
    setIngestState({ kind: "pending" });
    try {
      const res = await ingestRepository(repo);
      setIngestState({ kind: "ok", repository: res.repository });
    } catch (err) {
      setIngestState({ kind: "err", message: err instanceof Error ? err.message : "Ingestion failed" });
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const repo = repository.trim();
    const q = question.trim();
    if (!repo || !q || asking) return;

    setMessages((m) => [...m, { role: "user", id: uid(), text: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await askAgent(repo, q);
      setMessages((m) => [...m, { role: "assistant", id: uid(), answer: res.answer, sources: res.sources }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant-error",
          id: uid(),
          message: err instanceof Error ? err.message : "Something went wrong asking that.",
        },
      ]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="dash">
      <header className="dash-header">
        <button className="dash-brand" onClick={onBackToSite} type="button">
          <LogoMark />
          <span>
            CodeAtlas<span className="suffix">.ai</span>
          </span>
        </button>
        <div className="dash-user">
          {userLabel && <span>{userLabel}</span>}
          <button className="dash-link-btn" onClick={onBackToSite} type="button">
            Back to site
          </button>
          <button className="dash-link-btn" onClick={onSignOut} type="button">
            Sign out
          </button>
        </div>
      </header>

      <div className="dash-body">
        <aside className="dash-sidebar">
          <form onSubmit={handleIngest} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label className="dash-field-label" htmlFor="repo-input">
              GitHub repository
            </label>
            <input
              id="repo-input"
              className="dash-input"
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              required
            />
            <button className="dash-btn" type="submit" disabled={ingestState.kind === "pending" || !repository.trim()}>
              {ingestState.kind === "pending" ? "Ingesting…" : "Ingest repository"}
            </button>

            {ingestState.kind === "ok" && (
              <div className="dash-status ok">Ingested {ingestState.repository}. You can ask questions now.</div>
            )}
            {ingestState.kind === "err" && <div className="dash-status err">{ingestState.message}</div>}
            {ingestState.kind === "pending" && (
              <div className="dash-status pending">Cloning and embedding the repository — this can take a bit for larger codebases.</div>
            )}
          </form>

          <p className="dash-hint">
            Ingest a repository once, then ask questions about it below. Re-ingesting the same URL is safe to skip once
            it's already been processed.
          </p>
        </aside>

        <main className="dash-main">
          <div className="dash-messages">
            {messages.length === 0 && (
              <p className="dash-empty">
                Enter a repository on the left, ingest it, then ask a question about the codebase — answers cite the
                exact source chunks they're drawn from.
              </p>
            )}
            {messages.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="msg msg-user">
                    {m.text}
                  </div>
                );
              }
              if (m.role === "assistant-error") {
                return (
                  <div key={m.id} className="msg msg-assistant">
                    <div className="msg-error">{m.message}</div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="msg msg-assistant">
                  <div className="msg-answer">{m.answer}</div>
                  {m.sources.length > 0 && (
                    <details className="msg-sources">
                      <summary>
                        {m.sources.length} source{m.sources.length === 1 ? "" : "s"}
                      </summary>
                      {m.sources.map((s) => (
                        <div className="source-item" key={s.chunkId}>
                          <div className="source-meta">
                            <span>chunk #{s.chunkId} · position {s.position}</span>
                            <span>{Math.round(s.similarity * 100)}% match</span>
                          </div>
                          <div className="source-preview">{s.preview}</div>
                        </div>
                      ))}
                    </details>
                  )}
                </div>
              );
            })}
          </div>

          <form className="dash-composer" onSubmit={handleAsk}>
            <input
              className="dash-input"
              type="text"
              placeholder={repository.trim() ? "Ask something about this repository…" : "Enter a repository above first"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!repository.trim() || asking}
            />
            <button className="dash-btn" type="submit" disabled={!repository.trim() || !question.trim() || asking}>
              {asking ? "Asking…" : "Ask"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
