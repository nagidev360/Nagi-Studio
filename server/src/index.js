import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "TOKEN_ENCRYPTION_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
const keyText = process.env.TOKEN_ENCRYPTION_KEY;
const encryptionKey = /^[a-f0-9]{64}$/i.test(keyText) ? Buffer.from(keyText, "hex") : Buffer.from(keyText, "base64");
if (encryptionKey.length !== 32) {
  console.error("TOKEN_ENCRYPTION_KEY must be a 32-byte key encoded as 64 hex characters or base64.");
  process.exit(1);
}

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const app = express();
app.disable("x-powered-by");
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"]
}));
app.use(express.json({ limit: "12kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }));

function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return { encrypted_token: ciphertext.toString("base64"), token_iv: iv.toString("base64"), token_tag: cipher.getAuthTag().toString("base64") };
}

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: "Sign in to continue." });
    const { data, error } = await db.auth.getUser(match[1]);
    if (error || !data?.user) return res.status(401).json({ error: "Session expired. Please sign in again." });
    req.user = data.user;
    next();
  } catch {
    return res.status(401).json({ error: "Could not verify your session." });
  }
}

async function verifyPlatformToken(platform, token) {
  if (platform === "telegram") {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`, { signal: AbortSignal.timeout(10_000) });
    const body = await response.json();
    if (!response.ok || !body.ok || !body.result?.id) throw new Error("Telegram rejected this bot token. Check it in BotFather.");
    return { name: body.result.username ? `@${body.result.username}` : body.result.first_name, platform_id: String(body.result.id) };
  }
  if (platform === "discord") {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}`, "User-Agent": "NagiStudio/1.0" },
      signal: AbortSignal.timeout(10_000)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.id || !body.bot) throw new Error("Discord rejected this bot token. Copy the token from the Discord Developer Portal.");
    return { name: body.global_name || body.username || "Discord bot", platform_id: String(body.id) };
  }
  throw new Error("Platform must be discord or telegram.");
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "nagistudio-api" }));

app.get("/api/integrations", requireUser, async (req, res) => {
  const { data, error } = await db.from("integrations")
    .select("id,platform,bot_name,platform_id,created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Could not load integrations." });
  return res.json({ integrations: data || [] });
});

app.post("/api/integrations/connect", requireUser, async (req, res) => {
  const platform = String(req.body?.platform || "").toLowerCase();
  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  if (!["discord", "telegram"].includes(platform)) return res.status(400).json({ error: "Choose Discord or Telegram." });
  if (!token || token.length > 500) return res.status(400).json({ error: "Enter a valid bot token." });
  try {
    const verified = await verifyPlatformToken(platform, token);
    const encrypted = encryptToken(token);
    const { data, error } = await db.from("integrations").insert({
      user_id: req.user.id,
      platform,
      bot_name: verified.name,
      platform_id: verified.platform_id,
      ...encrypted
    }).select("id,platform,bot_name,platform_id,created_at").single();
    if (error) {
      console.error("Integration insert failed:", error.code || "database error");
      return res.status(500).json({ error: "Token verified, but saving the integration failed. Check the Supabase migration." });
    }
    return res.status(201).json({ integration: data, message: "Token verified and stored encrypted." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify token.";
    return res.status(400).json({ error: message });
  }
});

app.delete("/api/integrations/:id", requireUser, async (req, res) => {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(400).json({ error: "Invalid integration ID." });
  const { error, count } = await db.from("integrations").delete({ count: "exact" })
    .eq("id", req.params.id).eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: "Could not disconnect integration." });
  if (!count) return res.status(404).json({ error: "Integration not found." });
  return res.status(204).end();
});

app.use((err, _req, res, _next) => {
  if (err?.message === "Origin not allowed by CORS") return res.status(403).json({ error: "Origin not allowed." });
  console.error("Unhandled API error:", err?.message || "unknown");
  res.status(500).json({ error: "Unexpected server error." });
});
const port = Number(process.env.PORT || 10000);
app.listen(port, "0.0.0.0", () => console.log(`NagiStudio API listening on ${port}`));
