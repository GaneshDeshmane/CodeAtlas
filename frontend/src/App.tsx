import { useState } from "react"

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

type Status = "idle" | "ingesting" | "ingested" | "asking" | "error"

export  function App() {
  const [repository, setRepository] = useState("")
  const [question, setQuestion] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<Source[]>([])

  async function handleIngest() {
    if (!repository.trim()) return
    setStatus("ingesting")
    setErrorMsg("")
    try {
      const res = await fetch(`${API_BASE}/ingestion`, {
        method: "POST",
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
      setErrorMsg("Could not reach the server. Is it running on port 3000?")
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
      setErrorMsg("Could not reach the server. Is it running on port 3000?")
      setStatus("error")
    }
  }

  const busy = status === "ingesting" || status === "asking"

  return (
    <div className="page">
      <style>{css}</style>

      <header className="masthead">
        <h1>CodeAtlas</h1>
        <p className="tagline">A map of a repository, made from the code itself.</p>
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

          {status === "asking" && <div className="empty">Reading the code…</div>}

          {answer && (
            <>
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
            </>
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
  background: #12141c;
  color: #e9eaf0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 48px 24px 80px;
}

.masthead {
  max-width: 720px;
  margin: 0 auto 40px;
  text-align: left;
}

.masthead h1 {
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: 2.4rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  margin: 0 0 6px;
  color: #f4f1ea;
}

.tagline {
  color: #8b8fa3;
  font-size: 1rem;
  margin: 0;
}

.layout {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

@media (max-width: 760px) {
  .layout { grid-template-columns: 1fr; }
}

.panel {
  background: #181b26;
  border: 1px solid #262a38;
  border-radius: 10px;
  padding: 24px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  color: #a6aabc;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  background: #0f111a;
  border: 1px solid #2a2e3d;
  border-radius: 6px;
  color: #e9eaf0;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  margin-bottom: 12px;
}

.input:focus {
  outline: 2px solid #5fb4a6;
  outline-offset: 1px;
  border-color: #5fb4a6;
}

.textarea { resize: vertical; }

.btn {
  width: 100%;
  border: none;
  border-radius: 6px;
  padding: 11px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  background: #5fb4a6;
  color: #0f111a;
}
.btn-primary:not(:disabled):hover { background: #74c2b4; }

.btn-secondary {
  background: transparent;
  border: 1px solid #3a3f52;
  color: #e9eaf0;
}
.btn-secondary:not(:disabled):hover { border-color: #5fb4a6; }

.divider {
  height: 1px;
  background: #262a38;
  margin: 20px 0;
}

.hint { font-size: 0.85rem; margin: 10px 0 0; }
.hint-ok { color: #5fb4a6; }
.hint-error { color: #d98e4a; }

.result-panel {
  min-height: 320px;
}

.empty {
  color: #6b6f82;
  font-size: 0.95rem;
  padding: 40px 0;
  text-align: center;
}
.empty-sub { font-size: 0.85rem; margin-top: 6px; color: #4c5063; }

.answer-heading {
  font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  font-size: 1.1rem;
  color: #f4f1ea;
  margin: 0 0 12px;
}

.answer {
  font-size: 0.98rem;
  line-height: 1.6;
  color: #d7d9e2;
  white-space: pre-wrap;
  margin: 0 0 28px;
}

.legend-heading {
  font-size: 0.85rem;
  color: #a6aabc;
  font-weight: 500;
  margin: 0 0 12px;
}

.legend-item {
  border-left: 2px solid #5fb4a6;
  padding: 4px 0 4px 14px;
  margin-bottom: 16px;
}

.legend-index {
  font-size: 0.75rem;
  color: #5fb4a6;
  margin-bottom: 4px;
}

.legend-code {
  background: #0f111a;
  border: 1px solid #262a38;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: "SF Mono", "JetBrains Mono", monospace;
  font-size: 0.78rem;
  color: #b9bccb;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0 0 4px;
}

.legend-meta {
  font-size: 0.75rem;
  color: #6b6f82;
}
`