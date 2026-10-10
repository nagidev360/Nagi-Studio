import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { Bot, CheckCircle2, CircleAlert, LoaderCircle, LockKeyhole, LogIn, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://missing-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-anon-key";
const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_API_URL);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Integration = { id: string; platform: "discord" | "telegram"; bot_name: string; platform_id: string; created_at: string };

export default function IntegrationsPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState<"discord" | "telegram">("discord");
  const [token, setToken] = useState("");
  const [items, setItems] = useState<Integration[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    if (!session?.access_token) throw new Error("Please sign in again.");
    const response = await fetch(apiUrl + path, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...(init.headers || {}) }
    });
    if (response.status === 204) return null;
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "The request failed.");
    return body;
  }, [session]);

  const load = useCallback(async () => {
    if (!session) return;
    setBusy(true); setError("");
    try {
      const result = await api("/api/integrations");
      setItems(result.integrations || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load integrations."); }
    finally { setBusy(false); }
  }, [api, session]);

  useEffect(() => { void load(); }, [load]);

  const authenticate = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) setNotice("Check your email to confirm your account, then sign in.");
      else setNotice("Signed in successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : "Authentication failed."); }
    finally { setBusy(false); }
  };

  const connect = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const result = await api("/api/integrations/connect", { method: "POST", body: JSON.stringify({ platform, token }) });
      setItems(old => [result.integration, ...old.filter(item => item.id !== result.integration.id)]);
      setToken(""); setNotice(result.message || "Integration connected.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not connect bot."); }
    finally { setBusy(false); }
  };

  const disconnect = async (id: string) => {
    setBusy(true); setError(""); setNotice("");
    try { await api("/api/integrations/" + id, { method: "DELETE" }); setItems(old => old.filter(item => item.id !== id)); setNotice("Integration disconnected."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not disconnect integration."); }
    finally { setBusy(false); }
  };

  return <section className="integrations-view">
    {!configured && <div className="integration-alert"><CircleAlert size={18}/><div><b>Deployment configuration required</b><p>Set VITE_API_URL, VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the frontend environment before using integrations.</p></div></div>}
    <div className="integration-intro"><div className="integration-lock"><LockKeyhole size={24}/></div><div><h2>Secure platform connections</h2><p>Sign in, verify a bot token with its official API, and store it encrypted on the backend. Tokens are never returned to the browser after saving.</p></div></div>
    {!session ? <form className="integration-card auth-card" onSubmit={authenticate}>
      <h3>{mode === "signin" ? "Sign in to NagiStudio" : "Create your account"}</h3><p>Your bot credentials are scoped to your account.</p>
      <label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com"/>
      <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters"/>
      <button className="primary-button integration-submit" disabled={busy || !configured}>{busy ? <LoaderCircle className="spin" size={16}/> : <LogIn size={16}/>} {mode === "signin" ? "Sign in" : "Create account"}</button>
      <button type="button" className="text-button auth-toggle" onClick={()=>setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "New here? Create an account" : "Already registered? Sign in"}</button>
    </form> : <>
      <div className="integration-toolbar"><div><CheckCircle2 size={17}/><span>Signed in as <b>{session.user.email}</b></span></div><button className="secondary-button" onClick={()=>supabase.auth.signOut()}>Sign out</button></div>
      <form className="integration-card connect-card" onSubmit={connect}>
        <div className="integration-card-heading"><div><h3>Connect a bot</h3><p>Use a bot token from the platform's official developer portal.</p></div><ShieldCheck size={22}/></div>
        <label>Platform</label><div className="platform-options"><button type="button" className={platform === "discord" ? "platform-option chosen" : "platform-option"} onClick={()=>setPlatform("discord")}><span className="mini-platform discord"><Bot size={16}/></span>Discord</button><button type="button" className={platform === "telegram" ? "platform-option chosen" : "platform-option"} onClick={()=>setPlatform("telegram")}><span className="mini-platform telegram"><Bot size={16}/></span>Telegram</button></div>
        <label>Bot token</label><input type="password" value={token} onChange={e=>setToken(e.target.value)} autoComplete="off" spellCheck={false} required placeholder={platform === "discord" ? "Discord bot token" : "Telegram BotFather token"}/>
        <div className="secure-note"><LockKeyhole size={14}/> Sent over HTTPS, validated with the platform API, then encrypted at rest.</div>
        <button className="primary-button integration-submit" disabled={busy || !configured || !token.trim()}>{busy ? <LoaderCircle className="spin" size={16}/> : <Plus size={16}/>} Verify and connect</button>
      </form>
      <div className="integration-card saved-card"><div className="integration-card-heading"><div><h3>Connected bots</h3><p>Only safe metadata is shown here.</p></div><button className="icon-button" onClick={()=>void load()} aria-label="Refresh integrations"><RefreshCw size={17}/></button></div>
        {busy && <p className="integration-empty">Loading…</p>}
        {!busy && items.length === 0 && <p className="integration-empty">No bots connected yet. Connect a token above to get started.</p>}
        {items.map(item=><div className="saved-integration" key={item.id}><span className={"mini-platform "+item.platform}><Bot size={17}/></span><div><b>{item.bot_name}</b><small>{item.platform === "discord" ? "Discord" : "Telegram"} · ID {item.platform_id}</small></div><span className="connected-status"><i/> Verified</span><button className="icon-button disconnect-button" onClick={()=>void disconnect(item.id)} disabled={busy} aria-label={"Disconnect "+item.bot_name}><Trash2 size={16}/></button></div>)}
      </div>
    </>}
    {notice && <p className="integration-message success-message"><CheckCircle2 size={16}/>{notice}</p>}
    {error && <p className="integration-message error-message"><CircleAlert size={16}/>{error}</p>}
    <div className="integration-footnote"><ShieldCheck size={16}/><span><b>Security note:</b> Never commit bot tokens or Supabase service-role keys to GitHub. Rotate any token that has been exposed. Connecting verifies and securely stores credentials; message handling/always-on bot workers require a separate runtime feature.</span></div>
  </section>;
}
