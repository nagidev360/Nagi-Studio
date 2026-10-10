import { useMemo, useState } from 'react';
import {
  Activity, ArrowDown, ArrowRight, Bell, Bot, Check, ChevronDown, CircleHelp,
  Clock3, Code2, Command, CreditCard, Discord, FilePlus2, Filter, Globe2,
  LayoutDashboard, MessageCircle, MoreHorizontal, Plus, Search, Settings,
  ShieldCheck, Sparkles, Terminal, Workflow, X, Zap
} from 'lucide-react';

type BotItem = { id: number; name: string; platform: 'Discord' | 'Telegram' | 'Web'; status: 'Running' | 'Draft' | 'Paused'; commands: number; updated: string };
const initialBots: BotItem[] = [
  { id: 1, name: 'Community Helper', platform: 'Discord', status: 'Running', commands: 18, updated: '4 min ago' },
  { id: 2, name: 'Welcome Assistant', platform: 'Telegram', status: 'Running', commands: 9, updated: 'Yesterday' },
  { id: 3, name: 'Support Flow', platform: 'Web', status: 'Draft', commands: 6, updated: '2 days ago' },
];
const nav = [
  { label: 'Workspace', items: [{ name: 'Overview', icon: LayoutDashboard }, { name: 'My bots', icon: Bot }, { name: 'Flow builder', icon: Workflow }, { name: 'Templates', icon: Sparkles }] },
  { label: 'Manage', items: [{ name: 'Activity logs', icon: Activity }, { name: 'Integrations', icon: Globe2 }, { name: 'Usage & plans', icon: CreditCard }] },
];
const templates = [
  { title: 'Welcome & roles', desc: 'Greet new members and guide them to the right channels.', tag: 'Discord', icon: MessageCircle },
  { title: 'FAQ assistant', desc: 'Answer common questions with buttons and smart replies.', tag: 'Multi-platform', icon: Sparkles },
  { title: 'Daily reminders', desc: 'Schedule helpful updates and recurring messages.', tag: 'Telegram', icon: Clock3 },
];
function App() {
  const [active, setActive] = useState('Overview');
  const [bots, setBots] = useState(initialBots);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All platforms');
  const [showCreate, setShowCreate] = useState(false);
  const [botName, setBotName] = useState('');
  const [botPlatform, setBotPlatform] = useState<'Discord' | 'Telegram' | 'Web'>('Discord');
  const [toast, setToast] = useState('');
  const filtered = useMemo(() => bots.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) && (platform === 'All platforms' || b.platform === platform)), [bots, search, platform]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const createBot = () => {
    if (!botName.trim()) return;
    setBots(prev => [{ id: Date.now(), name: botName.trim(), platform: botPlatform, status: 'Draft', commands: 0, updated: 'Just now' }, ...prev]);
    setBotName(''); setShowCreate(false); setActive('My bots'); notify('Bot workspace created');
  };
  const pageTitle = active === 'Overview' ? 'Good morning, builder' : active;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Command size={21}/></div><div><strong>NagiStudio</strong><small>BOT WORKSPACE</small></div><button className="icon-button sidebar-collapse" aria-label="Close sidebar"><MoreHorizontal size={20}/></button></div>
      <button className="workspace-switch"><div className="workspace-avatar">N</div><span><b>Personal workspace</b><small>Free plan</small></span><ChevronDown size={16}/></button>
      {nav.map(group => <div className="nav-group" key={group.label}><p className="nav-label">{group.label}</p>{group.items.map(item => <button key={item.name} className={'nav-item '+(active === item.name ? 'selected' : '')} onClick={() => setActive(item.name)}><item.icon size={18}/><span>{item.name}</span>{item.name === 'My bots' && <em>{bots.length}</em>}</button>)}</div>)}
      <div className="sidebar-bottom"><div className="usage-card"><div className="usage-top"><span>Monthly usage</span><span>32%</span></div><div className="progress"><span/></div><small>3,200 of 10,000 actions used</small><button onClick={() => {setActive('Usage & plans'); notify('Usage details opened')}}>View usage <ArrowRight size={14}/></button></div><button className="nav-item" onClick={() => notify('Settings are coming soon')}><Settings size={18}/>Settings</button><button className="profile"><div className="profile-avatar">S</div><span><b>Studio owner</b><small>Free account</small></span><MoreHorizontal size={18}/></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{active}</b></div><div className="top-actions"><div className="status-pill"><span/> All systems operational</div><button className="icon-button notification" onClick={() => notify('You are all caught up')} aria-label="Notifications"><Bell size={18}/><i/></button><button className="help-button" onClick={() => notify('Help center is coming soon')}><CircleHelp size={17}/><span>Help center</span></button></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> YOUR AUTOMATION HQ</div><h1>{pageTitle}<span className="heading-dot">.</span></h1><p>{active === 'Overview' ? 'Build smarter bots, automate conversations, and keep everything in sync.' : active === 'Flow builder' ? 'Design a conversation flow with visual blocks.' : 'Manage your automation workspace in one place.'}</p></div><button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17}/> Create a bot</button></div>
        {active === 'Flow builder' ? <FlowBuilder notify={notify}/> : active === 'Templates' ? <section className="templates-grid">{templates.map(t => <article className="template-card" key={t.title}><div className="template-icon"><t.icon size={22}/></div><span className="tag">{t.tag}</span><h3>{t.title}</h3><p>{t.desc}</p><button className="text-button" onClick={() => {setBotName(t.title);setShowCreate(true)}}>Use template <ArrowRight size={15}/></button></article>)}</section> : <>
          <section className="stats-grid">
            <Stat title="Total bots" value={String(bots.length).padStart(2,'0')} note="+2 this month" icon={Bot} tone="purple"/>
            <Stat title="Active automations" value={String(bots.filter(b=>b.status==='Running').length*12+6)} note="Across all bots" icon={Zap} tone="blue"/>
            <Stat title="Actions this month" value="3.2k" note="+18.4% vs last month" icon={Activity} tone="green"/>
            <Stat title="Uptime" value="99.9%" note="Last 30 days" icon={ShieldCheck} tone="orange"/>
          </section>
          <section className="quick-grid"><button className="quick-card" onClick={() => setActive('Flow builder')}><div className="quick-icon violet"><Workflow size={21}/></div><div><b>Visual flow builder</b><p>Connect blocks. Build a workflow.</p></div><ArrowRight size={17}/></button><button className="quick-card" onClick={() => setActive('Templates')}><div className="quick-icon blue"><FilePlus2 size={21}/></div><div><b>Start from a template</b><p>Launch faster with a blueprint.</p></div><ArrowRight size={17}/></button><button className="quick-card" onClick={() => setActive('Integrations')}><div className="quick-icon green"><Globe2 size={21}/></div><div><b>Connect a platform</b><p>Set up your bot integrations.</p></div><ArrowRight size={17}/></button></section>
          <section className="bots-panel"><div className="panel-heading"><div><h2>Your bots</h2><p>Manage, monitor, and improve your bots.</p></div><button className="secondary-button" onClick={() => setActive('My bots')}>View all bots <ArrowRight size={15}/></button></div><div className="filters"><div className="search-field"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bots..." /></div><div className="select-wrap"><Filter size={15}/><select value={platform} onChange={e=>setPlatform(e.target.value)}><option>All platforms</option><option>Discord</option><option>Telegram</option><option>Web</option></select><ChevronDown size={14}/></div><button className="icon-button filter-more" onClick={() => {setSearch('');setPlatform('All platforms')}} aria-label="Clear filters"><X size={16}/></button></div>
            <div className="bot-list">{filtered.map(bot => <div className="bot-row" key={bot.id}><div className={'bot-platform '+bot.platform.toLowerCase()}>{bot.platform==='Discord' ? <MessageCircle size={21}/> : bot.platform==='Telegram' ? <ArrowDown size={21}/> : <Globe2 size={21}/>}</div><div className="bot-main"><b>{bot.name}</b><span>{bot.platform} <i>·</i> {bot.commands} commands</span></div><div className={'bot-status '+bot.status.toLowerCase()}><span/>{bot.status}</div><div className="bot-updated"><small>Last updated</small><span>{bot.updated}</span></div><button className="icon-button row-more" onClick={() => notify(bot.name+' options opened')} aria-label={'More options for '+bot.name}><MoreHorizontal size={20}/></button></div>)}{filtered.length===0 && <div className="empty-state"><Bot size={28}/><b>No bots found</b><span>Try another search or create a new bot.</span></div>}</div>
          </section>
          <section className="bottom-grid"><div className="activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>What's happening in your workspace.</p></div><button className="icon-button" onClick={()=>setActive('Activity logs')} aria-label="View activity"><ArrowRight size={17}/></button></div><div className="activity-item"><div className="activity-symbol success"><Check size={15}/></div><div><b>Community Helper is online</b><p>Connection health check passed</p></div><time>4m</time></div><div className="activity-item"><div className="activity-symbol info"><Code2 size={15}/></div><div><b>Welcome flow updated</b><p>2 blocks changed by Studio owner</p></div><time>1h</time></div><div className="activity-item"><div className="activity-symbol neutral"><Terminal size={15}/></div><div><b>New workspace created</b><p>Your NagiStudio workspace is ready</p></div><time>1d</time></div></div><div className="upgrade-panel"><div className="upgrade-orb"><Sparkles size={24}/></div><span className="upgrade-label">MAKE MORE POSSIBLE</span><h2>Ready to scale up?</h2><p>Unlock more bots, advanced workflows, and deeper analytics as your projects grow.</p><button onClick={()=>{setActive('Usage & plans');notify('Plan options opened')}}>Explore plans <ArrowRight size={15}/></button><div className="upgrade-decoration">N</div></div></section>
        </>}
        <footer><span>© 2026 NagiStudio</span><span><span className="footer-dot"/> Built for builders <span className="footer-sep">·</span> <a href="https://github.com/nagidev360/Nagi-Studio" target="_blank" rel="noreferrer">GitHub</a></span></footer>
      </div>
    </main>
    {showCreate && <div className="modal-backdrop" onClick={()=>setShowCreate(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-top"><div className="modal-icon"><Bot size={22}/></div><button className="icon-button" onClick={()=>setShowCreate(false)} aria-label="Close"><X size={18}/></button></div><h2>Create a new bot</h2><p>Set up a workspace for your next automation. You can connect credentials later in a secure backend.</p><label>Bot name</label><input className="modal-input" autoFocus value={botName} onChange={e=>setBotName(e.target.value)} placeholder="e.g. Community Helper" onKeyDown={e=>e.key==='Enter'&&createBot()}/><label>Platform</label><div className="platform-options">{(['Discord','Telegram','Web'] as const).map(p=><button key={p} className={botPlatform===p?'platform-option chosen':'platform-option'} onClick={()=>setBotPlatform(p)}><span className={'mini-platform '+p.toLowerCase()}>{p==='Discord'?<MessageCircle size={16}/>:p==='Telegram'?<ArrowDown size={16}/>:<Globe2 size={16}/>}</span>{p}{botPlatform===p&&<Check size={15}/>}</button>)}</div><button className="primary-button modal-submit" onClick={createBot} disabled={!botName.trim()}><Plus size={17}/> Create bot workspace</button><small className="modal-note"><ShieldCheck size={13}/> Tokens are not requested or stored in this demo.</small></div></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}
function Stat({title,value,note,icon:Icon,tone}:{title:string;value:string;note:string;icon:typeof Bot;tone:string}) {
  return <article className="stat-card"><div className="stat-top"><span>{title}</span><div className={'stat-icon '+tone}><Icon size={18}/></div></div><div className="stat-value">{value}</div><div className="stat-note"><span className="note-dot"/> {note}</div></article>;
}
function FlowBuilder({notify}:{notify:(s:string)=>void}) {
  return <section className="builder-panel"><div className="builder-toolbar"><div><h2>Welcome flow</h2><p>Draft workflow <span className="draft-label">Unsaved changes</span></p></div><div className="builder-actions"><button className="secondary-button" onClick={()=>notify('Workflow saved locally for this preview')}><Check size={15}/> Save draft</button><button className="primary-button" onClick={()=>notify('Connect a platform to publish this flow')}><Zap size={15}/> Publish flow</button></div></div><div className="flow-canvas"><div className="canvas-grid"/><div className="flow-node trigger"><div className="node-head"><span className="node-icon"><Zap size={15}/></span><span>TRIGGER</span><MoreHorizontal size={17}/></div><b>New member joins</b><p>When a member enters the server</p><div className="node-port"><span/> Event received</div></div><div className="flow-connector"><span/><ArrowDown size={16}/><span/></div><div className="flow-node message"><div className="node-head"><span className="node-icon"><MessageCircle size={15}/></span><span>SEND MESSAGE</span><MoreHorizontal size={17}/></div><b>Send welcome message</b><p>Hey {'{{user.name}}'}, welcome aboard!</p><div className="node-port"><span/> Message sent</div></div><div className="flow-connector"><span/><ArrowDown size={16}/><span/></div><div className="flow-node condition"><div className="node-head"><span className="node-icon"><Filter size={15}/></span><span>CONDITION</span><MoreHorizontal size={17}/></div><b>Has verified role?</b><p>Branch based on member role</p><div className="branch-pills"><span>Yes</span><span>No</span></div></div><button className="add-node" onClick={()=>notify('Choose a block from the block library to add it')}><Plus size={18}/> Add block</button><div className="canvas-hint"><Workflow size={15}/> Drag-and-drop editing is on the roadmap</div></div><div className="block-library"><b>Block library</b><span>Start with a building block</span><button onClick={()=>notify('Trigger block selected')}><Zap size={16}/> Trigger <Plus size={14}/></button><button onClick={()=>notify('Message block selected')}><MessageCircle size={16}/> Send message <Plus size={14}/></button><button onClick={()=>notify('Condition block selected')}><Filter size={16}/> Condition <Plus size={14}/></button><button onClick={()=>notify('Code block selected')}><Code2 size={16}/> Run code <Plus size={14}/></button></div></section>;
}
export default App;