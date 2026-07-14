"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import api from "@/lib/api";
import { ShieldAlert, Users, CheckCircle2, Clock, Search, Shield, UserCheck, Mail } from "lucide-react";

export default function AdminPage() {
  const [pending, setPending] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [roleChoice, setRoleChoice] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([api.get("/users/pending"), api.get("/users")]);
      setPending(p.data);
      setAllUsers(a.data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    const role = roleChoice[id] || "MEMBER";
    try {
      await api.patch(`/users/${id}/approve`, { role });
      load(); // Reload data after approval
    } catch (error) {
      console.error("Failed to approve user", error);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      load(); // Reload data after role change
    } catch (error) {
      console.error("Failed to change role", error);
    }
  };

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AppShell requireRole={["ADMIN"]}>
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-1/2 sm:w-1/4 bg-[var(--border)] rounded"></div>
          <div className="h-40 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]"></div>
          <div className="h-64 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell requireRole={["ADMIN"]}>
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="text-[var(--gold)]" size={28} /> User Management
          </h1>
          <p className="text-[var(--text-dim)] text-sm sm:text-base">Approve new accounts and manage system roles securely.</p>
        </div>
      </div>

      {/* Pending approvals */}
      <section className="mb-8 sm:mb-10">
        <h2 className="font-display text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-orange-500">
          <ShieldAlert size={20} /> Action Required: Pending Approvals ({pending.length})
        </h2>

        <div className={`panel p-0 overflow-hidden ${pending.length > 0 ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]' : ''}`}>
          {pending.length === 0 ? (
            <div className="p-8 sm:p-10 text-center text-[var(--text-dim)] flex flex-col items-center">
              <CheckCircle2 size={48} className="mb-4 text-green-500/50" />
              <p className="text-lg font-medium text-[var(--text)]">All caught up!</p>
              <p className="text-sm mt-1">There are no new users waiting for approval.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {pending.map((u) => (
                <div key={u.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bg)] hover:bg-[var(--bg-panel-hover)] transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-lg border border-orange-500/20">
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text)] truncate">{u.name}</p>
                      <p className="text-xs text-[var(--text-dim)] flex items-center gap-1 mt-1 truncate">
                        <Mail size={12} className="shrink-0" /> {u.email}
                      </p>
                      <p className="text-[10px] text-[var(--text-dim)] mt-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <Clock size={10} /> Registered: {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <select
                      className="input-field text-sm w-full lg:w-40 bg-[var(--bg-panel)] py-2"
                      value={roleChoice[u.id] || "MEMBER"}
                      onChange={(e) => setRoleChoice({ ...roleChoice, [u.id]: e.target.value })}
                    >
                      <option value="MEMBER">Assign as Member</option>
                      <option value="PM">Assign as Project Mgr</option>
                      <option value="ADMIN">Assign as Admin</option>
                    </select>
                    <button
                      onClick={() => approve(u.id)}
                      className="btn-primary whitespace-nowrap flex items-center gap-2 px-5 shrink-0"
                      style={{ background: "var(--teal)", borderColor: "var(--teal)", color: "#fff" }}
                    >
                      <UserCheck size={16} /> <span className="hidden sm:inline">Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All users */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users size={20} className="text-[var(--teal)]" /> All System Users
          </h2>

          <div className="relative w-full sm:w-64 flex items-center">
            <Search size={18} className="absolute left-3 text-[var(--text-dim)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field w-full pl-10 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="panel p-0 overflow-hidden border-[var(--border)]">
          <div className="divide-y divide-[var(--border)] max-h-[600px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-dim)]">No users found matching your search.</div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[var(--bg-panel-hover)] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg)] text-[var(--text-dim)] flex items-center justify-center font-bold text-sm border border-[var(--border)]">
                      {getInitials(u.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-[var(--text-dim)] truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto pl-[52px] sm:pl-0">
                    {!u.isApproved ? (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 shrink-0">
                        PENDING
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider border shrink-0 ${
                        u.role === 'ADMIN' ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20' :
                        u.role === 'PM' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-[var(--teal)]/10 text-[var(--teal)] border-[var(--teal)]/20'
                      }`}>
                        {u.role}
                      </span>
                    )}

                    <select
                      className="input-field text-sm w-full sm:w-36 bg-[var(--bg)] py-2"
                      value={u.role || ""}
                      disabled={!u.isApproved}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="PM">Project Mgr</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}