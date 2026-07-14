"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";
import { LayoutDashboard, CheckCircle2, Clock, Activity, FolderOpen, AlertCircle } from "lucide-react";


const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user.role === "ADMIN") {
          
          const [projRes, statRes, actRes] = await Promise.all([
            api.get("/projects"),
            api.get("/analytics"),
            api.get("/activities"),
          ]);
          setProjects(projRes.data);
          setAnalytics(statRes.data);
          setActivities(actRes.data);
        } else if (user.role === "PM") {
          
          const [projRes, statRes] = await Promise.all([
            api.get("/projects"),
            api.get("/analytics"),
          ]);
          setProjects(projRes.data);
          setAnalytics(statRes.data);
        } else if (user.role === "MEMBER") {
          
          const [taskRes] = await Promise.all([api.get("/tasks/my")]);
          setMyTasks(taskRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return <AppShell>{null}</AppShell>;

  // Data Loading වෙද්දී පේන Skeleton UI එක
  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-[var(--border)] rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]"></div>
            ))}
          </div>
          <div className="h-64 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]"></div>
        </div>
      </AppShell>
    );
  }

  
  const statusCounts = projects.reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {});
  const taskCounts = myTasks.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {});

  return (
    <AppShell>
      {/* Header  */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">
            Welcome back, <span style={{ color: "var(--teal)" }}>{user.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-[var(--text-dim)]">
            {user.role === "ADMIN" && "Here is what's happening across the system today."}
            {user.role === "PM" && "Here is the status of your current projects."}
            {user.role === "MEMBER" && "Here are the tasks you need to focus on."}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-mono text-[var(--text-dim)]">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/*  SUMMARY CARDS  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="panel p-6 flex items-center justify-between hover:border-[var(--teal)] transition-colors">
          <div>
            <p className="text-xs text-[var(--text-dim)] font-mono mb-1">
              {user.role === "MEMBER" ? "TOTAL TASKS" : "TOTAL PROJECTS"}
            </p>
            <p className="text-3xl font-display font-bold">
              {user.role === "MEMBER" ? myTasks.length : projects.length}
            </p>
          </div>
          <div className="p-3 bg-[var(--bg)] rounded-lg text-[var(--teal)]">
            {user.role === "MEMBER" ? <LayoutDashboard size={24} /> : <FolderOpen size={24} />}
          </div>
        </div>

        <div className="panel p-6 flex items-center justify-between hover:border-[var(--teal)] transition-colors">
          <div>
            <p className="text-xs text-[var(--text-dim)] font-mono mb-1">IN PROGRESS / ACTIVE</p>
            <p className="text-3xl font-display font-bold text-blue-500">
              {user.role === "MEMBER" ? taskCounts.IN_PROGRESS || 0 : statusCounts.ACTIVE || 0}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <Clock size={24} />
          </div>
        </div>

        <div className="panel p-6 flex items-center justify-between hover:border-[var(--teal)] transition-colors">
          <div>
            <p className="text-xs text-[var(--text-dim)] font-mono mb-1">COMPLETED</p>
            <p className="text-3xl font-display font-bold" style={{ color: "var(--gold)" }}>
              {user.role === "MEMBER" ? taskCounts.DONE || 0 : statusCounts.COMPLETED || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: "rgba(212, 175, 55, 0.1)", color: "var(--gold)" }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
        <div className="flex flex-col space-y-8">
          
          {/* Charts (Admin & PM පමණි) */}
          {(user.role === "ADMIN" || user.role === "PM") && analytics && (
            <div className="panel p-6">
              <h2 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity size={20} className="text-[var(--teal)]" />
                {user.role === "ADMIN" ? "System Projects Overview" : "Your Tasks Overview"}
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {user.role === "ADMIN" ? (
                    <PieChart>
                      <Pie
                        data={analytics.projectStats}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                        paddingAngle={5} dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.projectStats?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "var(--bg-panel)", border: "none", borderRadius: "8px" }} />
                    </PieChart>
                  ) : (
                    <BarChart data={analytics.taskStats}>
                      <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ background: "var(--bg-panel)", border: "none", borderRadius: "8px" }} />
                      <Bar dataKey="value" fill="var(--teal)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

        
          {user.role === "MEMBER" && (
            <div className="panel p-0 overflow-hidden flex-1">
              <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-[var(--teal)]" /> My Recent Tasks
                </h2>
              </div>
              <div className="divide-y divide-[var(--border)] max-h-[400px] overflow-y-auto">
                {myTasks.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-dim)] flex flex-col items-center">
                    <CheckCircle2 size={40} className="mb-3 opacity-20" />
                    <p>No tasks assigned yet. You're all caught up!</p>
                  </div>
                ) : (
                  myTasks.map((t) => (
                    <div key={t.id} className="p-5 hover:bg-[var(--bg-panel-hover)] transition-colors flex justify-between items-center group">
                      <div>
                        <p className="font-medium text-sm group-hover:text-[var(--teal)] transition-colors">{t.title}</p>
                        <p className="text-xs text-[var(--text-dim)] mt-1 flex items-center gap-1">
                          <FolderOpen size={12} /> {t.project?.name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                        t.status === 'DONE' ? 'bg-green-500/10 text-green-500' :
                        t.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      
        <div className="flex flex-col h-full">
          
         
          {user.role === "ADMIN" ? (
            <div className="panel p-0 overflow-hidden flex-1 flex flex-col">
              <div className="p-5 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Activity size={20} className="text-[var(--teal)]" /> System Audit Trail
                </h2>
                <span className="text-xs font-mono text-[var(--text-dim)]">Live</span>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto max-h-[500px]">
                {activities.length === 0 ? (
                  <p className="text-center text-[var(--text-dim)] text-sm mt-10">No recent activities found.</p>
                ) : (
                  <div className="relative border-l border-[var(--border)] ml-3 space-y-6 pb-4">
                    {activities.map((log) => (
                      <div key={log.id} className="relative pl-6">
                        {/* Timeline Bullet */}
                        <div className="absolute w-3 h-3 bg-[var(--bg)] border-2 border-[var(--teal)] rounded-full -left-[6.5px] top-1.5"></div>
                        <p className="text-sm">
                          <span className="font-semibold text-[var(--text)]">{log.user?.name} </span>
                          <span className="text-[var(--text-dim)]">{log.details || log.action}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[var(--text-dim)]">
                          <span className="flex items-center gap-1"><FolderOpen size={12}/> {log.project?.name || 'Project'}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            
            <div className="panel p-0 overflow-hidden">
              <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <FolderOpen size={20} className="text-[var(--teal)]" /> Recent Projects
                </h2>
                <Link href="/projects" className="text-sm text-[var(--teal)] hover:underline">View all</Link>
              </div>
              <div className="p-5 grid grid-cols-1 gap-4">
                {projects.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-dim)] border border-dashed border-[var(--border)] rounded-xl">
                    <p className="text-sm">No projects found.</p>
                  </div>
                ) : (
                  projects.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--teal)] bg-[var(--bg)] transition-all hover:shadow-lg">
                      <div>
                        <p className="font-medium group-hover:text-[var(--teal)] transition-colors">{p.name}</p>
                        <p className="text-xs text-[var(--text-dim)] mt-1 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.status === 'ACTIVE' ? 'bg-blue-500' : p.status === 'COMPLETED' ? 'bg-[var(--gold)]' : 'bg-gray-500'}`}></span>
                          {p.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold">{p._count?.tasks || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Tasks</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}