import { useState, useEffect } from "react"

const API_BASE = "http://localhost:3001"

type Source = {
  chunkId: number
  position: number
  similarity: number
  preview: string
}

type AgentResponse = {
  answer?: string
  sources?: Source[]
  msg?: string
}

type User = {
  displayName?: string
  emails?: { value: string }[]
  [key: string]: unknown
}

type Status = "idle" | "ingesting" | "ingested" | "asking" | "error"

export function App() {
  const [repository, setRepository] = useState("")
  const [question, setQuestion] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<Source[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("not logged in")
        return res.json()
      })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false))
  }, [])

  function handleLogin() {
    window.location.href = `${API_BASE}/login`
  }

  function handleLogout() {
    window.location.href = `${API_BASE}/logout`
  }

  async function handleIngest() {
    if (!repository.trim()) return
    setStatus("ingesting")
    setErrorMsg("")
    try {
      const res = await fetch(`${API_BASE}/ingestion`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repository: repository.trim() }),
      })
      const data: AgentResponse = await res.json()
      if (!res.ok) {
        setErrorMsg(data.msg ?? "Ingestion failed")
        setStatus("error")
        return
      }
      setStatus("ingested")
    } catch {
      setErrorMsg("Could not reach the server. Is it running on port 3001?")
      setStatus("error")
    }
  }

  async function handleAsk() {
    if (!repository.trim() || !question.trim()) return
    setStatus("asking")
    setErrorMsg("")
    setAnswer("")
    setSources([])
    try {
      const res = await fetch(`${API_BASE}/agent`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repository: repository.trim(),
          question: question.trim(),
        }),
      })
      const data: AgentResponse = await res.json()
      if (!res.ok || !data.answer) {
        setErrorMsg(data.msg ?? "Something went wrong answering that.")
        setStatus("error")
        return
      }
      setAnswer(data.answer)
      setSources(data.sources ?? [])
      setStatus("idle")
    } catch {
      setErrorMsg("Could not reach the server. Is it running on port 3001?")
      setStatus("error")
    }
  }

  const busy = status === "ingesting" || status === "asking"

  return (
    <div className="page">
      <style>{css}</style>

      <header className="masthead">
        <div className="masthead-mark">Local-first RAG</div>
        <h1>CodeAtlas</h1>
        <p className="tagline">A map of a repository, made from the code itself.</p>

        <div className="auth-bar">
          {authLoading ? null : user ? (
            <>
              <span className="auth-user">
                {user.displayName ?? user.emails?.[0]?.value ?? "Signed in"}
              </span>
              <button className="btn-link" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <button className="btn-link" onClick={handleLogin}>Log in</button>
          )}
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <label className="field-label" htmlFor="repo">Repository</label>
          <input
            id="repo"
            className="input"
            type="text"
            placeholder="https://github.com/owner/repo"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            disabled={busy}
          />
          <button
            className="btn btn-secondary"
            onClick={handleIngest}
            disabled={busy || !repository.trim()}
          >
            {status === "ingesting" ? "Charting repository…" : "Chart this repository"}
          </button>
          {status === "ingested" && (
            <p className="hint hint-ok">Ready. Ask something below.</p>
          )}

          <div className="divider" />

          <label className="field-label" htmlFor="question">Question</label>
          <textarea
            id="question"
            className="input textarea"
            placeholder="What does the storeRepo function do?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={busy}
            rows={4}
          />
          <button
            className="btn btn-primary"
            onClick={handleAsk}
            disabled={busy || !repository.trim() || !question.trim()}
          >
            {status === "asking" ? "Reading the code…" : "Ask"}
          </button>

          {status === "error" && <p className="hint hint-error">{errorMsg}</p>}
        </section>

        <section className="panel result-panel">
          {!answer && status !== "asking" && (
            <div className="empty">
              <p>Chart a repository, then ask it something.</p>
              <p className="empty-sub">The answer will cite the exact code it drew from.</p>
            </div>
          )}
          {status === "asking" && (
            <div className="empty">
              <div className="spinner" />
              Reading the code…
            </div>
          )}
          {answer && (
            <div className="answer-block">
              <h2 className="answer-heading">Answer</h2>
              <p className="answer">{answer}</p>
              {sources.length > 0 && (
                <div className="legend">
                  <h3 className="legend-heading">Sources referenced</h3>
                  {sources.map((s, i) => (
                    <div className="legend-item" key={s.chunkId}>
                      <div className="legend-index">source {i + 1}</div>
                      <pre className="legend-code">{s.preview}</pre>
                      <div className="legend-meta">
                        match {(s.similarity * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

const css = `
:root {
  color-scheme: dark;
}

* { box-sizing: border-box; }

body { margin: 0; }

.page {
  min-height: 100vh;
  background: #0a0a0a;
  color: #f2f2f2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 56px 24px 96px;
}

.masthead {
  max-width: 780px;
  margin: 0 auto 44px;
  text-align: left;
}

.masthead-mark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a3a3a3;
  margin-bottom: 14px;
}

.masthead-mark::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f2f2f2;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12);
}

.masthead h1 {
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: 2.6rem;
  font-weight: 600;
  letter-spacing: 0.005em;
  margin: 0 0 8px;
  color: #ffffff;
  line-height: 1.1;
}

.tagline {
  color: #8f8f8f;
  font-size: 1.02rem;
  margin: 0;
  max-width: 46ch;
  line-height: 1.5;
}

.layout {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 780px) {
  .layout { grid-template-columns: 1fr; }
}

.panel {
  background: linear-gradient(180deg, #141414 0%, #101010 100%);
  border: 1px solid #262626;
  border-radius: 14px;
  padding: 26px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 12px 32px -16px rgba(0, 0, 0, 0.7);
}

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 500;
  color: #9a9a9a;
  margin-bottom: 9px;
  letter-spacing: 0.01em;
}

.input {
  width: 100%;
  background: #070707;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #f2f2f2;
  padding: 11px 13px;
  font-size: 0.94rem;
  font-family: inherit;
  margin-bottom: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input::placeholder { color: #4d4d4d; }

.input:hover:not(:disabled) { border-color: #3a3a3a; }

.input:focus {
  outline: none;
  border-color: #f2f2f2;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.input:disabled { opacity: 0.5; cursor: not-allowed; }

.textarea { resize: vertical; line-height: 1.5; min-height: 96px; }

.btn {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.94rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
  letter-spacing: 0.005em;
}

.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }

.btn-primary {
  background: linear-gradient(180deg, #ffffff 0%, #e6e6e6 100%);
  color: #0a0a0a;
  box-shadow: 0 4px 14px -6px rgba(255, 255, 255, 0.25);
}
.btn-primary:not(:disabled):hover {
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%);
  box-shadow: 0 6px 18px -6px rgba(255, 255, 255, 0.35);
}

.btn-secondary {
  background: transparent;
  border: 1px solid #333333;
  color: #e0e0e0;
}
.btn-secondary:not(:disabled):hover {
  border-color: #f2f2f2;
  background: rgba(255, 255, 255, 0.05);
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #2a2a2a 15%, #2a2a2a 85%, transparent);
  margin: 22px 0;
}

.hint {
  font-size: 0.83rem;
  margin: 11px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint::before { content: ""; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

.hint-ok { color: #d9d9d9; }
.hint-ok::before { background: #d9d9d9; }

.hint-error { color: #9a9a9a; }
.hint-error::before { background: #9a9a9a; border: 1px solid #d9d9d9; }

.result-panel {
  min-height: 380px;
  display: flex;
  flex-direction: column;
}

.empty {
  color: #666666;
  font-size: 0.96rem;
  padding: 64px 20px;
  text-align: center;
  margin: auto 0;
}

.empty-sub {
  font-size: 0.85rem;
  margin-top: 8px;
  color: #404040;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #2a2a2a;
  border-top-color: #f2f2f2;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.answer-block {
  animation: fadeUp 0.3s ease-out;
}

.answer-heading {
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: 1.15rem;
  color: #ffffff;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-heading::before {
  content: "";
  width: 3px;
  height: 16px;
  background: #f2f2f2;
  border-radius: 2px;
}

.answer {
  font-size: 0.99rem;
  line-height: 1.68;
  color: #d9d9d9;
  white-space: pre-wrap;
  margin: 0 0 32px;
}

.legend {
  border-top: 1px solid #1f1f1f;
  padding-top: 22px;
}

.legend-heading {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #737373;
  margin: 0 0 16px;
}

.legend-item {
  position: relative;
  padding: 4px 0 4px 18px;
  margin-bottom: 18px;
}

.legend-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 2px;
  background: linear-gradient(180deg, #f2f2f2, rgba(255, 255, 255, 0.15));
  border-radius: 2px;
}

.legend-index {
  font-size: 0.74rem;
  font-weight: 600;
  color: #d9d9d9;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.legend-code {
  background: #050505;
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  padding: 11px 13px;
  font-family: "SF Mono", "JetBrains Mono", monospace;
  font-size: 0.78rem;
  line-height: 1.55;
  color: #b3b3b3;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0 0 6px;
}

.legend-code::-webkit-scrollbar { height: 6px; }
.legend-code::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }

.legend-meta {
  font-size: 0.74rem;
  color: #595959;
  font-weight: 500;
}


/* ...all your existing CSS stays exactly the same... */

.auth-bar {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-user {
  font-size: 0.85rem;
  color: #a3a3a3;
}

.btn-link {
  background: transparent;
  border: 1px solid #333333;
  color: #e0e0e0;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.btn-link:hover { border-color: #f2f2f2; }
`
