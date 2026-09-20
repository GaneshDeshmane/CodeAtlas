

export interface MeResponse {
  user: Record<string, unknown>;
}

export interface Source {
  chunkId: number;
  position: number;
  similarity: number;
  preview: string;
}

export interface AgentResponse {
  answer: string;
  sources: Source[];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJsonSafe(res: Response): Promise<any | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function getMe(): Promise<MeResponse["user"] | null> {
  const res = await fetch("/me", { credentials: "include" });
  if (res.status === 401) return null;
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new ApiError((data && data.msg) || `Failed to check session (${res.status})`, res.status);
  return (data as MeResponse).user;
}

export const LOGIN_URL = "/login";
export async function logout(): Promise<void> {
  await fetch("/logout", { credentials: "include" });
}

export async function ingestRepository(repository: string): Promise<{ msg: string; repository: string }> {
  const res = await fetch("/ingestion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repository }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new ApiError((data && data.msg) || `Ingestion failed (${res.status})`, res.status);
  }
  return data;
}

export async function askAgent(repository: string, question: string): Promise<AgentResponse> {
  const res = await fetch("/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repository, question }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new ApiError((data && data.msg) || `Agent request failed (${res.status})`, res.status);
  }
  return data as AgentResponse;
}
