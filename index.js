import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import axios from "axios";
import * as OTPAuth from "otpauth";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const BASE_URL = "https://apiconnect.angelone.in";
let authToken = null;

function generateTOTP(secret) {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    digits: 6,
    period: 30,
  });
  return totp.generate();
}

function makeHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "127.0.0.1",
    "X-ClientPublicIP": "127.0.0.1",
    "X-MACAddress": "00:00:00:00:00:00",
    "X-PrivateKey": process.env.ANGELONE_API_KEY,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extra,
  };
}

async function login() {
  const totp = generateTOTP(process.env.ANGELONE_TOTP_SECRET);
  const res = await axios.post(
    `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
    {
      clientcode: process.env.ANGELONE_CLIENT_ID,
      password: process.env.ANGELONE_PIN,
      totp,
    },
    { headers: makeHeaders() }
  );
  if (!res.data?.data?.jwtToken)
    throw new Error(res.data?.message || "Login failed");
  authToken = res.data.data.jwtToken;
}

async function ensureLoggedIn() {
  if (!authToken) await login();
}

async function angelGet(path) {
  await ensureLoggedIn();
  const res = await axios.get(`${BASE_URL}${path}`, { headers: makeHeaders() });
  return res.data;
}

function createMcpServer() {
  const server = new McpServer({ name: "angelone-portfolio", version: "1.0.0" });

  server.tool("get_holdings", "Get all stock holdings with current value and P&L", {}, async () => {
    const data = await angelGet("/rest/secure/angelbroking/portfolio/v1/getHolding");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("get_positions", "Get today's open positions", {}, async () => {
    const data = await angelGet("/rest/secure/angelbroking/order/v1/getPosition");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("get_funds", "Get account funds and available margin", {}, async () => {
    const data = await angelGet("/rest/secure/angelbroking/user/v1/getRMS");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("get_profile", "Get account profile information", {}, async () => {
    const data = await angelGet("/rest/secure/angelbroking/user/v1/getProfile");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("get_order_book", "Get today's order book", {}, async () => {
    const data = await angelGet("/rest/secure/angelbroking/order/v1/getOrderBook");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("get_trade_book", "Get today's executed trades", {}, async () => {
    const data = await angelGet("/rest/secure/angelbroking/order/v1/getTradeBook");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool(
    "get_candle_data",
    "Get historical OHLC candle data for a stock",
    {
      symboltoken: z.string().describe("Symbol token e.g. 3045 for SBIN"),
      exchange: z.string().describe("Exchange: NSE or BSE"),
      interval: z.string().describe("ONE_MINUTE, FIVE_MINUTE, ONE_HOUR, ONE_DAY"),
      fromdate: z.string().describe("From date: YYYY-MM-DD HH:mm"),
      todate: z.string().describe("To date: YYYY-MM-DD HH:mm"),
    },
    async ({ symboltoken, exchange, interval, fromdate, todate }) => {
      await ensureLoggedIn();
      const res = await axios.post(
        `${BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
        { exchange, symboltoken, interval, fromdate, todate },
        { headers: makeHeaders() }
      );
      return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
    }
  );

  return server;
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const sessions = new Map();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

async function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

const httpServer = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, PUBLIC_URL);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── OAuth protected resource metadata ──────────────────────────────────────
  if (reqUrl.pathname === "/.well-known/oauth-protected-resource") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      resource: PUBLIC_URL,
      authorization_servers: [PUBLIC_URL],
    }));
    return;
  }

  // ── OAuth authorization server metadata ────────────────────────────────────
  if (reqUrl.pathname === "/.well-known/oauth-authorization-server") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      issuer: PUBLIC_URL,
      authorization_endpoint: `${PUBLIC_URL}/oauth/authorize`,
      token_endpoint: `${PUBLIC_URL}/oauth/token`,
      registration_endpoint: `${PUBLIC_URL}/oauth/register`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
    }));
    return;
  }

  // ── Dynamic client registration (RFC 7591) ─────────────────────────────────
  if (reqUrl.pathname === "/oauth/register" && req.method === "POST") {
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = JSON.parse(raw); } catch {}
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      client_id: "claude-ai-client",
      client_secret: "claude-ai-secret",
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_secret_expires_at: 0,
      redirect_uris: parsed.redirect_uris || [],
      grant_types: parsed.grant_types || ["authorization_code"],
      response_types: parsed.response_types || ["code"],
      token_endpoint_auth_method: parsed.token_endpoint_auth_method || "client_secret_basic",
    }));
    return;
  }

  // ── OAuth token endpoint ───────────────────────────────────────────────────
  if (reqUrl.pathname === "/oauth/token" && req.method === "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      access_token: "angelone-mcp-token",
      token_type: "bearer",
      expires_in: 86400,
    }));
    return;
  }

  // ── OAuth authorization endpoint ───────────────────────────────────────────
  if (reqUrl.pathname === "/oauth/authorize" && req.method === "GET") {
    const redirectUri = reqUrl.searchParams.get("redirect_uri");
    const state = reqUrl.searchParams.get("state");
    if (!redirectUri) {
      res.writeHead(400);
      res.end("Missing redirect_uri");
      return;
    }
    const location = new URL(redirectUri);
    location.searchParams.set("code", "angelone-auth-code");
    if (state) location.searchParams.set("state", state);
    res.writeHead(302, { Location: location.toString() });
    res.end();
    return;
  }

  // ── MCP endpoint (Streamable HTTP) ─────────────────────────────────────────
  if (reqUrl.pathname === "/mcp") {
    let body;
    if (req.method === "POST") {
      const raw = await readBody(req);
      try { body = JSON.parse(raw); } catch {}
    }

    const sessionId = req.headers["mcp-session-id"];

    if (sessionId && sessions.has(sessionId)) {
      const transport = sessions.get(sessionId);
      await transport.handleRequest(req, res, body);
      return;
    }

    if (req.method === "POST") {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          sessions.set(id, transport);
        },
      });
      transport.onclose = () => {
        const id = transport.sessionId;
        if (id) sessions.delete(id);
      };
      const mcpServer = createMcpServer();
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, body);
      return;
    }

    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_request", error_description: "Use POST to initialize a session" }));
    return;
  }

  // ── Health check ───────────────────────────────────────────────────────────
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("AngelOne MCP server is running ✅");
});

httpServer.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
  console.log(`MCP endpoint: ${PUBLIC_URL}/mcp`);
});
