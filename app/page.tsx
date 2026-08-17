"use client";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Stage = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
type Application = { id: number; company: string; role: string; stage: Stage; location: string; jobUrl: string; notes: string; createdAt: string; salary: string; source: string; contact: string; interviewDate: string; deadline: string; nextAction: string };
type User = { id: string; name: string; email: string };
type View = "overview" | "applications" | "pipeline" | "analytics" | "settings";
type Activity = { id: number; applicationId: number; text: string; date: string };

const stages: Stage[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
const emptyForm = { company: "", role: "", stage: "Applied" as Stage, location: "", jobUrl: "", notes: "", salary: "", source: "", contact: "", interviewDate: "", deadline: "", nextAction: "" };

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Application | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");
  const [deleted, setDeleted] = useState<Application | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [view, setView] = useState<View>("overview");
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/me"), fetch("/api/applications")]).then(async ([meResponse, applicationsResponse]) => {
      if (!meResponse.ok) return;
      const { user: authenticatedUser } = await meResponse.json();
      setUser(authenticatedUser);
      if (applicationsResponse.ok) setApplications((await applicationsResponse.json()).applications);
      setTheme(localStorage.getItem(`applyflow.theme.${authenticatedUser.email}`) === "dark" ? "dark" : "light");
    }).finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (user) localStorage.setItem(`applyflow.theme.${user.email}`, theme);
  }, [theme, user]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "n" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) openForm();
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  });

  function notify(message: string) {
    setToast(message); window.setTimeout(() => setToast(""), 2600);
  }
  function record(applicationId: number, text: string) {
    setActivities((items) => [{ id: Date.now(), applicationId, text, date: new Date().toISOString() }, ...items].slice(0, 100));
  }
  function relativeDate(value: string) {
    const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    return new Date(value).toLocaleDateString();
  }

  const visible = useMemo(() => applications.filter((item) => {
    const matchesQuery = `${item.company} ${item.role} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (stage === "All" || item.stage === stage);
  }), [applications, query, stage]);
  const interviewCount = applications.filter((a) => a.stage === "Interview").length;
  const offerCount = applications.filter((a) => a.stage === "Offer").length;
  const responseRate = applications.length ? Math.round((applications.filter((a) => ["Interview", "Offer", "Rejected"].includes(a.stage)).length / applications.length) * 100) : 0;
  const upcoming = applications.filter((item) => item.interviewDate && new Date(item.interviewDate).getTime() >= Date.now()).sort((a, b) => a.interviewDate.localeCompare(b.interviewDate));
  const needsAttention = applications.filter((item) => !["Offer", "Rejected"].includes(item.stage) && (!item.nextAction || Date.now() - new Date(item.createdAt).getTime() > 7 * 86400000));

  if (!loaded) return <main className="loading-screen"><span className="brand-mark">A</span><p>Loading ApplyFlow…</p></main>;
  if (!user) return <main className="auth-shell">
    <section className="auth-brand"><div className="brand auth-logo"><span className="brand-mark">A</span> ApplyFlow</div><div><p className="eyebrow">A CALMER JOB SEARCH</p><h1>Keep every application moving.</h1><p>Track roles, plan follow-ups, prepare for interviews, and keep your search organized in one private workspace.</p></div><div className="auth-proof"><span>✓ Private by default</span><span>✓ Your data follows you</span><span>✓ Export anytime</span></div></section>
    <section className="auth-panel"><div className="auth-card"><p className="eyebrow">WELCOME</p><h2>Sign in to ApplyFlow</h2><p className="auth-sub">Use your ChatGPT account. ApplyFlow never receives your password.</p><a className="primary auth-submit sign-in-link" href="/signin-with-chatgpt?return_to=%2F">Continue with ChatGPT</a><small className="local-note">Secure sign-in and a private cloud workspace.</small></div></section>
  </main>;

  function openForm(application?: Application) {
    if (application) {
      setEditingId(application.id);
      setForm({ ...emptyForm, ...application });
    } else { setEditingId(null); setForm(emptyForm); }
    setDialogOpen(true);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (editingId) {
      const response = await fetch(`/api/applications/${editingId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) return notify("Could not save changes");
      const { application } = await response.json();
      setApplications((items) => items.map((item) => item.id === editingId ? application : item)); record(editingId, "Application details updated");
    } else {
      const response = await fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) return notify("Could not add application");
      const { application } = await response.json();
      setApplications((items) => [application, ...items]); record(application.id, "Application added");
    }
    notify(editingId ? "Application updated" : "Application added");
    setForm(emptyForm); setEditingId(null); setDialogOpen(false);
  }
  async function remove(application: Application) {
    const response = await fetch(`/api/applications/${application.id}`, { method: "DELETE" });
    if (!response.ok) return notify("Could not delete application");
    setDeleted(application); setApplications((items) => items.filter((item) => item.id !== application.id)); setSelected(null); setConfirmDelete(null); notify("Application deleted");
  }
  async function undoDelete() {
    if (!deleted) return;
    const response = await fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(deleted) });
    if (!response.ok) return notify("Could not restore application");
    const { application } = await response.json();
    setApplications((items) => [application, ...items]); setDeleted(null); notify("Deletion undone");
  }
  async function changeStage(id: number, nextStage: Stage) {
    const response = await fetch(`/api/applications/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ stage: nextStage }) });
    if (!response.ok) return notify("Could not move application");
    setApplications((items) => items.map((item) => item.id === id ? { ...item, stage: nextStage } : item)); record(id, `Moved to ${nextStage}`); notify(`Moved to ${nextStage}`);
  }
  function exportCsv() {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [["Company", "Role", "Stage", "Location", "Job URL", "Notes", "Created"], ...applications.map((item) => [item.company, item.role, item.stage, item.location, item.jobUrl, item.notes, item.createdAt])];
    const blob = new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "applyflow-applications.csv"; anchor.click(); URL.revokeObjectURL(url);
    notify("CSV exported");
  }
  function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const lines = String(reader.result).split(/\r?\n/).slice(1).filter(Boolean);
      const imported = lines.map((line, index) => {
        const values = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map((value) => value.replace(/^"|"$/g, "").replaceAll('""', '"')) || [];
        return { id: Date.now() + index, company: values[0] || "Unknown", role: values[1] || "Role", stage: stages.includes(values[2] as Stage) ? values[2] as Stage : "Applied", location: values[3] || "", jobUrl: values[4] || "", notes: values[5] || "", createdAt: values[6] || new Date().toISOString(), salary: "", source: "", contact: "", interviewDate: "", deadline: "", nextAction: "" };
      });
      const saved = await Promise.all(imported.map(async (item) => {
        const response = await fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(item) });
        return response.ok ? (await response.json()).application : null;
      }));
      const successful = saved.filter(Boolean) as Application[];
      setApplications((items) => [...successful, ...items]); notify(`Imported ${successful.length} applications`);
    };
    reader.readAsText(file); event.target.value = "";
  }
  function exportCalendar(application: Application) {
    if (!application.interviewDate) return notify("Add an interview date first");
    const date = application.interviewDate.replaceAll("-", "").replaceAll(":", "") + "00";
    const content = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${date}\nSUMMARY:${application.company} — ${application.role} interview\nDESCRIPTION:${application.notes}\nEND:VEVENT\nEND:VCALENDAR`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${application.company}-interview.ics`; anchor.click(); URL.revokeObjectURL(url); notify("Calendar event downloaded");
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span> ApplyFlow</div>
        <nav aria-label="Main navigation">
          <button className={`nav-item ${view === "overview" ? "active" : ""}`} onClick={() => setView("overview")}><span>⌂</span> Today</button>
          <button className={`nav-item ${view === "applications" ? "active" : ""}`} onClick={() => setView("applications")}><span>▣</span> Applications <b>{applications.length}</b></button>
          <button className={`nav-item ${view === "pipeline" ? "active" : ""}`} onClick={() => setView("pipeline")}><span>□</span> Pipeline</button>
          <button className={`nav-item ${view === "analytics" ? "active" : ""}`} onClick={() => setView("analytics")}><span>↗</span> Analytics</button>
          <button className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}><span>⚙</span> Settings</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip"><span>N</span><strong>Quick add</strong><small>Press N anywhere to add an application.</small></div>
          <div className="profile"><div className="avatar">{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.email}</small></div><a className="logout" href="/signout-with-chatgpt?return_to=%2F" aria-label="Sign out">↪</a></div>
        </div>
      </aside>
      <section className="workspace" id="overview" data-view={view}>
        <header>
          <div><p className="eyebrow">{view.toUpperCase()}</p><h1>{view === "overview" ? `Good morning, ${user.name.split(" ")[0]}` : view[0].toUpperCase() + view.slice(1)}</h1><p className="subtitle">{view === "overview" ? "Here’s what needs your attention today." : "Keep your job search organized and up to date."}</p></div>
          <button className="primary" onClick={() => openForm()}>＋ Add application</button>
        </header>
        <section className="today-grid">
          <article><div><span className="today-icon">◫</span><p>Next interview</p></div>{upcoming[0] ? <button onClick={() => setSelected(upcoming[0])}><strong>{upcoming[0].company}</strong><small>{new Date(upcoming[0].interviewDate).toLocaleString()}</small></button> : <div className="quiet-empty"><strong>No interviews scheduled</strong><small>Add a date to an interview-stage application.</small></div>}</article>
          <article><div><span className="today-icon alert">!</span><p>Needs attention</p></div>{needsAttention.length ? <><strong>{needsAttention.length} application{needsAttention.length > 1 ? "s" : ""}</strong><small>Missing a next action or inactive for over a week.</small><button className="text-action" onClick={() => { setStage("All"); setView("applications"); }}>Review applications →</button></> : <div className="quiet-empty"><strong>You’re all caught up</strong><small>Every active application has a next step.</small></div>}</article>
          <article><div><span className="today-icon">✓</span><p>Follow-up assistant</p></div><strong>{applications.filter((item) => item.nextAction).length} planned actions</strong><small>Add clear next actions so nothing falls through.</small><button className="text-action" onClick={() => openForm()}>Plan a follow-up →</button></article>
        </section>
        {applications.length === 0 && <section className="onboarding"><span>1</span><div><p className="eyebrow">FIRST STEP</p><h2>Add your first application</h2><p>Start with a role you applied to recently, or import an existing spreadsheet.</p><div><button className="primary" onClick={() => openForm()}>Add application</button><label className="secondary import-button">Import CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} /></label></div></div></section>}
        <div className="stats">
          <article><div className="stat-head"><span>All applications</span><i className="icon purple">▣</i></div><strong>{applications.length}</strong><small className="positive">Live</small><em> pipeline</em></article>
          <article><div className="stat-head"><span>Interviews</span><i className="icon orange">◫</i></div><strong>{interviewCount}</strong><small className="positive">Next step</small></article>
          <article><div className="stat-head"><span>Offers</span><i className="icon green">◇</i></div><strong>{offerCount}</strong><small className="muted">{offerCount ? "Nice work" : "Keep going"}</small></article>
          <article><div className="stat-head"><span>Response rate</span><i className="icon blue">↗</i></div><strong>{applications.length >= 5 ? `${responseRate}%` : "—"}</strong><small className="positive">{applications.length >= 5 ? "Tracked" : "Needs 5+ applications"}</small></article>
        </div>
        <section className="panel" id="applications">
          <div className="panel-head"><div><h2>Applications</h2><p>Search, filter, and review your opportunities.</p></div><div className="panel-actions"><label className="export import-button">⇧ Import CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} /></label><button className="export" onClick={exportCsv}>⇩ Export CSV</button><span className="result-count">{visible.length} results</span></div></div>
          <div className="toolbar">
            <label><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, or location…" aria-label="Search applications" /></label>
            <select value={stage} onChange={(e) => setStage(e.target.value as Stage | "All")} aria-label="Filter by stage"><option>All</option>{stages.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="table" role="table" aria-label="Applications">
            <div className="row table-head" role="row"><span>COMPANY & ROLE</span><span>STAGE</span><span>LOCATION</span><span /></div>
            {visible.map((item) => <button className="row application-row" role="row" key={item.id} onClick={() => setSelected(item)}>
              <span className="company"><i className="company-logo">{item.company[0].toUpperCase()}</i><span><strong>{item.company}</strong><small>{item.role}</small></span></span>
              <span><b className={`badge ${item.stage.toLowerCase()}`}>{item.stage}</b></span><span className="date">{item.location || "Not specified"}<small>{relativeDate(item.createdAt)}</small></span><span className="more">•••</span>
            </button>)}
            {!visible.length && <div className="empty"><strong>No applications found</strong><span>Try another search or add a new opportunity.</span></div>}
          </div>
        </section>
        <section className="section-block" id="pipeline">
          <div className="section-heading"><div><p className="eyebrow">WORKFLOW</p><h2>Application pipeline</h2></div><span className="result-count">{applications.length} total</span></div>
          <div className="kanban">{stages.slice(0, 4).map((column) => <div className="kanban-column" key={column} onDragOver={(event) => event.preventDefault()} onDrop={(event) => changeStage(Number(event.dataTransfer.getData("applicationId")), column)}><div className="kanban-head"><strong>{column}</strong><span>{applications.filter((item) => item.stage === column).length}</span></div>{applications.filter((item) => item.stage === column).map((item) => <button draggable key={item.id} onDragStart={(event) => event.dataTransfer.setData("applicationId", String(item.id))} onClick={() => setSelected(item)}><strong>{item.company}</strong><small>{item.role}</small><em>{item.nextAction || item.location || "No next action"}</em></button>)}{!applications.some((item) => item.stage === column) && <p>Drop applications here</p>}</div>)}</div>
        </section>
        <section className="section-block" id="analytics">
          <div className="section-heading"><div><p className="eyebrow">INSIGHTS</p><h2>Search analytics</h2></div></div>
          <div className="analytics-grid"><article><span>Pipeline health</span><strong>{applications.length ? "Active" : "Start tracking"}</strong><p>{applications.length ? `${interviewCount + offerCount} opportunities have progressed beyond applying.` : "Add your first opportunity to unlock insights."}</p></article><article className="stage-chart">{stages.map((item) => { const count = applications.filter((application) => application.stage === item).length; const percent = applications.length ? Math.max(6, count / applications.length * 100) : 0; return <div key={item}><span>{item}</span><i><b style={{ width: `${percent}%` }} /></i><em>{count}</em></div>; })}</article></div>
        </section>
        <section className="section-block" id="settings">
          <div className="section-heading"><div><p className="eyebrow">PREFERENCES</p><h2>Account settings</h2></div></div>
          <div className="settings-grid"><div><label>Display name<input value={user.name} disabled /></label><label>Email<input value={user.email} disabled /></label></div><div><span>Appearance</span><div className="theme-choice"><button className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")}>☀ Light</button><button className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}>◐ Dark</button></div><p>Your profile comes from your secure sign-in. Export CSV anytime for a personal backup.</p></div></div>
        </section>
      </section>

      {dialogOpen && <div className="overlay"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="add-title">
        <div className="dialog-head"><div><p className="eyebrow">{editingId ? "UPDATE OPPORTUNITY" : "NEW OPPORTUNITY"}</p><h2 id="add-title">{editingId ? "Edit application" : "Add an application"}</h2></div><button className="close" onClick={() => setDialogOpen(false)} aria-label="Close">×</button></div>
        <form onSubmit={submit}>
          <div className="form-grid"><label>Company<input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. OpenAI" /></label><label>Role<input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Software Engineer" /></label></div>
          <div className="form-grid"><label>Stage<select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>{stages.map((item) => <option key={item}>{item}</option>)}</select></label><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" /></label></div>
          <div className="form-grid"><label>Salary range<input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="$100k–$130k" /></label><label>Source<input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="LinkedIn, referral…" /></label></div>
          <div className="form-grid"><label>Recruiter / contact<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Name or email" /></label><label>Next action<input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="Send follow-up" /></label></div>
          <div className="form-grid"><label>Interview date<input type="datetime-local" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} /></label><label>Application deadline<input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label></div>
          <label>Job URL<input type="url" value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://…" /></label>
          <label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral, deadline, interview notes…" /></label>
          <div className="dialog-actions"><button type="button" className="secondary" onClick={() => setDialogOpen(false)}>Cancel</button><button className="primary">{editingId ? "Save changes" : "Add application"}</button></div>
        </form>
      </section></div>}

      {selected && <div className="overlay"><section className="dialog details" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="close floating" onClick={() => setSelected(null)} aria-label="Close">×</button><i className="company-logo large">{selected.company[0]}</i><p className="eyebrow">{selected.stage}</p><h2 id="detail-title">{selected.role}</h2><p className="detail-company">{selected.company} · {selected.location}</p>
        <div className="detail-grid"><div><span>SALARY</span><strong>{selected.salary || "Not set"}</strong></div><div><span>SOURCE</span><strong>{selected.source || "Not set"}</strong></div><div><span>CONTACT</span><strong>{selected.contact || "Not set"}</strong></div><div><span>NEXT ACTION</span><strong>{selected.nextAction || "Not set"}</strong></div></div>
        {selected.interviewDate && <button className="calendar-card" onClick={() => exportCalendar(selected)}><span>◫</span><div><strong>Interview scheduled</strong><small>{new Date(selected.interviewDate).toLocaleString()}</small></div><em>Add to calendar →</em></button>}
        <div className="notes"><span>NOTES</span><p>{selected.notes || "No notes added yet."}</p></div>
        <div className="activity"><span>ACTIVITY</span>{activities.filter((item) => item.applicationId === selected.id).length ? activities.filter((item) => item.applicationId === selected.id).map((item) => <div key={item.id}><i /><p><strong>{item.text}</strong><small>{relativeDate(item.date)}</small></p></div>) : <p className="activity-empty">Changes to this application will appear here.</p>}</div>
        <div className="dialog-actions">{selected.jobUrl && <a className="secondary link-button" href={selected.jobUrl} target="_blank" rel="noreferrer">View job ↗</a>}<button className="secondary" onClick={() => { openForm(selected); setSelected(null); }}>Edit</button><button className="danger" onClick={() => setConfirmDelete(selected)}>Delete</button></div>
      </section></div>}
      {confirmDelete && <div className="overlay top-layer"><section className="confirm" role="alertdialog" aria-modal="true"><span className="warning">!</span><h2>Delete this application?</h2><p>{confirmDelete.company} — {confirmDelete.role} will be removed from your pipeline.</p><div className="dialog-actions"><button className="secondary" onClick={() => setConfirmDelete(null)}>Cancel</button><button className="danger" onClick={() => remove(confirmDelete)}>Delete</button></div></section></div>}
      {toast && <div className="toast" role="status">{toast}{deleted && toast === "Application deleted" && <button onClick={undoDelete}>Undo</button>}</div>}
    </main>
  );
}
