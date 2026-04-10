#!/usr/bin/env node

/**
 * MCP Streamable HTTP ← → stdio bridge
 *
 * Exposes a local stdio-based MCP server over HTTP so Anthropic's
 * Agents API (or any MCP client using Streamable HTTP transport)
 * can connect to it.
 *
 * KEY DESIGN DECISIONS:
 *  1. The stdio MCP server is spawned ONCE on startup and kept alive.
 *     Every HTTP request is routed through the same long-lived process,
 *     which preserves session state (the initialize handshake, etc.).
 *  2. Requests (JSON-RPC messages with an `id`) are forwarded to stdin
 *     and the matching response from stdout is routed back to the
 *     correct HTTP response by `id`.
 *  3. Notifications (JSON-RPC messages WITHOUT an `id`) are forwarded
 *     to stdin and immediately acknowledged with HTTP 202.
 *  4. Batch requests (JSON arrays) are supported per the MCP spec.
 *
 * USAGE:
 *   MCP_COMMAND="node" MCP_ARGS="dist/index.js" PORT=3000 node http-wrapper.mjs
 *
 *   Then point ngrok (or your tunnel) at http://localhost:3000
 *   and give the Agents API the public URL + /mcp as the endpoint.
 */

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

// ────────────────────────────────────────────────────────────────────
// Configuration — set via env vars
// ────────────────────────────────────────────────────────────────────
const MCP_COMMAND = process.env.MCP_COMMAND || "npx";
const MCP_ARGS = (process.env.MCP_ARGS || "")
  .split(" ")
  .filter(Boolean);
const MCP_CWD = process.env.MCP_CWD || process.cwd();
const PORT = parseInt(process.env.PORT || "3000", 10);
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || "30000", 10);

// A single session ID for the lifetime of this process.
// If you need multi-session support, you'd key on Mcp-Session-Id
// from the client — but for a 1:1 bridge this is sufficient.
const SESSION_ID = randomUUID();

// ────────────────────────────────────────────────────────────────────
// Spawn the stdio MCP server — ONCE
// ────────────────────────────────────────────────────────────────────
console.log(
  `[http-wrapper] Spawning: ${MCP_COMMAND} ${MCP_ARGS.join(" ")} (cwd: ${MCP_CWD})`
);

const mcp = spawn(MCP_COMMAND, MCP_ARGS, {
  stdio: ["pipe", "pipe", "inherit"], // inherit stderr so you see server logs
  cwd: MCP_CWD,
  env: { ...process.env }, // pass through all env vars (credentials, etc.)
});

if (!mcp.pid) {
  console.error("[http-wrapper] Failed to spawn MCP process");
  process.exit(1);
}
console.log(`[http-wrapper] MCP process started (PID ${mcp.pid})`);

// ────────────────────────────────────────────────────────────────────
// Response routing: stdout → pending HTTP responses
// ────────────────────────────────────────────────────────────────────
//
// Each JSON-RPC request we forward has an `id`. We stash the HTTP
// response object keyed by that id. When the stdio server writes a
// matching response to stdout, we route it back.

let stdoutBuf = "";

/** @type {Map<string|number, { resolve: (msg: object) => void, timer: ReturnType<typeof setTimeout> }>} */
const pending = new Map();

mcp.stdout.on("data", (chunk) => {
  stdoutBuf += chunk.toString("utf8");

  let idx;
  while ((idx = stdoutBuf.indexOf("\n")) !== -1) {
    const line = stdoutBuf.slice(0, idx).trim();
    stdoutBuf = stdoutBuf.slice(idx + 1);
    if (!line) continue;

    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      console.error("[http-wrapper] Unparseable stdout:", line.slice(0, 200));
      continue;
    }

    console.log("[http-wrapper] <- stdio:", JSON.stringify(msg).slice(0, 300));

    // Route response by id
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve, timer } = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(timer);
      resolve(msg);
    } else if (msg.id != null) {
      console.warn("[http-wrapper] No pending request for id:", msg.id);
    }
    // Server-initiated notifications (no id) are logged but not routed —
    // they'd need a GET-based SSE stream if you wanted to push them to
    // the client, which is an optional part of the spec.
  }
});

mcp.on("error", (err) => {
  console.error("[http-wrapper] MCP process error:", err.message);
});

mcp.on("exit", (code, signal) => {
  console.error(
    `[http-wrapper] MCP process exited (code=${code}, signal=${signal})`
  );
  // Drain all pending requests with 502
  for (const [id, { resolve, timer }] of pending) {
    clearTimeout(timer);
    resolve({
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: "MCP server process exited" },
    });
  }
  pending.clear();
  // Don't process.exit here — let in-flight HTTP responses flush first
  setTimeout(() => process.exit(1), 500);
});

// ────────────────────────────────────────────────────────────────────
// Core: forward a single JSON-RPC message and (if it's a request)
// wait for the stdio server's response.
// ────────────────────────────────────────────────────────────────────

/**
 * @param {object} msg  A single JSON-RPC message
 * @returns {Promise<object|null>}  The response for requests, null for notifications
 */
function forward(msg) {
  // Write to stdio stdin
  const ok = mcp.stdin.write(JSON.stringify(msg) + "\n");
  if (!ok) {
    console.warn("[http-wrapper] stdin backpressure — message queued by Node");
  }

  // Notifications have no `id` — nothing to wait for
  if (!("id" in msg) || msg.id == null) {
    return Promise.resolve(null);
  }

  // Requests: wait for the matching response from stdout
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (pending.has(msg.id)) {
        pending.delete(msg.id);
        resolve({
          jsonrpc: "2.0",
          id: msg.id,
          error: {
            code: -32000,
            message: `Timeout: no response from MCP server within ${TIMEOUT_MS}ms`,
          },
        });
      }
    }, TIMEOUT_MS);

    pending.set(msg.id, { resolve, timer });
  });
}

// ────────────────────────────────────────────────────────────────────
// HTTP server
// ────────────────────────────────────────────────────────────────────

/** SSE connections for server→client notifications (optional per spec) */
const sseClients = new Set();

const server = createServer(async (req, res) => {
  // ── CORS (needed for browser-based clients; harmless for server clients) ──
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Mcp-Session-Id, Authorization"
  );
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── GET: SSE stream for server→client notifications (spec-optional) ──
  if (req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Mcp-Session-Id": SESSION_ID,
    });
    res.write(":ok\n\n");

    const keepAlive = setInterval(() => res.write(":keepalive\n\n"), 15_000);
    sseClients.add(res);

    req.on("close", () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
    return;
  }

  // ── DELETE: session termination ──
  if (req.method === "DELETE") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "session terminated" }));
    return;
  }

  // ── Only POST from here ──
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // ── Collect request body ──
  let body = "";
  for await (const chunk of req) body += chunk;

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
      })
    );
    return;
  }

  console.log("[http-wrapper] -> POST:", JSON.stringify(parsed).slice(0, 300));

  // Normalize to array for uniform handling
  const isBatch = Array.isArray(parsed);
  const messages = isBatch ? parsed : [parsed];

  // Separate requests (have id) from notifications (no id)
  const requests = messages.filter((m) => "id" in m && m.id != null);
  const notifications = messages.filter((m) => !("id" in m) || m.id == null);

  // Forward everything to stdio
  const responsePromises = messages.map((m) => forward(m));

  // If there are no requests — all notifications — respond 202 immediately
  if (requests.length === 0) {
    res.writeHead(202, { "Mcp-Session-Id": SESSION_ID });
    res.end();
    return;
  }

  // Wait for all responses (notifications resolve to null)
  const allResults = await Promise.all(responsePromises);

  // Collect only the non-null results (i.e., responses to requests)
  const responses = allResults.filter((r) => r !== null);

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Mcp-Session-Id": SESSION_ID,
  });

  // If the client sent a batch, respond with an array; otherwise a single object
  if (isBatch) {
    res.end(JSON.stringify(responses));
  } else {
    res.end(JSON.stringify(responses[0]));
  }
});

server.listen(PORT, () => {
  console.log(`[http-wrapper] Listening on http://localhost:${PORT}`);
  console.log(`[http-wrapper] Session ID: ${SESSION_ID}`);
  console.log(`[http-wrapper] Timeout: ${TIMEOUT_MS}ms`);
  console.log(`[http-wrapper] Point your tunnel at this port.`);
  console.log(`[http-wrapper] Agent MCP URL should be: <tunnel-url>/mcp`);
});

// Graceful shutdown
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log(`[http-wrapper] Received ${sig}, shutting down...`);
    mcp.kill("SIGTERM");
    server.close();
    process.exit(0);
  });
}
