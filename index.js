// // // import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// // // import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// // // import { z } from "zod";
// // // import axios from "axios";
// // // import * as OTPAuth from "otpauth";
// // // import dotenv from "dotenv";
// // // import { fileURLToPath } from "url";
// // // import { dirname, join } from "path";
// // // const __dirname = dirname(fileURLToPath(import.meta.url));
// // // dotenv.config({ path: join(__dirname, ".env") });

// // // const BASE_URL = "https://apiconnect.angelone.in";
// // // let authToken = null;
// // // let feedToken = null;

// // // // ── helpers ──────────────────────────────────────────────────────────────────

// // // function generateTOTP(secret) {
// // //   const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 });
// // //   return totp.generate();
// // // }

// // // function headers(extra = {}) {
// // //   return {
// // //     "Content-Type": "application/json",
// // //     Accept: "application/json",
// // //     "X-UserType": "USER",
// // //     "X-SourceID": "WEB",
// // //     "X-ClientLocalIP": "127.0.0.1",
// // //     "X-ClientPublicIP": "127.0.0.1",
// // //     "X-MACAddress": "00:00:00:00:00:00",
// // //     "X-PrivateKey": process.env.ANGELONE_API_KEY,
// // //     ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
// // //     ...extra,
// // //   };
// // // }

// // // async function login() {
// // //   const totp = generateTOTP(process.env.ANGELONE_TOTP_SECRET);
// // //   const res = await axios.post(
// // //     `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
// // //     {
// // //       clientcode: process.env.ANGELONE_CLIENT_ID,
// // //       password: process.env.ANGELONE_PIN,
// // //       totp,
// // //     },
// // //     { headers: headers() }
// // //   );
// // //   if (!res.data?.data?.jwtToken) throw new Error(res.data?.message || "Login failed");
// // //   authToken = res.data.data.jwtToken;
// // //   feedToken = res.data.data.feedToken;
// // //   return "Logged in successfully";
// // // }

// // // async function ensureLoggedIn() {
// // //   if (!authToken) await login();
// // // }

// // // async function get(path) {
// // //   await ensureLoggedIn();
// // //   const res = await axios.get(`${BASE_URL}${path}`, { headers: headers() });
// // //   return res.data;
// // // }

// // // // ── MCP server ────────────────────────────────────────────────────────────────

// // // const server = new McpServer({ name: "angelone-portfolio", version: "1.0.0" });

// // // server.tool("get_holdings", "Get all stock holdings with current value and P&L", {}, async () => {
// // //   const data = await get("/rest/secure/angelbroking/portfolio/v1/getHolding");
// // //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // // });

// // // server.tool("get_positions", "Get today's open positions", {}, async () => {
// // //   const data = await get("/rest/secure/angelbroking/order/v1/getPosition");
// // //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // // });

// // // server.tool("get_funds", "Get account funds and available margin", {}, async () => {
// // //   const data = await get("/rest/secure/angelbroking/user/v1/getRMS");
// // //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // // });

// // // server.tool("get_profile", "Get account profile information", {}, async () => {
// // //   const data = await get("/rest/secure/angelbroking/user/v1/getProfile");
// // //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // // });

// // // server.tool("get_order_book", "Get today's order book", {}, async () => {
// // //   const data = await get("/rest/secure/angelbroking/order/v1/getOrderBook");
// // //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // // });

// // // server.tool("get_trade_book", "Get today's executed trades", {}, async () => {
// // //   const data = await get("/rest/secure/angelbroking/order/v1/getTradeBook");
// // //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // // });

// // // server.tool(
// // //   "get_candle_data",
// // //   "Get historical OHLC candle data for a stock",
// // //   {
// // //     symboltoken: z.string().describe("Symbol token e.g. 3045 for SBIN"),
// // //     exchange: z.string().describe("Exchange: NSE or BSE"),
// // //     interval: z.string().describe("ONE_MINUTE, FIVE_MINUTE, ONE_HOUR, ONE_DAY"),
// // //     fromdate: z.string().describe("From date: YYYY-MM-DD HH:mm"),
// // //     todate: z.string().describe("To date: YYYY-MM-DD HH:mm"),
// // //   },
// // //   async ({ symboltoken, exchange, interval, fromdate, todate }) => {
// // //     await ensureLoggedIn();
// // //     const res = await axios.post(
// // //       `${BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
// // //       { exchange, symboltoken, interval, fromdate, todate },
// // //       { headers: headers() }
// // //     );
// // //     return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
// // //   }
// // // );

// // // // ── start ─────────────────────────────────────────────────────────────────────

// // // const transport = new StdioServerTransport();
// // // await server.connect(transport);
// // import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// // import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// // import { z } from "zod";
// // import axios from "axios";
// // import * as OTPAuth from "otpauth";
// // import dotenv from "dotenv";
// // import { fileURLToPath } from "url";
// // import { dirname, join } from "path";
// // import http from "http";

// // const __dirname = dirname(fileURLToPath(import.meta.url));
// // dotenv.config({ path: join(__dirname, ".env") });

// // const BASE_URL = "https://apiconnect.angelone.in";
// // let authToken = null;

// // // ── helpers ───────────────────────────────────────────────────────────────────

// // function generateTOTP(secret) {
// //   const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 });
// //   return totp.generate();
// // }

// // function headers(extra = {}) {
// //   return {
// //     "Content-Type": "application/json",
// //     Accept: "application/json",
// //     "X-UserType": "USER",
// //     "X-SourceID": "WEB",
// //     "X-ClientLocalIP": "127.0.0.1",
// //     "X-ClientPublicIP": "127.0.0.1",
// //     "X-MACAddress": "00:00:00:00:00:00",
// //     "X-PrivateKey": process.env.ANGELONE_API_KEY,
// //     ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
// //     ...extra,
// //   };
// // }

// // async function login() {
// //   const totp = generateTOTP(process.env.ANGELONE_TOTP_SECRET);
// //   const res = await axios.post(
// //     `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
// //     {
// //       clientcode: process.env.ANGELONE_CLIENT_ID,
// //       password: process.env.ANGELONE_PIN,
// //       totp,
// //     },
// //     { headers: headers() }
// //   );
// //   if (!res.data?.data?.jwtToken) throw new Error(res.data?.message || "Login failed");
// //   authToken = res.data.data.jwtToken;
// // }

// // async function ensureLoggedIn() {
// //   if (!authToken) await login();
// // }

// // async function get(path) {
// //   await ensureLoggedIn();
// //   const res = await axios.get(`${BASE_URL}${path}`, { headers: headers() });
// //   return res.data;
// // }

// // // ── MCP server ────────────────────────────────────────────────────────────────

// // const server = new McpServer({ name: "angelone-portfolio", version: "1.0.0" });

// // server.tool("get_holdings", "Get all stock holdings with current value and P&L", {}, async () => {
// //   const data = await get("/rest/secure/angelbroking/portfolio/v1/getHolding");
// //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // });

// // server.tool("get_positions", "Get today's open positions", {}, async () => {
// //   const data = await get("/rest/secure/angelbroking/order/v1/getPosition");
// //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // });

// // server.tool("get_funds", "Get account funds and available margin", {}, async () => {
// //   const data = await get("/rest/secure/angelbroking/user/v1/getRMS");
// //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // });

// // server.tool("get_profile", "Get account profile information", {}, async () => {
// //   const data = await get("/rest/secure/angelbroking/user/v1/getProfile");
// //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // });

// // server.tool("get_order_book", "Get today's order book", {}, async () => {
// //   const data = await get("/rest/secure/angelbroking/order/v1/getOrderBook");
// //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // });

// // server.tool("get_trade_book", "Get today's executed trades", {}, async () => {
// //   const data = await get("/rest/secure/angelbroking/order/v1/getTradeBook");
// //   return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
// // });

// // server.tool(
// //   "get_candle_data",
// //   "Get historical OHLC candle data for a stock",
// //   {
// //     symboltoken: z.string().describe("Symbol token e.g. 3045 for SBIN"),
// //     exchange: z.string().describe("Exchange: NSE or BSE"),
// //     interval: z.string().describe("ONE_MINUTE, FIVE_MINUTE, ONE_HOUR, ONE_DAY"),
// //     fromdate: z.string().describe("From date: YYYY-MM-DD HH:mm"),
// //     todate: z.string().describe("To date: YYYY-MM-DD HH:mm"),
// //   },
// //   async ({ symboltoken, exchange, interval, fromdate, todate }) => {
// //     await ensureLoggedIn();
// //     const res = await axios.post(
// //       `${BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
// //       { exchange, symboltoken, interval, fromdate, todate },
// //       { headers: headers() }
// //     );
// //     return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
// //   }
// // );

// // // ── HTTP + SSE server ─────────────────────────────────────────────────────────

// // const sessions = {};

// // const httpServer = http.createServer(async (req, res) => {
// //   if (req.url === "/sse" && req.method === "GET") {
// //     const transport = new SSEServerTransport("/message", res);
// //     sessions[transport.sessionId] = transport;
// //     await server.connect(transport);
// //   } else if (req.url?.startsWith("/message") && req.method === "POST") {
// //     let body = "";
// //     req.on("data", chunk => (body += chunk));
// //     req.on("end", async () => {
// //       const sessionId = new URL(req.url, "http://localhost").searchParams.get("sessionId");
// //       const transport = sessions[sessionId];
// //       if (transport) {
// //         await transport.handlePostMessage(req, res, body);
// //       } else {
// //         res.writeHead(404);
// //         res.end("Session not found");
// //       }
// //     });
// //   } else {
// //     res.writeHead(200);
// //     res.end("AngelOne MCP server is running ✅");
// //   }
// // });

// // const PORT = process.env.PORT || 3000;
// // httpServer.listen(PORT, () => console.log(`MCP server running on port ${PORT}`));

// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
// import { z } from "zod";
// import axios from "axios";
// import * as OTPAuth from "otpauth";
// import dotenv from "dotenv";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// import http from "http";

// const __dirname = dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: join(__dirname, ".env") });

// const BASE_URL = "https://apiconnect.angelone.in";
// let authToken = null;

// // ── helpers ───────────────────────────────────────────────────────────────────

// function generateTOTP(secret) {
//   const totp = new OTPAuth.TOTP({
//     secret: OTPAuth.Secret.fromBase32(secret),
//     digits: 6,
//     period: 30,
//   });
//   return totp.generate();
// }

// function headers(extra = {}) {
//   return {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//     "X-UserType": "USER",
//     "X-SourceID": "WEB",
//     "X-ClientLocalIP": "127.0.0.1",
//     "X-ClientPublicIP": "127.0.0.1",
//     "X-MACAddress": "00:00:00:00:00:00",
//     "X-PrivateKey": process.env.ANGELONE_API_KEY,
//     ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
//     ...extra,
//   };
// }

// async function login() {
//   const totp = generateTOTP(process.env.ANGELONE_TOTP_SECRET);
//   const res = await axios.post(
//     `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`,
//     {
//       clientcode: process.env.ANGELONE_CLIENT_ID,
//       password: process.env.ANGELONE_PIN,
//       totp,
//     },
//     { headers: headers() }
//   );
//   if (!res.data?.data?.jwtToken)
//     throw new Error(res.data?.message || "Login failed");
//   authToken = res.data.data.jwtToken;
// }

// async function ensureLoggedIn() {
//   if (!authToken) await login();
// }

// async function get(path) {
//   await ensureLoggedIn();
//   const res = await axios.get(`${BASE_URL}${path}`, { headers: headers() });
//   return res.data;
// }

// // ── MCP server ────────────────────────────────────────────────────────────────

// const server = new McpServer({ name: "angelone-portfolio", version: "1.0.0" });

// server.tool(
//   "get_holdings",
//   "Get all stock holdings with current value and P&L",
//   {},
//   async () => {
//     const data = await get(
//       "/rest/secure/angelbroking/portfolio/v1/getHolding"
//     );
//     return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
//   }
// );

// server.tool(
//   "get_positions",
//   "Get today's open positions",
//   {},
//   async () => {
//     const data = await get(
//       "/rest/secure/angelbroking/order/v1/getPosition"
//     );
//     return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
//   }
// );

// server.tool(
//   "get_funds",
//   "Get account funds and available margin",
//   {},
//   async () => {
//     const data = await get("/rest/secure/angelbroking/user/v1/getRMS");
//     return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
//   }
// );

// server.tool(
//   "get_profile",
//   "Get account profile information",
//   {},
//   async () => {
//     const data = await get(
//       "/rest/secure/angelbroking/user/v1/getProfile"
//     );
//     return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
//   }
// );

// server.tool(
//   "get_order_book",
//   "Get today's order book",
//   {},
//   async () => {
//     const data = await get(
//       "/rest/secure/angelbroking/order/v1/getOrderBook"
//     );
//     return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
//   }
// );

// server.tool(
//   "get_trade_book",
//   "Get today's executed trades",
//   {},
//   async () => {
//     const data = await get(
//       "/rest/secure/angelbroking/order/v1/getTradeBook"
//     );
//     return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
//   }
// );

// server.tool(
//   "get_candle_data",
//   "Get historical OHLC candle data for a stock",
//   {
//     symboltoken: z.string().describe("Symbol token e.g. 3045 for SBIN"),
//     exchange: z.string().describe("Exchange: NSE or BSE"),
//     interval: z
//       .string()
//       .describe("ONE_MINUTE, FIVE_MINUTE, ONE_HOUR, ONE_DAY"),
//     fromdate: z.string().describe("From date: YYYY-MM-DD HH:mm"),
//     todate: z.string().describe("To date: YYYY-MM-DD HH:mm"),
//   },
//   async ({ symboltoken, exchange, interval, fromdate, todate }) => {
//     await ensureLoggedIn();
//     const res = await axios.post(
//       `${BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
//       { exchange, symboltoken, interval, fromdate, todate },
//       { headers: headers() }
//     );
//     return {
//       content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
//     };
//   }
// );

// // ── HTTP + SSE server ─────────────────────────────────────────────────────────

// const sessions = {};
// const PORT = process.env.PORT || 3000;
// const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

// const httpServer = http.createServer(async (req, res) => {
//   const reqUrl = new URL(req.url, PUBLIC_URL);

//   // ── CORS headers (required for Claude.ai to reach your server) ──────────────
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") {
//     res.writeHead(204);
//     res.end();
//     return;
//   }

//   // ── OAuth discovery ─────────────────────────────────────────────────────────
//   // Claude.ai hits this endpoint first when you add a remote MCP connector.
//   if (
//     req.url === "/.well-known/oauth-authorization-server" &&
//     req.method === "GET"
//   ) {
//     res.writeHead(200, { "Content-Type": "application/json" });
//     res.end(
//       JSON.stringify({
//         issuer: PUBLIC_URL,
//         authorization_endpoint: `${PUBLIC_URL}/oauth/authorize`,
//         token_endpoint: `${PUBLIC_URL}/oauth/token`,
//         response_types_supported: ["code"],
//         grant_types_supported: ["authorization_code"],
//         code_challenge_methods_supported: ["S256"],
//       })
//     );
//     return;
//   }

//   // ── OAuth token endpoint ────────────────────────────────────────────────────
//   // Returns a dummy bearer token. Your MCP tools authenticate against AngelOne
//   // separately using env-var credentials, so this token is just a handshake.
//   if (req.url === "/oauth/token" && req.method === "POST") {
//     res.writeHead(200, { "Content-Type": "application/json" });
//     res.end(
//       JSON.stringify({
//         access_token: "local-dev-token",
//         token_type: "bearer",
//         expires_in: 86400,
//       })
//     );
//     return;
//   }

//   // ── OAuth authorization endpoint ────────────────────────────────────────────
//   // Immediately redirects back with a code — no real login page needed since
//   // AngelOne credentials live in .env, not in Claude.ai's OAuth flow.
//   if (reqUrl.pathname === "/oauth/authorize" && req.method === "GET") {
//     const redirectUri = reqUrl.searchParams.get("redirect_uri");
//     const state = reqUrl.searchParams.get("state");
//     const code = "local-dev-code";
//     if (!redirectUri) {
//       res.writeHead(400);
//       res.end("Missing redirect_uri");
//       return;
//     }
//     const location = new URL(redirectUri);
//     location.searchParams.set("code", code);
//     if (state) location.searchParams.set("state", state);
//     res.writeHead(302, { Location: location.toString() });
//     res.end();
//     return;
//   }

//   // ── SSE endpoint ────────────────────────────────────────────────────────────
//   if (reqUrl.pathname === "/sse" && req.method === "GET") {
//     const transport = new SSEServerTransport("/message", res);
//     sessions[transport.sessionId] = transport;
//     res.on("close", () => {
//       delete sessions[transport.sessionId];
//     });
//     await server.connect(transport);
//     return;
//   }

//   // ── Message endpoint ────────────────────────────────────────────────────────
//   if (reqUrl.pathname === "/message" && req.method === "POST") {
//     let body = "";
//     req.on("data", (chunk) => (body += chunk));
//     req.on("end", async () => {
//       const sessionId = reqUrl.searchParams.get("sessionId");
//       const transport = sessions[sessionId];
//       if (transport) {
//         await transport.handlePostMessage(req, res, body);
//       } else {
//         res.writeHead(404);
//         res.end("Session not found");
//       }
//     });
//     return;
//   }

//   // ── Health check ────────────────────────────────────────────────────────────
//   res.writeHead(200);
//   res.end("AngelOne MCP server is running ✅");
// });

// httpServer.listen(PORT, () => {
//   console.log(`MCP server running on port ${PORT}`);
//   console.log(`Public URL: ${PUBLIC_URL}`);
//   console.log(`SSE endpoint: ${PUBLIC_URL}/sse`);
// });
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import axios from "axios";
import * as OTPAuth from "otpauth";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const BASE_URL = "https://apiconnect.angelone.in";
let authToken = null;

// ── helpers ───────────────────────────────────────────────────────────────────

function generateTOTP(secret) {
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),
    digits: 6,
    period: 30,
  });
  return totp.generate();
}

function headers(extra = {}) {
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
    { headers: headers() }
  );
  if (!res.data?.data?.jwtToken)
    throw new Error(res.data?.message || "Login failed");
  authToken = res.data.data.jwtToken;
}

async function ensureLoggedIn() {
  if (!authToken) await login();
}

async function get(path) {
  await ensureLoggedIn();
  const res = await axios.get(`${BASE_URL}${path}`, { headers: headers() });
  return res.data;
}

// ── MCP server ────────────────────────────────────────────────────────────────

const server = new McpServer({ name: "angelone-portfolio", version: "1.0.0" });

server.tool(
  "get_holdings",
  "Get all stock holdings with current value and P&L",
  {},
  async () => {
    const data = await get(
      "/rest/secure/angelbroking/portfolio/v1/getHolding"
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_positions",
  "Get today's open positions",
  {},
  async () => {
    const data = await get(
      "/rest/secure/angelbroking/order/v1/getPosition"
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_funds",
  "Get account funds and available margin",
  {},
  async () => {
    const data = await get("/rest/secure/angelbroking/user/v1/getRMS");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_profile",
  "Get account profile information",
  {},
  async () => {
    const data = await get(
      "/rest/secure/angelbroking/user/v1/getProfile"
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_order_book",
  "Get today's order book",
  {},
  async () => {
    const data = await get(
      "/rest/secure/angelbroking/order/v1/getOrderBook"
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_trade_book",
  "Get today's executed trades",
  {},
  async () => {
    const data = await get(
      "/rest/secure/angelbroking/order/v1/getTradeBook"
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_candle_data",
  "Get historical OHLC candle data for a stock",
  {
    symboltoken: z.string().describe("Symbol token e.g. 3045 for SBIN"),
    exchange: z.string().describe("Exchange: NSE or BSE"),
    interval: z
      .string()
      .describe("ONE_MINUTE, FIVE_MINUTE, ONE_HOUR, ONE_DAY"),
    fromdate: z.string().describe("From date: YYYY-MM-DD HH:mm"),
    todate: z.string().describe("To date: YYYY-MM-DD HH:mm"),
  },
  async ({ symboltoken, exchange, interval, fromdate, todate }) => {
    await ensureLoggedIn();
    const res = await axios.post(
      `${BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData`,
      { exchange, symboltoken, interval, fromdate, todate },
      { headers: headers() }
    );
    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }],
    };
  }
);

// ── HTTP + SSE server ─────────────────────────────────────────────────────────

const sessions = {};
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const httpServer = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, PUBLIC_URL);

  // ── CORS headers (required for Claude.ai to reach your server) ──────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── OAuth protected resource metadata ──────────────────────────────────────
  // Some clients check this before the authorization server metadata.
  if (
    req.url === "/.well-known/oauth-protected-resource" &&
    req.method === "GET"
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        resource: PUBLIC_URL,
        authorization_servers: [PUBLIC_URL],
      })
    );
    return;
  }

  // ── OAuth discovery ─────────────────────────────────────────────────────────
  // Claude.ai hits this endpoint first when you add a remote MCP connector.
  if (
    req.url === "/.well-known/oauth-authorization-server" &&
    req.method === "GET"
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        issuer: PUBLIC_URL,
        authorization_endpoint: `${PUBLIC_URL}/oauth/authorize`,
        token_endpoint: `${PUBLIC_URL}/oauth/token`,
        registration_endpoint: `${PUBLIC_URL}/oauth/register`,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code"],
        code_challenge_methods_supported: ["S256"],
      })
    );
    return;
  }

  // ── OAuth dynamic client registration (RFC 7591) ────────────────────────────
  // Claude.ai auto-registers itself as a client before starting the OAuth flow.
  // We accept any registration and hand back a stable client_id.
  if (reqUrl.pathname === "/oauth/register" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let parsed = {};
      try { parsed = JSON.parse(body); } catch (_) {}
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          client_id: "claude-ai-client",
          client_secret: "claude-ai-secret",
          client_id_issued_at: Math.floor(Date.now() / 1000),
          client_secret_expires_at: 0,
          redirect_uris: parsed.redirect_uris || [],
          grant_types: parsed.grant_types || ["authorization_code"],
          response_types: parsed.response_types || ["code"],
          token_endpoint_auth_method:
            parsed.token_endpoint_auth_method || "client_secret_basic",
        })
      );
    });
    return;
  }

  // ── OAuth token endpoint ────────────────────────────────────────────────────
  // Returns a dummy bearer token. Your MCP tools authenticate against AngelOne
  // separately using env-var credentials, so this token is just a handshake.
  if (req.url === "/oauth/token" && req.method === "POST") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        access_token: "local-dev-token",
        token_type: "bearer",
        expires_in: 86400,
      })
    );
    return;
  }

  // ── OAuth authorization endpoint ────────────────────────────────────────────
  // Immediately redirects back with a code — no real login page needed since
  // AngelOne credentials live in .env, not in Claude.ai's OAuth flow.
  if (reqUrl.pathname === "/oauth/authorize" && req.method === "GET") {
    const redirectUri = reqUrl.searchParams.get("redirect_uri");
    const state = reqUrl.searchParams.get("state");
    const code = "local-dev-code";
    if (!redirectUri) {
      res.writeHead(400);
      res.end("Missing redirect_uri");
      return;
    }
    const location = new URL(redirectUri);
    location.searchParams.set("code", code);
    if (state) location.searchParams.set("state", state);
    res.writeHead(302, { Location: location.toString() });
    res.end();
    return;
  }

  // ── SSE endpoint ────────────────────────────────────────────────────────────
  if (reqUrl.pathname === "/sse" && req.method === "GET") {
    const transport = new SSEServerTransport("/message", res);
    sessions[transport.sessionId] = transport;
    res.on("close", () => {
      delete sessions[transport.sessionId];
    });
    await server.connect(transport);
    return;
  }

  // ── Message endpoint ────────────────────────────────────────────────────────
  if (reqUrl.pathname === "/message" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const sessionId = reqUrl.searchParams.get("sessionId");
      const transport = sessions[sessionId];
      if (transport) {
        await transport.handlePostMessage(req, res, body);
      } else {
        res.writeHead(404);
        res.end("Session not found");
      }
    });
    return;
  }

  // ── Health check ────────────────────────────────────────────────────────────
  res.writeHead(200);
  res.end("AngelOne MCP server is running ✅");
});

httpServer.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
  console.log(`Public URL: ${PUBLIC_URL}`);
  console.log(`SSE endpoint: ${PUBLIC_URL}/sse`);
});