"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { FolderOpen, Calendar, Users, Plus, X, LayoutTemplate } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", deadline: "", memberIds: [] });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const deadlineRef = useRef(null);

  const openDatePicker = () => {
    if (deadlineRef.current?.showPicker) {
      deadlineRef.current.showPicker();
    } else {
      deadlineRef.current?.focus();
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    api.get("/users?approvedOnly=true").then((res) => setMembers(res.data)).catch(() => {});
  }, []);

  const canCreate = user && ["ADMIN", "PM"].includes(user.role);

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(id) ? f.memberIds.filter((m) => m !== id) : [...f.memberIds, id],
    }));
  };

  const createProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/projects", form);
      setShowModal(false);
      setForm({ name: "", description: "", deadline: "", memberIds: [] });
      loadProjects();
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || "U";

  const getStatusStyles = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'COMPLETED': return 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <LayoutTemplate className="text-[var(--teal)]" size={28} /> Projects
          </h1>
          <p className="text-[var(--text-dim)] mt-1 text-sm sm:text-base">Manage and track all your team's projects.</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]"></div>)}
        </div>
      ) : projects.length === 0 ? (
        <div className="panel p-10 sm:p-16 text-center flex flex-col items-center justify-center border-dashed border-2">
          <FolderOpen size={48} className="text-[var(--text-dim)] mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold mb-1">No projects found</h3>
          <p className="text-[var(--text-dim)] text-sm mb-4">You haven't created or been assigned to any projects yet.</p>
          {canCreate && <button onClick={() => setShowModal(true)} className="btn-primary">Create Your First Project</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="panel p-5 sm:p-6 flex flex-col block hover:border-[var(--teal)] hover:shadow-lg hover:-translate-y-1 transition-all group relative">
              <div className="flex items-start justify-between mb-3 gap-3">
                <h3 className="font-display font-semibold text-lg group-hover:text-[var(--teal)] transition-colors">{p.name}</h3>
                <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold tracking-wider border ${getStatusStyles(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <p className="text-sm text-[var(--text-dim)] line-clamp-2 mb-6 h-10">
                {p.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                <div className="flex items-center gap-4 text-xs text-[var(--text-dim)] font-mono">
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> {p._count?.tasks || 0} Tasks</span>
                </div>

                {p.members?.length > 0 && (
                  <div className="flex -space-x-2">
                    {p.members.slice(0, 3).map((m, i) => (
                      <div key={m.id} className="w-8 h-8 rounded-full border-2 border-[var(--bg-panel)] bg-[var(--bg)] text-[10px] font-bold flex items-center justify-center text-[var(--text)]" style={{ zIndex: 3 - i }}>
                        {getInitials(m.user?.name)}
                      </div>
                    ))}
                    {p.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-panel)] bg-[var(--bg-panel-hover)] text-[10px] font-bold flex items-center justify-center text-[var(--text-dim)]" style={{ zIndex: 0 }}>
                        +{p.members.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="panel w-full sm:max-w-lg p-0 overflow-hidden shadow-2xl border-[var(--border)] rounded-b-none sm:rounded-b-xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg)] shrink-0">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2"><FolderOpen size={20} className="text-[var(--teal)]"/> Create New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-dim)] hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={createProject} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1.5 block">PROJECT NAME</label>
                <input required placeholder="E.g. Mobile App Redesign" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1.5 block">DESCRIPTION</label>
                <textarea placeholder="What is this project about?" className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1.5 block">DEADLINE</label>
                <div className="relative cursor-pointer" onClick={openDatePicker}>
                  <input
                    ref={deadlineRef}
                    type="date"
                    className="input-field pr-10 cursor-pointer"
                    style={{ colorScheme: "dark" }}
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1.5 block flex items-center gap-2"><Users size={14}/> ASSIGN TEAM MEMBERS</label>
                <div className="mt-1 max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg bg-[var(--bg)] divide-y divide-[var(--border)]">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 p-3 hover:bg-[var(--bg-panel-hover)] cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--teal)] focus:ring-[var(--teal)] bg-[var(--bg-panel)]" checked={form.memberIds.includes(m.id)} onChange={() => toggleMember(m.id)} />
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-xs font-bold shrink-0">{getInitials(m.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">{m.role || "Member"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
            <div className="p-5 border-t border-[var(--border)] bg-[var(--bg)] flex gap-3 justify-end shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6 flex-1 sm:flex-none">Cancel</button>
              <button type="submit" disabled={saving} onClick={createProject} className="btn-primary px-8 flex-1 sm:flex-none">{saving ? "Creating..." : "Create Project"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
