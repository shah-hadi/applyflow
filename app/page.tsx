"use client";
import { FormEvent, useMemo, useState } from "react";

type Stage = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
type Application = { id: number; company: string; role: string; stage: Stage; location: string; jobUrl: string; notes: string; createdAt: string };

const seed: Application[] = [
  { id: 1, company: "Linear", role: "Frontend Engineer", stage: "Interview", location: "Remote", jobUrl: "https://linear.app/careers", notes: "Prepare product critique.", createdAt: "2026-08-18" },
  { id: 2, company: "Stripe", role: "Software Engineer", stage: "Applied", location: "Bengaluru", jobUrl: "https://stripe.com/jobs", notes: "Referred by a former teammate.", createdAt: "2026-08-17" },
  { id: 3, company: "Notion", role: "Product Engineer", stage: "Saved", location: "Remote", jobUrl: "https://notion.so/careers", notes: "", createdAt: "2026-08-16" },
  { id: 4, company: "Vercel", role: "Full-stack Engineer", stage: "Offer", location: "Remote", jobUrl: "https://vercel.com/careers", notes: "Offer review on Friday.", createdAt: "2026-08-14" },
];
const stages: Stage[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
const emptyForm = { company: "", role: "", stage: "Applied" as Stage, location: "", jobUrl: "", notes: "" };

export default function Home() {
  const [applications, setApplications] = useState(seed);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<Application | null>(null);

  const visible = useMemo(() => applications.filter((item) => {
    const matchesQuery = `${item.company} ${item.role} ${item.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (stage === "All" || item.stage === stage);
  }), [applications, query, stage]);
  const interviewCount = applications.filter((a) => a.stage === "Interview").length;
  const offerCount = applications.filter((a) => a.stage === "Offer").length;
  const responseRate = applications.length ? Math.round((applications.filter((a) => ["Interview", "Offer", "Rejected"].includes(a.stage)).length / applications.length) * 100) : 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const optimistic: Application = { id: Date.now(), ...form, createdAt: new Date().toISOString() };
    setApplications((items) => [optimistic, ...items]);
    setForm(emptyForm); setDialogOpen(false);
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (response.ok) {
        const { application } = await response.json();
        setApplications((items) => items.map((item) => item.id === optimistic.id ? application : item));
      }
    } catch { /* The optimistic demo remains usable when a local D1 binding is absent. */ }
  }
  async function remove(id: number) {
    setApplications((items) => items.filter((item) => item.id !== id)); setSelected(null);
    try { await fetch(`/api/applications/${id}`, { method: "DELETE" }); } catch { /* local preview */ }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span> ApplyFlow</div>
        <nav aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><span>⌂</span> Overview</a>
          <a className="nav-item" href="#applications"><span>▣</span> Applications <b>{applications.length}</b></a>
          <a className="nav-item" href="#pipeline"><span>□</span> Pipeline</a>
          <a className="nav-item" href="#analytics"><span>↗</span> Analytics</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip"><span>✦</span><strong>Stay consistent</strong><small>Update your pipeline after every application.</small></div>
          <div className="profile"><div className="avatar">HK</div><div><strong>Hadi Khan</strong><small>Portfolio demo</small></div><span>⋯</span></div>
        </div>
      </aside>
      <section className="workspace" id="overview">
        <header>
          <div><p className="eyebrow">APPLICATION COMMAND CENTER</p><h1>Good morning, Hadi <span>👋</span></h1><p className="subtitle">Keep every opportunity moving forward.</p></div>
          <button className="primary" onClick={() => setDialogOpen(true)}>＋ Add application</button>
        </header>
        <div className="stats">
          <article><div className="stat-head"><span>All applications</span><i className="icon purple">▣</i></div><strong>{applications.length}</strong><small className="positive">Live</small><em> pipeline</em></article>
          <article><div className="stat-head"><span>Interviews</span><i className="icon orange">◫</i></div><strong>{interviewCount}</strong><small className="positive">Next step</small></article>
          <article><div className="stat-head"><span>Offers</span><i className="icon green">◇</i></div><strong>{offerCount}</strong><small className="muted">{offerCount ? "Nice work" : "Keep going"}</small></article>
          <article><div className="stat-head"><span>Response rate</span><i className="icon blue">↗</i></div><strong>{responseRate}%</strong><small className="positive">Tracked</small></article>
        </div>
        <section className="panel" id="applications">
          <div className="panel-head"><div><h2>Applications</h2><p>Search, filter, and review your opportunities.</p></div><span className="result-count">{visible.length} results</span></div>
          <div className="toolbar">
            <label><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, or location…" aria-label="Search applications" /></label>
            <select value={stage} onChange={(e) => setStage(e.target.value as Stage | "All")} aria-label="Filter by stage"><option>All</option>{stages.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="table" role="table" aria-label="Applications">
            <div className="row table-head" role="row"><span>COMPANY & ROLE</span><span>STAGE</span><span>LOCATION</span><span /></div>
            {visible.map((item) => <button className="row application-row" role="row" key={item.id} onClick={() => setSelected(item)}>
              <span className="company"><i className="company-logo">{item.company[0].toUpperCase()}</i><span><strong>{item.company}</strong><small>{item.role}</small></span></span>
              <span><b className={`badge ${item.stage.toLowerCase()}`}>{item.stage}</b></span><span className="date">{item.location || "Not specified"}</span><span className="more">•••</span>
            </button>)}
            {!visible.length && <div className="empty"><strong>No applications found</strong><span>Try another search or add a new opportunity.</span></div>}
          </div>
        </section>
      </section>

      {dialogOpen && <div className="overlay"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="add-title">
        <div className="dialog-head"><div><p className="eyebrow">NEW OPPORTUNITY</p><h2 id="add-title">Add an application</h2></div><button className="close" onClick={() => setDialogOpen(false)} aria-label="Close">×</button></div>
        <form onSubmit={submit}>
          <div className="form-grid"><label>Company<input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. OpenAI" /></label><label>Role<input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Software Engineer" /></label></div>
          <div className="form-grid"><label>Stage<select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>{stages.map((item) => <option key={item}>{item}</option>)}</select></label><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" /></label></div>
          <label>Job URL<input type="url" value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://…" /></label>
          <label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral, deadline, interview notes…" /></label>
          <div className="dialog-actions"><button type="button" className="secondary" onClick={() => setDialogOpen(false)}>Cancel</button><button className="primary">Add application</button></div>
        </form>
      </section></div>}

      {selected && <div className="overlay"><section className="dialog details" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="close floating" onClick={() => setSelected(null)} aria-label="Close">×</button><i className="company-logo large">{selected.company[0]}</i><p className="eyebrow">{selected.stage}</p><h2 id="detail-title">{selected.role}</h2><p className="detail-company">{selected.company} · {selected.location}</p>
        <div className="notes"><span>NOTES</span><p>{selected.notes || "No notes added yet."}</p></div>
        <div className="dialog-actions">{selected.jobUrl && <a className="secondary link-button" href={selected.jobUrl} target="_blank" rel="noreferrer">View job ↗</a>}<button className="danger" onClick={() => remove(selected.id)}>Delete</button></div>
      </section></div>}
    </main>
  );
}
