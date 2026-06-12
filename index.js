import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import * as OTPAuth from "otpauth";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const BASE_URL = "https://apiconnect.angelone.in";
let authToken = null;
let feedToken = null;

// ── helpers ──────────────────────────────────────────────────────────────────

function generateTOTP(secret) {
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret), digits: 6, period: 30 });
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
  if (!res.data?.data?.jwtToken) throw new Error(res.data?.message || "Login failed");
  authToken = res.data.data.jwtToken;
  feedToken = res.data.data.feedToken;
  return "Logged in successfully";
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

server.tool("get_holdings", "Get all stock holdings with current value and P&L", {}, async () => {
  const data = await get("/rest/secure/angelbroking/portfolio/v1/getHolding");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("get_positions", "Get today's open positions", {}, async () => {
  const data = await get("/rest/secure/angelbroking/order/v1/getPosition");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("get_funds", "Get account funds and available margin", {}, async () => {
  const data = await get("/rest/secure/angelbroking/user/v1/getRMS");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("get_profile", "Get account profile information", {}, async () => {
  const data = await get("/rest/secure/angelbroking/user/v1/getProfile");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("get_order_book", "Get today's order book", {}, async () => {
  const data = await get("/rest/secure/angelbroking/order/v1/getOrderBook");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool("get_trade_book", "Get today's executed trades", {}, async () => {
  const data = await get("/rest/secure/angelbroking/order/v1/getTradeBook");
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
      { headers: headers() }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
  }
);

// ── start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
