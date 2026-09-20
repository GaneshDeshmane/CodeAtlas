

import homepage from "./src/index.html";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:3001";
const PORT = Number(process.env.PORT ?? 5173);

const PROXY_PREFIXES = ["/agent", "/ingestion", "/login", "/logout", "/oauth2/redirect", "/me"];

function shouldProxy(pathname: string): boolean {
  return PROXY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function proxyToBackend(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const target = new URL(url.pathname + url.search, BACKEND_ORIGIN);

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const backendRes = await fetch(target, init);

  const resHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return; 
    resHeaders.append(key, value);
  });

  const setCookies =
    typeof (backendRes.headers as any).getSetCookie === "function"
      ? ((backendRes.headers as any).getSetCookie() as string[])
      : backendRes.headers.get("set-cookie")
        ? [backendRes.headers.get("set-cookie") as string]
        : [];
  for (const cookie of setCookies) resHeaders.append("set-cookie", cookie);
  const location = resHeaders.get("location");
  if (location) {
    try {
      const loc = new URL(location, BACKEND_ORIGIN);
      if (loc.origin === BACKEND_ORIGIN) {
        resHeaders.set("location", loc.pathname + loc.search + loc.hash);
      }
    } catch {
      
    }
  }

  return new Response(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  });
}

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": homepage,
  },
  development: {
    hmr: true,
    console: true,
  },
  async fetch(req) {
    const url = new URL(req.url);
    if (shouldProxy(url.pathname)) {
      return proxyToBackend(req);
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Frontend dev server:  ${server.url}`);
console.log(`Proxying ${PROXY_PREFIXES.join(", ")}  ->  ${BACKEND_ORIGIN}`);
