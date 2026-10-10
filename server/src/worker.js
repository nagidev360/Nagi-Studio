import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Telegraf } from "telegraf";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "TOKEN_ENCRYPTION_KEY"];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
const keyText = process.env.TOKEN_ENCRYPTION_KEY;
const key = /^[a-f0-9]{64}$/i.test(keyText) ? Buffer.from(keyText, "hex") : Buffer.from(keyText, "base64");
if (key.length !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes.");
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const running = new Map();
const decrypt = row => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(row.token_iv, "base64"));
  decipher.setAuthTag(Buffer.from(row.token_tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(row.encrypted_token, "base64")), decipher.final()]).toString("utf8");
};

async function startIntegration(row) {
  const token = decrypt(row);
  if (row.platform === "telegram") {
    const bot = new Telegraf(token);
    bot.start(ctx => ctx.reply("NagiStudio bot is connected. Try /help to see commands."));
    bot.help(ctx => ctx.reply("Available commands: /start, /ping, /help"));
    bot.command("ping", ctx => ctx.reply("Pong! NagiStudio is online."));
    bot.catch(err => console.error("Telegram update handler failed for integration", row.id, err?.message || "unknown error"));
    await bot.launch();
    running.set(row.id, { platform: row.platform, instance: bot, stop: () => bot.stop("integration removed") });
  } else if (row.platform === "discord") {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
      partials: [Partials.Channel]
    });
    client.on("messageCreate", async message => {
      if (message.author.bot || !message.content.startsWith("!")) return;
      const command = message.content.slice(1).trim().split(/\s+/)[0]?.toLowerCase();
      if (command === "ping") await message.reply("Pong! NagiStudio is online.").catch(() => {});
      if (command === "help") await message.reply("Available commands: !ping, !help").catch(() => {});
    });
    client.on("error", err => console.error("Discord client error for integration", row.id, err?.message || "unknown error"));
    await client.login(token);
    running.set(row.id, { platform: row.platform, instance: client, stop: () => client.destroy() });
  }
  console.log("Connected bot integration:", row.id, row.platform);
}

async function reconcile() {
  const { data, error } = await db.from("integrations").select("id,platform,encrypted_token,token_iv,token_tag");
  if (error) { console.error("Integration sync failed:", error.code || "database error"); return; }
  const rows = data || [];
  const currentIds = new Set(rows.map(row => row.id));
  for (const [id, bot] of running) {
    if (!currentIds.has(id)) {
      try { bot.stop(); } catch {}
      running.delete(id);
      console.log("Disconnected removed integration:", id);
    }
  }
  for (const row of rows) {
    if (running.has(row.id)) continue;
    try { await startIntegration(row); }
    catch (err) {
      const existing = running.get(row.id);
      if (existing) { try { existing.stop(); } catch {} running.delete(row.id); }
      console.error("Could not start integration", row.id, row.platform, err?.message || "unknown error");
    }
  }
}
let syncing = false;
async function safeReconcile() {
  if (syncing) return;
  syncing = true;
  try { await reconcile(); } finally { syncing = false; }
}
await safeReconcile();
const timer = setInterval(() => void safeReconcile(), 30_000);
async function shutdown() {
  clearInterval(timer);
  for (const [id, bot] of running) { try { bot.stop(); } catch {} running.delete(id); }
  process.exit(0);
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
