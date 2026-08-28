'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  Filter,
  HelpCircle,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  PackageOpen,
  Search,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users,
  X,
} from 'lucide-react'

type Role = 'Student' | 'Facilities Admin' | 'Dean'
type View = 'Dashboard' | 'Report Issue' | 'Lost & Found' | 'My Reports' | 'Department Queue' | 'Escalated Issues'
type Status = 'Reported' | 'Acknowledged' | 'In Progress' | 'Resolved'
type Category = 'Maintenance' | 'IT' | 'Security' | 'Cleaning' | 'Other'

type Issue = { id: string; title: string; category: Category; building: string; status: Status; severity: 'Low' | 'Medium' | 'High'; date: string; daysOpen: number; owner: string; department: string; anonymous?: boolean }
type FoundItem = { id: string; type: 'Lost' | 'Found'; title: string; category: string; location: string; date: string; owner: string; matched?: number }

const initialIssues: Issue[] = [
  { id: 'CF-1048', title: 'Water leak on third floor', category: 'Maintenance', building: 'Hawthorne Hall', status: 'In Progress', severity: 'High', date: 'Aug 25, 2026', daysOpen: 3, owner: 'Maya Patel', department: 'Facilities' },
  { id: 'CF-1047', title: 'Projector not connecting to Wi-Fi', category: 'IT', building: 'Science Center', status: 'Acknowledged', severity: 'Medium', date: 'Aug 23, 2026', daysOpen: 5, owner: 'Maya Patel', department: 'IT Services' },
  { id: 'CF-1046', title: 'Broken light near north entrance', category: 'Maintenance', building: 'Student Union', status: 'Resolved', severity: 'Low', date: 'Aug 11, 2026', daysOpen: 8, owner: 'Jordan Lee', department: 'Facilities' },
  { id: 'CF-1032', title: 'Suspicious activity by parking deck', category: 'Security', building: 'North Parking Deck', status: 'Reported', severity: 'High', date: 'Aug 08, 2026', daysOpen: 20, owner: 'Anonymous', department: 'Campus Safety', anonymous: true },
  { id: 'CF-1029', title: 'Graffiti in east stairwell', category: 'Cleaning', building: 'Library', status: 'Reported', severity: 'Medium', date: 'Aug 05, 2026', daysOpen: 23, owner: 'Jordan Lee', department: 'Facilities' },
]

const initialItems: FoundItem[] = [
  { id: 'LF-201', type: 'Found', title: 'Blue Hydro Flask', category: 'Drinkware', location: 'Student Union', date: 'Aug 27, 2026', owner: 'CampusFix Desk', matched: 96 },
  { id: 'LF-202', type: 'Lost', title: 'Silver MacBook charger', category: 'Electronics', location: 'Science Center', date: 'Aug 26, 2026', owner: 'Maya Patel', matched: 88 },
  { id: 'LF-203', type: 'Found', title: 'Black wireless earbuds', category: 'Electronics', location: 'Library', date: 'Aug 22, 2026', owner: 'CampusFix Desk', matched: 74 },
]

const navFor = (role: Role): View[] => role === 'Student' ? ['Dashboard', 'Report Issue', 'Lost & Found', 'My Reports'] : role === 'Facilities Admin' ? ['Dashboard', 'Department Queue', 'Lost & Found'] : ['Dashboard', 'Escalated Issues', 'Lost & Found']
const statusOrder: Status[] = ['Reported', 'Acknowledged', 'In Progress', 'Resolved']

// Placeholder boundary: replace this deterministic classifier with an AI API call later.
function classifySeverity(text: string, category: Category): Issue['severity'] {
  const value = `${text} ${category}`.toLowerCase()
  if (/fire|danger|threat|flood|leak|emergency|suspicious|unsafe/.test(value)) return 'High'
  if (/broken|urgent|outage|blocked|noise|stuck/.test(value)) return 'Medium'
  return 'Low'
}

// Placeholder boundary: replace with embedding/search API later; currently ranks category, location, and date overlap.
function rankMatches(item: FoundItem, all: FoundItem[]) {
  return all.filter((candidate) => candidate.id !== item.id).map((candidate) => {
    let score = 20
    if (candidate.category === item.category) score += 45
    if (candidate.location === item.location) score += 25
    if (candidate.date === item.date) score += 20
    return { ...candidate, matched: Math.min(score, 99) }
  }).sort((a, b) => (b.matched ?? 0) - (a.matched ?? 0))
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function StatCard({ icon: Icon, label, value, detail, tone = 'blue' }: { icon: typeof BarChart3; label: string; value: string; detail: string; tone?: string }) {
  return <div className="stat-card"><div className={`stat-icon stat-${tone}`}><Icon size={19} /></div><div><p className="eyebrow">{label}</p><p className="stat-value">{value}</p><p className="stat-detail">{detail}</p></div></div>
}

export default function CampusFixApp() {
  const [role, setRole] = useState<Role>('Student')
  const [view, setView] = useState<View>('Dashboard')
  const [issues, setIssues] = useState(initialIssues)
  const [items, setItems] = useState(initialItems)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState('')
  const nav = navFor(role)
  const escalated = issues.filter((issue) => issue.daysOpen > 10 && issue.status !== 'Resolved')
  const activeView = nav.includes(view) ? view : 'Dashboard'
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }

  function changeRole(next: Role) { setRole(next); setView('Dashboard'); setSidebarOpen(false) }
  function updateIssue(id: string, patch: Partial<Issue>) { setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, ...patch } : issue)); showToast('Ticket updated in the department queue') }

  return <div className="campus-app">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Building2 size={20} /></div><div><strong>Campus<span>Fix</span></strong><small>Make campus better.</small></div><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="role-switch"><label htmlFor="role">Viewing as</label><div className="select-wrap"><select id="role" value={role} onChange={(event) => changeRole(event.target.value as Role)}><option>Student</option><option>Facilities Admin</option><option>Dean</option></select><ChevronDown size={15} /></div></div>
      <nav aria-label="Main navigation"><p className="nav-label">Workspace</p>{nav.map((item) => <button key={item} className={`nav-item ${activeView === item ? 'nav-active' : ''}`} onClick={() => { setView(item); setSidebarOpen(false) }}>{item === 'Dashboard' ? <LayoutDashboard size={18} /> : item === 'Report Issue' ? <AlertTriangle size={18} /> : item === 'Lost & Found' ? <PackageOpen size={18} /> : item === 'My Reports' ? <ClipboardList size={18} /> : item === 'Department Queue' ? <Building2 size={18} /> : <ShieldAlert size={18} />}{item}{item === 'Escalated Issues' && <span className="nav-count">{escalated.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><HelpCircle size={18} /><div><strong>Need help?</strong><p>Campus support is here.</p></div><ArrowUpRight size={15} /></div><div className="user-mini"><div className="avatar">MP</div><div><strong>Maya Patel</strong><small>maya@campus.edu</small></div><MoreHorizontal size={17} /></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumb"><span>CampusFix</span><span>/</span><strong>{activeView}</strong></div><div className="top-actions"><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><div className="avatar avatar-small">MP</div></div></header>
      <div className="page-content">
        {activeView === 'Dashboard' && <Dashboard role={role} issues={issues} items={items} escalated={escalated} onNavigate={setView} />}
        {activeView === 'Report Issue' && <ReportIssue onSubmit={(issue) => { setIssues((current) => [issue, ...current]); showToast(`Report ${issue.id} created — classified ${issue.severity} severity`); setView('My Reports') }} />}
        {activeView === 'My Reports' && <MyReports issues={issues.filter((issue) => issue.owner === 'Maya Patel' || issue.owner === 'Anonymous')} />}
        {activeView === 'Department Queue' && <DepartmentQueue issues={issues} onUpdate={updateIssue} />}
        {activeView === 'Escalated Issues' && <EscalatedIssues issues={escalated} onUpdate={updateIssue} />}
        {activeView === 'Lost & Found' && <LostFound items={items} onSubmit={(item) => { setItems((current) => [item, ...current]); showToast('Lost & Found report posted'); }} />}
      </div>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>
}

function Dashboard({ role, issues, items, escalated, onNavigate }: { role: Role; issues: Issue[]; items: FoundItem[]; escalated: Issue[]; onNavigate: (view: View) => void }) {
  const resolved = issues.filter((issue) => issue.status === 'Resolved').length
  return <><div className="page-heading"><div><p className="kicker">Thursday, August 28, 2026</p><h1>{role === 'Student' ? 'Good morning, Maya.' : role === 'Dean' ? 'Campus pulse.' : 'Operations overview.'}</h1><p className="subheading">{role === 'Student' ? 'Keep your campus moving forward, one report at a time.' : role === 'Dean' ? 'A clear view of the issues that need your attention.' : 'Track, triage, and resolve what matters most.'}</p></div><button className="button button-primary" onClick={() => onNavigate(role === 'Student' ? 'Report Issue' : role === 'Dean' ? 'Escalated Issues' : 'Department Queue')}>{role === 'Student' ? 'Report an issue' : role === 'Dean' ? 'View escalations' : 'Open queue'}<ArrowUpRight size={16} /></button></div>
    <section className="stat-grid"><StatCard icon={CheckCircle2} label="Issues resolved" value={`${resolved + 126}`} detail="This month · +18% vs last month" tone="green" /><StatCard icon={PackageOpen} label="Items reunited" value="48" detail="This month · 6 this week" tone="blue" /><StatCard icon={Clock3} label="Avg. resolution time" value="2.4 days" detail="Down 0.6 days this month" tone="amber" /><StatCard icon={role === 'Dean' ? ShieldAlert : ClipboardList} label={role === 'Dean' ? 'Needs attention' : 'Your open reports'} value={role === 'Dean' ? `${escalated.length}` : `${issues.filter((i) => i.owner === 'Maya Patel' && i.status !== 'Resolved').length}`} detail={role === 'Dean' ? 'Open longer than 10 days' : 'Across 3 categories'} tone="red" /></section>
    <div className="dashboard-grid"><PublicDashboard issues={issues} />{role === 'Student' ? <StudentActivity issues={issues} items={items} onNavigate={onNavigate} /> : role === 'Dean' ? <EscalationPreview issues={escalated} onNavigate={onNavigate} /> : <QueuePreview issues={issues} onNavigate={onNavigate} />}</div>
  </>
}

function PublicDashboard({ issues }: { issues: Issue[] }) { const bars = [{ label: 'Facilities', value: 82, time: '1.8d' }, { label: 'IT Services', value: 64, time: '2.4d' }, { label: 'Campus Safety', value: 46, time: '3.1d' }, { label: 'Cleaning', value: 73, time: '2.0d' }]; return <section className="panel public-panel"><div className="panel-heading"><div><p className="eyebrow">Public dashboard</p><h2>Campus at a glance</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="public-stats"><div><span className="public-number">126</span><span className="public-label">resolved this month</span></div><div><span className="public-number">48</span><span className="public-label">items reunited</span></div></div><div className="chart-heading"><h3>Avg. resolution time</h3><span>by department</span></div><div className="bar-chart">{bars.map((bar) => <div className="bar-row" key={bar.label}><span>{bar.label}</span><div className="bar-track"><div style={{ width: `${bar.value}%` }} /></div><strong>{bar.time}</strong></div>)}</div><p className="panel-note"><Sparkles size={14} /> Based on resolved reports in the last 30 days</p></section> }

function StudentActivity({ issues, items, onNavigate }: { issues: Issue[]; items: FoundItem[]; onNavigate: (view: View) => void }) { return <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Your activity</p><h2>Recent reports</h2></div><button className="text-button" onClick={() => onNavigate('My Reports')}>View all <ArrowUpRight size={14} /></button></div>{issues.filter((issue) => issue.owner === 'Maya Patel').slice(0, 3).map((issue) => <div className="activity-row" key={issue.id}><div className="activity-icon"><FileText size={17} /></div><div className="activity-copy"><strong>{issue.title}</strong><span>{issue.id} · {issue.building}</span></div><Badge tone={issue.status === 'Resolved' ? 'green' : issue.status === 'In Progress' ? 'blue' : 'amber'}>{issue.status}</Badge></div>)}<div className="mini-callout"><div className="callout-icon"><PackageOpen size={18} /></div><div><strong>Found something?</strong><p>Help reunite it with its owner.</p></div><button className="text-button" onClick={() => onNavigate('Lost & Found')}>Post item <ArrowUpRight size={14} /></button></div></section> }

function QueuePreview({ issues, onNavigate }: { issues: Issue[]; onNavigate: (view: View) => void }) { return <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Facilities operations</p><h2>Queue snapshot</h2></div><button className="text-button" onClick={() => onNavigate('Department Queue')}>Open queue <ArrowUpRight size={14} /></button></div><div className="queue-summary"><div><strong>{issues.filter(i => i.status !== 'Resolved').length}</strong><span>open tickets</span></div><div><strong>{issues.filter(i => i.severity === 'High').length}</strong><span>high severity</span></div><div><strong>2.4d</strong><span>avg. resolution</span></div></div>{issues.slice(0, 3).map((issue) => <div className="activity-row" key={issue.id}><div className="activity-icon"><Building2 size={17} /></div><div className="activity-copy"><strong>{issue.title}</strong><span>{issue.id} · {issue.department}</span></div><Badge tone={issue.severity === 'High' ? 'red' : 'amber'}>{issue.severity}</Badge></div>)}</section> }
function EscalationPreview({ issues, onNavigate }: { issues: Issue[]; onNavigate: (view: View) => void }) { return <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Dean&apos;s office</p><h2>Escalated issues</h2></div><button className="text-button" onClick={() => onNavigate('Escalated Issues')}>Review all <ArrowUpRight size={14} /></button></div>{issues.slice(0, 4).map((issue) => <div className="activity-row" key={issue.id}><div className="activity-icon alert-icon"><ShieldAlert size={17} /></div><div className="activity-copy"><strong>{issue.title}</strong><span>{issue.building} · {issue.daysOpen} days open</span></div><Badge tone="red">Escalated</Badge></div>)}{issues.length === 0 && <div className="empty-state"><CheckCircle2 size={24} /><p>Nothing needs escalation right now.</p></div>}</section> }

function ReportIssue({ onSubmit }: { onSubmit: (issue: Issue) => void }) { const [category, setCategory] = useState<Category>('Maintenance'); const [building, setBuilding] = useState('Hawthorne Hall'); const [description, setDescription] = useState(''); const [anonymous, setAnonymous] = useState(false); const [photo, setPhoto] = useState(''); const severity = classifySeverity(description, category); return <div className="form-page"><div className="page-heading compact"><div><p className="kicker">Student services</p><h1>Report an issue</h1><p className="subheading">Tell us what&apos;s happening and we&apos;ll route it to the right team.</p></div></div><form className="form-card" onSubmit={(event) => { event.preventDefault(); const issue: Issue = { id: `CF-${1050 + Math.floor(Math.random() * 40)}`, title: description.split('.')[0] || `${category} issue`, category, building, status: 'Reported', severity, date: 'Aug 28, 2026', daysOpen: 0, owner: anonymous ? 'Anonymous' : 'Maya Patel', department: category === 'IT' ? 'IT Services' : category === 'Security' ? 'Campus Safety' : 'Facilities', anonymous }; onSubmit(issue) }}><div className="form-section"><div className="form-section-title"><span>01</span><div><h2>What&apos;s going on?</h2><p>Give us a few details so we can help quickly.</p></div></div><label>Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="E.g. The hallway light outside room 302 is flickering..." rows={5} /></label><div className="form-grid"><label>Category<select value={category} onChange={(event) => setCategory(event.target.value as Category)}><option>Maintenance</option><option>IT</option><option>Security</option><option>Cleaning</option><option>Other</option></select></label><label>Building<select value={building} onChange={(event) => setBuilding(event.target.value)}><option>Hawthorne Hall</option><option>Science Center</option><option>Student Union</option><option>Library</option><option>North Parking Deck</option></select></label></div><div className="severity-preview"><Sparkles size={16} /><span>Smart triage suggests <strong>{severity} severity</strong> based on your description.</span></div>{category === 'Security' && <label className="toggle-label"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /><span className="toggle" /><span>Submit anonymously <small>Your identity will be hidden from the public report.</small></span></label>}</div><div className="form-section"><div className="form-section-title"><span>02</span><div><h2>Add a photo <em>optional</em></h2><p>A picture can help our team understand the issue.</p></div></div><label className="upload-box"><ImagePlus size={22} /><strong>{photo || 'Upload a photo'}</strong><span>PNG, JPG up to 10MB</span><input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0]?.name || '')} /></label></div><div className="form-actions"><button type="button" className="button button-ghost">Save draft</button><button type="submit" className="button button-primary">Submit report <ArrowUpRight size={16} /></button></div></form></div> }

function MyReports({ issues }: { issues: Issue[] }) { return <div><div className="page-heading compact"><div><p className="kicker">Student services</p><h1>My reports</h1><p className="subheading">Follow the progress of issues you&apos;ve raised.</p></div><button className="button button-ghost"><Filter size={16} /> Filter</button></div><section className="report-list">{issues.map((issue) => <ReportCard issue={issue} key={issue.id} />)}</section></div> }
function ReportCard({ issue }: { issue: Issue }) { return <article className="report-card"><div className="report-card-top"><div className="activity-icon"><FileText size={18} /></div><div className="report-main"><div className="report-title"><h2>{issue.title}</h2><Badge tone={issue.status === 'Resolved' ? 'green' : issue.status === 'In Progress' ? 'blue' : issue.status === 'Acknowledged' ? 'amber' : 'neutral'}>{issue.status}</Badge></div><p>{issue.id} · {issue.category} · {issue.building}</p></div><Badge tone={issue.severity === 'High' ? 'red' : issue.severity === 'Medium' ? 'amber' : 'green'}>{issue.severity} severity</Badge></div><div className="progress-line"><div className="progress-steps">{statusOrder.map((status, index) => <div className={statusOrder.indexOf(issue.status) >= index ? 'step done' : 'step'} key={status}><span>{statusOrder.indexOf(issue.status) >= index ? '✓' : index + 1}</span><small>{status}</small></div>)}</div></div></article> }

function DepartmentQueue({ issues, onUpdate }: { issues: Issue[]; onUpdate: (id: string, patch: Partial<Issue>) => void }) { const [filter, setFilter] = useState('All'); const queue = issues.filter((i) => i.department === 'Facilities' && (filter === 'All' || i.status === filter)); return <div><div className="page-heading compact"><div><p className="kicker">Facilities admin</p><h1>Department queue</h1><p className="subheading">Route and resolve reports assigned to Facilities.</p></div><button className="button button-primary"><ClipboardList size={16} /> Export queue</button></div><div className="queue-toolbar"><div className="queue-tabs">{['All', 'Reported', 'Acknowledged', 'In Progress', 'Resolved'].map((tab) => <button className={filter === tab ? 'active' : ''} onClick={() => setFilter(tab)} key={tab}>{tab}</button>)}</div><div className="search-box"><Search size={16} /><input placeholder="Search tickets" /></div></div><section className="table-card"><div className="ticket-table table-head"><span>Ticket</span><span>Location</span><span>Severity</span><span>Status</span><span>Owner</span><span /></div>{queue.map((issue) => <div className="ticket-table" key={issue.id}><div className="ticket-name"><div className="activity-icon"><FileText size={16} /></div><div><strong>{issue.title}</strong><small>{issue.id} · {issue.category}</small></div></div><span className="muted"><MapPin size={14} />{issue.building}</span><Badge tone={issue.severity === 'High' ? 'red' : issue.severity === 'Medium' ? 'amber' : 'green'}>{issue.severity}</Badge><select className="inline-select" value={issue.status} onChange={(event) => onUpdate(issue.id, { status: event.target.value as Status })}>{statusOrder.map((status) => <option key={status}>{status}</option>)}</select><span className="muted">{issue.owner}</span><button className="icon-button" aria-label="Reassign category" onClick={() => onUpdate(issue.id, { category: issue.category === 'Maintenance' ? 'Cleaning' : 'Maintenance' })}><MoreHorizontal size={18} /></button></div>)}</section></div> }

function EscalatedIssues({ issues, onUpdate }: { issues: Issue[]; onUpdate: (id: string, patch: Partial<Issue>) => void }) { return <div><div className="page-heading compact"><div><p className="kicker">Dean&apos;s office</p><h1>Escalated issues</h1><p className="subheading">Tickets open for more than 10 days are automatically flagged here.</p></div><div className="escalation-pill"><ShieldAlert size={17} /><strong>{issues.length}</strong> need attention</div></div><section className="escalated-grid">{issues.map((issue) => <article className="escalated-card" key={issue.id}><div className="escalated-card-top"><Badge tone="red">{issue.daysOpen} days open</Badge><button className="icon-button"><MoreHorizontal size={18} /></button></div><h2>{issue.title}</h2><p>{issue.id} · {issue.building}</p><div className="escalated-meta"><span><Users size={15} />{issue.owner}</span><span><Building2 size={15} />{issue.department}</span></div><div className="escalated-footer"><Badge tone={issue.severity === 'High' ? 'red' : 'amber'}>{issue.severity} severity</Badge><select className="inline-select" value={issue.status} onChange={(event) => onUpdate(issue.id, { status: event.target.value as Status })}>{statusOrder.map((status) => <option key={status}>{status}</option>)}</select></div></article>)}</section>{issues.length === 0 && <div className="empty-state large"><CheckCircle2 size={32} /><h2>All clear</h2><p>No reports have been open longer than 10 days.</p></div>}</div> }

function LostFound({ items, onSubmit }: { items: FoundItem[]; onSubmit: (item: FoundItem) => void }) { const [type, setType] = useState<'Lost' | 'Found'>('Lost'); const [title, setTitle] = useState(''); const [category, setCategory] = useState('Electronics'); const [location, setLocation] = useState('Student Union'); const [date, setDate] = useState('Aug 28, 2026'); const current = title ? { id: 'draft', type, title, category, location, date, owner: 'Maya Patel' } as FoundItem : null; const matches = current ? rankMatches(current, items) : rankMatches(items[1], items); return <div><div className="page-heading compact"><div><p className="kicker">Community care</p><h1>Lost &amp; Found</h1><p className="subheading">Small details make a big difference in getting things home.</p></div><button className="button button-primary" onClick={() => document.getElementById('lost-form')?.scrollIntoView({ behavior: 'smooth' })}><PackageOpen size={16} /> Report an item</button></div><div className="lost-grid"><section className="form-card lost-form" id="lost-form"><div className="segmented"><button className={type === 'Lost' ? 'active' : ''} onClick={() => setType('Lost')}>I lost something</button><button className={type === 'Found' ? 'active' : ''} onClick={() => setType('Found')}>I found something</button></div><label>Item name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="E.g. Blue Hydro Flask" /></label><div className="form-grid"><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Electronics</option><option>Drinkware</option><option>Keys</option><option>Clothing</option><option>Other</option></select></label><label>Location<select value={location} onChange={(event) => setLocation(event.target.value)}><option>Student Union</option><option>Science Center</option><option>Library</option><option>Hawthorne Hall</option></select></label></div><label>Date<select value={date} onChange={(event) => setDate(event.target.value)}><option>Aug 28, 2026</option><option>Aug 27, 2026</option><option>Aug 26, 2026</option><option>Aug 22, 2026</option></select></label><button className="button button-primary full-button" onClick={() => { if (!title) return; onSubmit({ id: `LF-${204 + items.length}`, type, title, category, location, date, owner: 'Maya Patel' }); setTitle('') }}>Post {type.toLowerCase()} item <ArrowUpRight size={16} /></button><p className="form-hint"><Sparkles size={14} /> We&apos;ll look for potential matches automatically.</p></section><section className="panel matches-panel"><div className="panel-heading"><div><p className="eyebrow">Smart matching</p><h2>Potential matches</h2></div><Badge tone="green">Live feed</Badge></div><p className="match-intro">Ranked by category, location, and date overlap.</p>{matches.map((match) => <div className="match-row" key={match.id}><div className="item-thumb"><PackageOpen size={19} /></div><div className="activity-copy"><strong>{match.title}</strong><span>{match.type} · {match.location} · {match.date}</span></div><div className="match-score"><strong>{match.matched}%</strong><small>match</small></div></div>)}</section></div></div> }

export { Badge }
