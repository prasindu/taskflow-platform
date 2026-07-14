"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { LayoutList, Users, MessageSquare, Plus, X, Send, Clock, CheckCircle2, Circle, Lock, Trash2, AlertTriangle, Pencil, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("tasks");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });

  // Task edit
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });
  const [savingEditTask, setSavingEditTask] = useState(false);

  // Add members to project
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [savingMembers, setSavingMembers] = useState(false);

  const messagesEndRef = useRef(null);

  const canManage = user && (user.role === "ADMIN" || (user.role === "PM" && project?.createdById === user.id));
  // Only ADMIN can delete a project — PMs can manage but not delete
  const canDelete = user && user.role === "ADMIN";

  const isActive = project?.status === 'ACTIVE';

  const load = useCallback(async () => {
    if (!id || id === "undefined") {
      router.push("/projects");
      return;
    }
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to load project:", error);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab === "chat" && id && id !== "undefined") {
      api.get(`/projects/${id}/messages`).then((res) => {
        setMessages(res.data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }).catch(err => console.error("Failed to load messages:", err));
    }
  }, [tab, id]);

  const updateProjectStatus = async (newStatus) => {
    try {
      await api.put(`/projects/${id}`, { status: newStatus });
      setProject((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Failed to update project status:", error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!isActive) return; 
    await api.post(`/projects/${id}/tasks`, {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      assigneeId: taskForm.assigneeId || null
    });
    setShowTaskModal(false);
    setTaskForm({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });
    load();
  };

  const updateStatus = async (taskId, status) => {
    if (!isActive) return; 
    await api.patch(`/tasks/${taskId}/status`, { status });
    load();
  };

  // Task edit
  const openEditTask = (t) => {
    setEditingTaskId(t.id);
    setEditTaskForm({
      title: t.title || "",
      description: t.description || "",
      priority: t.priority || "MEDIUM",
      assigneeId: t.assignee?.id || "",
    });
    setShowEditTaskModal(true);
  };

  const submitEditTask = async (e) => {
    e.preventDefault();
    if (!editingTaskId) return;
    setSavingEditTask(true);
    try {
      await api.put(`/tasks/${editingTaskId}`, {
        title: editTaskForm.title,
        description: editTaskForm.description,
        priority: editTaskForm.priority,
        assigneeId: editTaskForm.assigneeId || null,
      });
      setShowEditTaskModal(false);
      setEditingTaskId(null);
      load();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setSavingEditTask(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !isActive) return; 
    const { data } = await api.post(`/projects/${id}/messages`, { content: chatInput });
    setMessages((m) => [...m, data]);
    setChatInput("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const deleteProject = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/projects/${id}`);
      router.push("/projects");
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete project. Please try again.");
      setDeleting(false);
    }
  };

  // Add members
  const openAddMemberModal = async () => {
    setShowAddMemberModal(true);
    setSelectedMemberIds([]);
    setLoadingMembers(true);
    try {
      const res = await api.get("/users?approvedOnly=true");
      setAllMembers(res.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleSelectedMember = (userId) => {
    setSelectedMemberIds((ids) =>
      ids.includes(userId) ? ids.filter((i) => i !== userId) : [...ids, userId]
    );
  };

  const submitAddMembers = async (e) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) return;
    setSavingMembers(true);
    try {
      await api.post(`/projects/${id}/members`, { memberIds: selectedMemberIds });
      setShowAddMemberModal(false);
      setSelectedMemberIds([]);
      load();
    } catch (error) {
      console.error("Failed to add members:", error);
    } finally {
      setSavingMembers(false);
    }
  };

  const existingMemberIds = new Set((project?.members || []).map((m) => m.user.id));
  const addableMembers = allMembers.filter((m) => !existingMemberIds.has(m.id));

  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || "U";

  const priorityStyles = (priority) =>
    priority === 'HIGH' ? 'bg-red-500/10 text-red-500' :
    priority === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500';

  const statusSelectStyles = (status) =>
    status === 'DONE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
    status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
    'bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border)] hover:border-gray-500/50';

  if (!project) return (
    <AppShell><div className="flex items-center justify-center h-64"><p className="animate-pulse text-[var(--text-dim)]">Loading Workspace...</p></div></AppShell>
  );

  return (
    <AppShell>
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-3">
            {canManage ? (
              <select
                value={project.status}
                onChange={(e) => updateProjectStatus(e.target.value)}
                className={`px-2 py-1 rounded text-xs font-bold tracking-wider border focus:outline-none cursor-pointer appearance-none ${
                  project.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  project.status === 'COMPLETED' ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20' :
                  'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}
              >
                <option value="PLANNING" className="text-[var(--text)] bg-[var(--bg-panel)]">PLANNING</option>
                <option value="ACTIVE" className="text-[var(--text)] bg-[var(--bg-panel)]">ACTIVE</option>
                <option value="COMPLETED" className="text-[var(--text)] bg-[var(--bg-panel)]">COMPLETED</option>
              </select>
            ) : (
              <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider border ${
                project.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                project.status === 'COMPLETED' ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>
                {project.status}
              </span>
            )}
            {project.deadline && <span className="text-xs text-[var(--text-dim)] flex items-center gap-1"><Clock size={12}/> Due {new Date(project.deadline).toLocaleDateString()}</span>}
          </div>

          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} /> Delete Project
            </button>
          )}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{project.name}</h1>
        <p className="text-[var(--text-dim)] mt-2 max-w-3xl leading-relaxed text-sm sm:text-base">{project.description || "No project description available."}</p>

        {!isActive && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-md text-sm flex items-start gap-2">
            <Lock size={15} className="mt-0.5 shrink-0" />
            <span>This project is currently in <strong>{project.status}</strong> mode. Tasks and discussions are locked until it becomes ACTIVE.</span>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-1.5 sm:gap-2 mb-6 bg-[var(--bg-panel)] p-1.5 rounded-lg w-full sm:w-fit border border-[var(--border)] overflow-x-auto">
        {[
          { id: "tasks", icon: LayoutList, label: "List" },
          { id: "members", icon: Users, label: "Team" },
          { id: "chat", icon: MessageSquare, label: "Discussions" }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${tab === t.id ? "bg-[var(--bg)] text-[var(--teal)] shadow-sm border border-[var(--border)]" : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-panel-hover)]"}`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* TASKS TAB */}
      {tab === "tasks" && (
        <div className="panel p-0 overflow-hidden border-[var(--border)] shadow-sm">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-panel)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <LayoutList size={18} className="text-[var(--teal)]" />
              <h3 className="font-semibold">Project Tasks</h3>
              <span className="bg-[var(--bg)] px-2 py-0.5 rounded-full text-xs text-[var(--text-dim)] border border-[var(--border)]">{tasks.length}</span>
            </div>
            {canManage && isActive && (
              <button onClick={() => setShowTaskModal(true)} className="btn-primary py-1.5 px-3 sm:px-4 text-xs flex items-center gap-2"><Plus size={14} /> <span className="hidden sm:inline">Add Task</span></button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="p-10 text-center text-[var(--text-dim)]">No tasks created yet.</div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden divide-y divide-[var(--border)] bg-[var(--bg)]">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        disabled={!isActive}
                        onClick={() => updateStatus(t.id, t.status === 'DONE' ? 'TODO' : 'DONE')}
                        className={`mt-0.5 shrink-0 transition-colors ${!isActive ? 'opacity-50 cursor-not-allowed' : 'text-[var(--text-dim)]'}`}
                      >
                        {t.status === 'DONE' ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${t.status === 'DONE' ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text)]'}`}>{t.title}</p>
                        {t.description && <p className="text-xs text-[var(--text-dim)] line-clamp-2 mt-1 opacity-70">{t.description}</p>}
                      </div>
                      <span className={`shrink-0 text-[10px] px-2 py-1 rounded font-bold tracking-wider ${priorityStyles(t.priority)}`}>
                        {t.priority}
                      </span>
                      {canManage && (
                        <button
                          onClick={() => openEditTask(t)}
                          className="shrink-0 text-[var(--text-dim)] hover:text-[var(--teal)] transition-colors p-1 -mr-1"
                          aria-label="Edit task"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 pl-8">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text)] shrink-0">
                          {t.assignee ? getInitials(t.assignee.name) : "?"}
                        </div>
                        <span className="text-xs text-[var(--text-dim)] truncate">{t.assignee?.name?.split(" ")[0] || "Unassigned"}</span>
                      </div>
                      <select
                        disabled={!isActive}
                        className={`text-xs p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-[var(--teal)] transition-colors appearance-none font-medium font-mono tracking-wide text-center shrink-0
                          ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          ${statusSelectStyles(t.status)}`}
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                      >
                        <option value="TODO" className="text-[var(--text)] bg-[var(--bg-panel)]">TO DO</option>
                        <option value="IN_PROGRESS" className="text-[var(--text)] bg-[var(--bg-panel)]">IN PROGRESS</option>
                        <option value="DONE" className="text-[var(--text)] bg-[var(--bg-panel)]">DONE</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left min-w-[800px] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] text-[var(--text-dim)] uppercase tracking-widest bg-[var(--bg)]">
                      <th className="px-5 py-4 font-medium w-2/5">Task Name</th>
                      <th className="px-5 py-4 font-medium">Assignee</th>
                      <th className="px-5 py-4 font-medium">Priority</th>
                      <th className="px-5 py-4 font-medium w-40">Status</th>
                      <th className="px-5 py-4 font-medium w-14"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-[var(--bg)]">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--bg-panel-hover)] transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <button
                              disabled={!isActive}
                              onClick={() => updateStatus(t.id, t.status === 'DONE' ? 'TODO' : 'DONE')}
                              className={`mt-0.5 transition-colors ${!isActive ? 'opacity-50 cursor-not-allowed' : 'text-[var(--text-dim)] group-hover:text-[var(--teal)]'}`}
                            >
                              {t.status === 'DONE' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}
                            </button>
                            <div>
                              <p className={`text-sm font-medium ${t.status === 'DONE' ? 'line-through text-[var(--text-dim)]' : 'text-[var(--text)]'}`}>{t.title}</p>
                              {t.description && <p className="text-xs text-[var(--text-dim)] line-clamp-1 mt-1 opacity-70">{t.description}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[9px] font-bold text-[var(--text)]" title={t.assignee?.name || "Unassigned"}>
                              {t.assignee ? getInitials(t.assignee.name) : "?"}
                            </div>
                            <span className="text-xs text-[var(--text-dim)] truncate max-w-[100px]">{t.assignee?.name?.split(" ")[0] || "Unassigned"}</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-wider ${priorityStyles(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            disabled={!isActive}
                            className={`text-xs w-full p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-[var(--teal)] transition-colors appearance-none font-medium font-mono tracking-wide text-center
                              ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              ${statusSelectStyles(t.status)}`}
                            value={t.status}
                            onChange={(e) => updateStatus(t.id, e.target.value)}
                          >
                            <option value="TODO" className="text-[var(--text)] bg-[var(--bg-panel)]">TO DO</option>
                            <option value="IN_PROGRESS" className="text-[var(--text)] bg-[var(--bg-panel)]">IN PROGRESS</option>
                            <option value="DONE" className="text-[var(--text)] bg-[var(--bg-panel)]">DONE</option>
                          </select>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {canManage && (
                            <button
                              onClick={() => openEditTask(t)}
                              className="text-[var(--text-dim)] hover:text-[var(--teal)] transition-colors p-1.5 rounded-md hover:bg-[var(--bg-panel-hover)]"
                              aria-label="Edit task"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Team Members Tab */}
      {tab === "members" && (
        <div className="panel p-0 overflow-hidden max-w-2xl border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-panel)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[var(--teal)]" />
              <h3 className="font-semibold">Project Team ({project.members.length})</h3>
            </div>
            {canManage && (
              <button onClick={openAddMemberModal} className="btn-primary py-1.5 px-3 sm:px-4 text-xs flex items-center gap-2">
                <UserPlus size={14} /> <span className="hidden sm:inline">Add Members</span>
              </button>
            )}
          </div>
          <div className="divide-y divide-[var(--border)]">
            {project.members.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[var(--bg-panel-hover)] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center font-bold text-sm">{getInitials(m.user.name)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.user.name}</p>
                    <p className="text-xs text-[var(--text-dim)] truncate">{m.user.email}</p>
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold tracking-wider ${m.user.role === 'ADMIN' ? 'bg-[var(--gold)]/10 text-[var(--gold)]' : m.user.role === 'PM' ? 'bg-blue-500/10 text-blue-500' : 'bg-[var(--teal)]/10 text-[var(--teal)]'}`}>
                  {m.user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {tab === "chat" && (
        <div className="panel p-0 flex flex-col h-[70vh] sm:h-[600px] max-w-4xl border border-[var(--border)] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-panel)] flex items-center gap-2">
            <MessageSquare size={18} className="text-[var(--teal)]" />
            <h3 className="font-semibold">Team Discussions</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[var(--bg)] scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] opacity-60">
                <MessageSquare size={48} className="mb-4" />
                <p>No messages yet.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.user.id === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {!isMe && <span className="text-xs font-bold text-[var(--text-dim)]">{m.user.name}</span>}
                      <span className="text-[10px] text-[var(--text-dim)] font-mono opacity-60">
                        {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className={`px-4 py-2.5 max-w-[85%] sm:max-w-[75%] rounded-2xl text-sm ${isMe ? 'bg-[var(--teal)] text-white rounded-br-none' : 'bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text)] rounded-bl-none'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 sm:p-4 bg-[var(--bg-panel)] border-t border-[var(--border)]">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                disabled={!isActive}
                className={`w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-full pl-5 pr-14 py-3 text-sm focus:outline-none focus:border-[var(--teal)] transition-colors placeholder-[var(--text-dim)] ${!isActive ? 'opacity-50 cursor-not-allowed bg-[var(--bg-panel-hover)]' : ''}`}
                placeholder={isActive ? "Type a message to the team..." : "Chat is disabled (Project is not Active)"}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || !isActive}
                className="absolute right-2 p-2 bg-[var(--teal)] hover:bg-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="panel w-full sm:max-w-md p-0 overflow-hidden shadow-2xl border-[var(--border)] rounded-b-none sm:rounded-b-xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg)] shrink-0">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2"><LayoutList size={20} className="text-[var(--teal)]"/> New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-[var(--text-dim)] hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={createTask} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">TASK TITLE</label>
                <input required placeholder="E.g. Setup Database" className="input-field" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">DESCRIPTION</label>
                <textarea placeholder="Add details..." className="input-field resize-none" rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">PRIORITY</label>
                  <select className="input-field" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">ASSIGNEE</label>
                <select className="input-field" value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  <option value="unassigned_spacer" disabled>──────────</option>
                  {project.members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {showEditTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="panel w-full sm:max-w-md p-0 overflow-hidden shadow-2xl border-[var(--border)] rounded-b-none sm:rounded-b-xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg)] shrink-0">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Pencil size={18} className="text-[var(--teal)]"/> Edit Task</h2>
              <button onClick={() => setShowEditTaskModal(false)} className="text-[var(--text-dim)] hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={submitEditTask} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">TASK TITLE</label>
                <input required placeholder="E.g. Setup Database" className="input-field" value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">DESCRIPTION</label>
                <textarea placeholder="Add details..." className="input-field resize-none" rows={3} value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">PRIORITY</label>
                  <select className="input-field" value={editTaskForm.priority} onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-dim)] tracking-wider mb-1 block">ASSIGNEE</label>
                <select className="input-field" value={editTaskForm.assigneeId} onChange={(e) => setEditTaskForm({ ...editTaskForm, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  <option value="unassigned_spacer" disabled>──────────</option>
                  {project.members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-4">
                <button type="button" onClick={() => setShowEditTaskModal(false)} className="btn-secondary flex-1" disabled={savingEditTask}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={savingEditTask}>{savingEditTask ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBERS MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="panel w-full sm:max-w-md p-0 overflow-hidden shadow-2xl border-[var(--border)] rounded-b-none sm:rounded-b-xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg)] shrink-0">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2"><UserPlus size={20} className="text-[var(--teal)]"/> Add Team Members</h2>
              <button onClick={() => setShowAddMemberModal(false)} className="text-[var(--text-dim)] hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={submitAddMembers} className="p-6 space-y-4 overflow-y-auto">
              {loadingMembers ? (
                <p className="text-sm text-[var(--text-dim)] text-center py-6">Loading users...</p>
              ) : addableMembers.length === 0 ? (
                <p className="text-sm text-[var(--text-dim)] text-center py-6">Everyone available is already on this project.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-[var(--border)] rounded-lg bg-[var(--bg)] divide-y divide-[var(--border)]">
                  {addableMembers.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 p-3 hover:bg-[var(--bg-panel-hover)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--teal)] focus:ring-[var(--teal)] bg-[var(--bg-panel)]"
                        checked={selectedMemberIds.includes(m.id)}
                        onChange={() => toggleSelectedMember(m.id)}
                      />
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-xs font-bold shrink-0">{getInitials(m.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">{m.role || "Member"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-4">
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="btn-secondary flex-1" disabled={savingMembers}>Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={savingMembers || selectedMemberIds.length === 0}>
                  {savingMembers ? "Adding..." : `Add ${selectedMemberIds.length || ""}`.trim()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROJECT CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="panel w-full sm:max-w-sm p-0 overflow-hidden shadow-2xl border-red-500/30 rounded-b-none sm:rounded-b-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <h2 className="font-display text-lg font-semibold mb-2">Delete this project?</h2>
              <p className="text-sm text-[var(--text-dim)] mb-1">
                This will permanently delete <strong className="text-[var(--text)]">{project.name}</strong>, along with all its tasks, members, and chat messages.
              </p>
              <p className="text-sm text-red-500 mb-5">This action cannot be undone.</p>

              {deleteError && (
                <p className="text-xs text-red-500 mb-3">{deleteError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteError(""); }}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteProject}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}