import { jsx, jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import {
  FolderKanban,
  Users,
  UserCheck,
  Code2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  X,
  Search,
  Zap,
  Clock,
  Briefcase,
  UserPlus,
  Edit3,
  Check,
  BarChart3,
  TrendingUp,
  Bug,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useAuth } from "../../auth/context/AuthContext";
const AVAILABLE_LEADERS = [
  {
    id: "usr-2",
    name: "Andr\xE9s Felipe Torres",
    email: "andres.torres@mchav.com",
    avatar: "A",
    role: "L\xEDder T\xE9cnico",
    experience: "Senior Tech Lead"
  },
  {
    id: "usr-1",
    name: "Mauricio Salamanca",
    email: "mauricio.salamanca@mchav.com",
    avatar: "M",
    role: "Administrador / Lead System",
    experience: "Architect"
  },
  {
    id: "usr-6",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@mchav.com",
    avatar: "C",
    role: "L\xEDder T\xE9cnico Mobile",
    experience: "Tech Lead Cloud"
  }
];
const AVAILABLE_DEVELOPERS = [
  { id: "usr-3", name: "Clara G\xF3mez", email: "clara.gomez@mchav.com", avatar: "C", tasksCount: 5, status: "Active" },
  { id: "usr-4", name: "Diana Patarroyo", email: "diana.patarroyo@mchav.com", avatar: "D", tasksCount: 4, status: "Active" },
  { id: "usr-5", name: "Eduardo Mart\xEDnez", email: "eduardo.m@mchav.com", avatar: "E", tasksCount: 3, status: "Active" },
  { id: "usr-7", name: "Fernando Ruiz", email: "fernando.ruiz@mchav.com", avatar: "F", tasksCount: 4, status: "Active" },
  { id: "usr-8", name: "Gabriela L\xF3pez", email: "gabriela.lopez@mchav.com", avatar: "G", tasksCount: 2, status: "Active" }
];
const MOCK_PROJECT_METRICS = {
  "proj-1": {
    velocity: [
      { sprint: "SP 11", sp: 32 },
      { sprint: "SP 12", sp: 38 },
      { sprint: "SP 13", sp: 50 },
      { sprint: "SP 14", sp: 46 }
    ],
    burndown: [
      { day: "D1", real: 46, ideal: 46 },
      { day: "D3", real: 38, ideal: 37 },
      { day: "D5", real: 28, ideal: 27 },
      { day: "D7", real: 16, ideal: 18 },
      { day: "D9", real: 6, ideal: 9 },
      { day: "D10", real: 0, ideal: 0 }
    ],
    distribution: [
      { name: "Historias de Usuario", value: 14, percentage: 70, color: "#8b5cf6" },
      { name: "Bugs y Defectos", value: 4, percentage: 20, color: "#ec4899" },
      { name: "Deuda T\xE9cnica", value: 2, percentage: 10, color: "#06b6d4" }
    ],
    kpis: { velocitySp: 46, deliveryHealth: "88%", cycleTimeDays: "2.4d", criticalBugs: 1 }
  },
  "proj-2": {
    velocity: [
      { sprint: "SP 5", sp: 25 },
      { sprint: "SP 6", sp: 30 },
      { sprint: "SP 7", sp: 36 },
      { sprint: "SP 8", sp: 40 }
    ],
    burndown: [
      { day: "D1", real: 40, ideal: 40 },
      { day: "D3", real: 35, ideal: 32 },
      { day: "D5", real: 26, ideal: 24 },
      { day: "D7", real: 18, ideal: 16 },
      { day: "D9", real: 8, ideal: 8 },
      { day: "D10", real: 2, ideal: 0 }
    ],
    distribution: [
      { name: "Historias de Usuario", value: 10, percentage: 62, color: "#8b5cf6" },
      { name: "Bugs y Defectos", value: 4, percentage: 25, color: "#ec4899" },
      { name: "Deuda T\xE9cnica", value: 2, percentage: 13, color: "#06b6d4" }
    ],
    kpis: { velocitySp: 40, deliveryHealth: "75%", cycleTimeDays: "3.1d", criticalBugs: 2 }
  },
  "proj-3": {
    velocity: [
      { sprint: "SP 1", sp: 20 },
      { sprint: "SP 2", sp: 28 },
      { sprint: "SP 3", sp: 34 },
      { sprint: "SP 4", sp: 42 }
    ],
    burndown: [
      { day: "D1", real: 42, ideal: 42 },
      { day: "D3", real: 30, ideal: 33 },
      { day: "D5", real: 20, ideal: 25 },
      { day: "D7", real: 10, ideal: 16 },
      { day: "D9", real: 2, ideal: 8 },
      { day: "D10", real: 0, ideal: 0 }
    ],
    distribution: [
      { name: "Historias de Usuario", value: 16, percentage: 80, color: "#8b5cf6" },
      { name: "Bugs y Defectos", value: 2, percentage: 10, color: "#ec4899" },
      { name: "Deuda T\xE9cnica", value: 2, percentage: 10, color: "#06b6d4" }
    ],
    kpis: { velocitySp: 42, deliveryHealth: "92%", cycleTimeDays: "1.8d", criticalBugs: 0 }
  }
};
const getProjectMetrics = (projId) => MOCK_PROJECT_METRICS[projId] || {
  velocity: [{ sprint: "SP 1", sp: 24 }, { sprint: "SP 2", sp: 30 }, { sprint: "SP 3", sp: 38 }, { sprint: "SP 4", sp: 44 }],
  burndown: [{ day: "D1", real: 44, ideal: 44 }, { day: "D3", real: 36, ideal: 35 }, { day: "D5", real: 25, ideal: 26 }, { day: "D7", real: 14, ideal: 17 }, { day: "D10", real: 0, ideal: 0 }],
  distribution: [{ name: "Historias de Usuario", value: 12, percentage: 75, color: "#8b5cf6" }, { name: "Bugs y Defectos", value: 3, percentage: 18, color: "#ec4899" }, { name: "Deuda T\xE9cnica", value: 1, percentage: 7, color: "#06b6d4" }],
  kpis: { velocitySp: 44, deliveryHealth: "85%", cycleTimeDays: "2.1d", criticalBugs: 0 }
};
const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    key: "MCHAV-01",
    name: "Sistema Analytics MCHAV",
    description: "Plataforma de m\xE9tricas ejecutivas, rendimiento de equipo y gobernanza RBAC.",
    status: "ACTIVE",
    statusLabel: "Sprint 14 Activo",
    progress: 88,
    category: "Backend & Frontend",
    leader: AVAILABLE_LEADERS[0],
    developers: [AVAILABLE_DEVELOPERS[0], AVAILABLE_DEVELOPERS[1], AVAILABLE_DEVELOPERS[2]]
  },
  {
    id: "proj-2",
    key: "RBAC-02",
    name: "Portal de Clientes & Seguridad RBAC",
    description: "M\xF3dulo de autenticaci\xF3n segura, control de matriz de permisos y auditor\xEDa.",
    status: "ACTIVE",
    statusLabel: "Sprint 8 en Proceso",
    progress: 75,
    category: "Seguridad & Permisos",
    leader: AVAILABLE_LEADERS[0],
    developers: [AVAILABLE_DEVELOPERS[0], AVAILABLE_DEVELOPERS[1]]
  },
  {
    id: "proj-3",
    key: "ETL-03",
    name: "API Gateway & Sincronizaci\xF3n Jira ETL",
    description: "Motor de extracci\xF3n y carga de tareas Jira con webhooks en tiempo real.",
    status: "STABLE",
    statusLabel: "Optimizaci\xF3n y Mantenimiento",
    progress: 92,
    category: "Integraci\xF3n & Datos",
    leader: AVAILABLE_LEADERS[1],
    developers: [AVAILABLE_DEVELOPERS[2]]
  }
];
export default function ProyectosDashboardView() {
  const { user } = useAuth();
  const isAdmin = !user || user.rol === "ADMIN";
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [expandedProjectId, setExpandedProjectId] = useState("proj-1");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formCategory, setFormCategory] = useState("Backend & Frontend");
  const [formLeaderId, setFormLeaderId] = useState("usr-2");
  const [formDevIds, setFormDevIds] = useState(["usr-3", "usr-4"]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4e3);
  };
  const toggleExpand = (projectId) => {
    setExpandedProjectId((prev) => prev === projectId ? null : projectId);
  };
  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setFormName("");
    setFormKey("");
    setFormCategory("Backend & Frontend");
    setFormLeaderId(AVAILABLE_LEADERS[0].id);
    setFormDevIds([AVAILABLE_DEVELOPERS[0].id, AVAILABLE_DEVELOPERS[1].id]);
    setShowAssignModal(true);
  };
  const handleOpenEditModal = (project) => {
    setEditingProjectId(project.id);
    setFormName(project.name);
    setFormKey(project.key);
    setFormCategory(project.category || "Backend & Frontend");
    setFormLeaderId(project.leader?.id || AVAILABLE_LEADERS[0].id);
    setFormDevIds(project.developers?.map((d) => d.id) || []);
    setShowAssignModal(true);
  };
  const handleToggleDeveloper = (devId) => {
    setFormDevIds((prev) => prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId]);
  };
  const handleSaveProjectAssignment = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formKey.trim()) return;
    const selectedLeader = AVAILABLE_LEADERS.find((l) => l.id === formLeaderId) || AVAILABLE_LEADERS[0];
    const selectedDevs = AVAILABLE_DEVELOPERS.filter((d) => formDevIds.includes(d.id));
    if (editingProjectId) {
      setProjects((prev) => prev.map((p) => p.id === editingProjectId ? { ...p, name: formName, key: formKey.toUpperCase(), category: formCategory, leader: selectedLeader, developers: selectedDevs } : p));
      showToast(`\u2705 Proyecto '${formName}' reasignado exitosamente.`);
    } else {
      const newProject = {
        id: `proj-${Date.now()}`,
        key: formKey.toUpperCase(),
        name: formName,
        status: "ACTIVE",
        statusLabel: "Sprint 1 Asignado",
        progress: 15,
        category: formCategory,
        leader: selectedLeader,
        developers: selectedDevs
      };
      setProjects((prev) => [newProject, ...prev]);
      setExpandedProjectId(newProject.id);
      showToast(`\u{1F680} \xA1Proyecto '${formName}' asignado con \xE9xito!`);
    }
    setShowAssignModal(false);
  };
  const handleOpenConfirmModal = (project) => {
    setPendingAssignment({ project, newLeaderName: "Andr\xE9s Felipe Torres" });
    setShowConfirmModal(true);
  };
  const handleConfirmAssignment = () => {
    showToast(`\u2705 Asignaci\xF3n de '${pendingAssignment?.project.name}' confirmada.`);
    setShowConfirmModal(false);
  };
  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.key.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 py-6 text-left animate-in fade-in duration-300", children: [
    toastMessage && /* @__PURE__ */ jsxs("div", { className: "fixed top-6 right-6 z-50 bg-white/95 dark:bg-slate-900/95 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-emerald-500 animate-spin" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-black tracking-wide", children: toastMessage }),
      /* @__PURE__ */ jsx("button", { onClick: () => setToastMessage(null), className: "text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 ml-3", children: /* @__PURE__ */ jsx(X, { size: 15 }) })
    ] }),
    showAssignModal && isAdmin && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setShowAssignModal(false), className: "absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 p-2 rounded-xl", children: /* @__PURE__ */ jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(UserPlus, { size: 24 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-md", children: "Administraci\xF3n RBAC" }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-black mt-0.5", children: editingProjectId ? "Editar Asignaci\xF3n de Proyecto" : "Asignar Nuevo Proyecto & Equipo" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveProjectAssignment, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-black uppercase text-slate-500", children: "Nombre del Proyecto *" }),
            /* @__PURE__ */ jsx("input", { type: "text", required: true, placeholder: "Nombre del proyecto", value: formName, onChange: (e) => setFormName(e.target.value), className: "w-full p-2.5 rounded-xl border dark:bg-slate-950 text-xs font-bold" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-black uppercase text-slate-500", children: "Clave Jira *" }),
            /* @__PURE__ */ jsx("input", { type: "text", required: true, placeholder: "Clave Jira", value: formKey, onChange: (e) => setFormKey(e.target.value), className: "w-full p-2.5 rounded-xl border dark:bg-slate-950 text-xs font-bold uppercase" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-black uppercase text-slate-500", children: "Categor\xEDa" }),
            /* @__PURE__ */ jsxs("select", { value: formCategory, onChange: (e) => setFormCategory(e.target.value), className: "w-full p-2.5 rounded-xl border dark:bg-slate-950 text-xs font-bold", children: [
              /* @__PURE__ */ jsx("option", { value: "Backend & Frontend", children: "Backend & Frontend" }),
              /* @__PURE__ */ jsx("option", { value: "Seguridad & Permisos", children: "Seguridad & Permisos" }),
              /* @__PURE__ */ jsx("option", { value: "Integraci\xF3n & Datos", children: "Integraci\xF3n & Datos" }),
              /* @__PURE__ */ jsx("option", { value: "Mobile & Cloud", children: "Mobile & Cloud" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-black uppercase text-purple-600", children: "L\xEDder T\xE9cnico Responsable *" }),
            /* @__PURE__ */ jsx("select", { value: formLeaderId, onChange: (e) => setFormLeaderId(e.target.value), className: "w-full p-2.5 rounded-xl border border-purple-300 dark:bg-slate-950 text-xs font-bold", children: AVAILABLE_LEADERS.map((l) => /* @__PURE__ */ jsxs("option", { value: l.id, children: [
              "\u{1F464} ",
              l.name,
              " (",
              l.role,
              ")"
            ] }, l.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-xs font-black uppercase text-blue-600", children: [
            "Desarrolladores Asignados (",
            formDevIds.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto", children: AVAILABLE_DEVELOPERS.map((dev) => {
            const isSelected = formDevIds.includes(dev.id);
            return /* @__PURE__ */ jsxs("div", { onClick: () => handleToggleDeveloper(dev.id), className: `p-2 rounded-xl border cursor-pointer flex justify-between items-center ${isSelected ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40" : "border-slate-200"}`, children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: dev.name }),
              /* @__PURE__ */ jsx("div", { className: `w-4 h-4 rounded flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "border"}`, children: isSelected && /* @__PURE__ */ jsx(Check, { size: 12 }) })
            ] }, dev.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowAssignModal(false), className: "px-4 py-2 border rounded-xl text-xs font-bold", children: "Cancelar" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black", children: "Guardar Asignaci\xF3n" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-black flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FolderKanban, { size: 28 }),
          " Dashboard de Proyectos & Equipos"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-slate-500 font-medium", children: "Asignaciones de L\xEDderes T\xE9cnicos, Desarrolladores a cargo y m\xE9tricas ejecutivas." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        isAdmin && /* @__PURE__ */ jsx("button", { onClick: handleOpenCreateModal, className: "px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black shadow-md flex items-center gap-2", children: "+ Asignar Nuevo Proyecto" }),
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Buscar proyecto...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "px-4 py-2.5 rounded-2xl border dark:bg-slate-950 text-xs w-64" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "relative grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-2 pt-1", children: filteredProjects.map((proj, idx) => {
      const isExpanded = expandedProjectId === proj.id;
      const isSummaryActive = activeSummaryProjectId === proj.id;
      const isPurple = idx % 3 === 1;
      const isEmerald = idx % 3 === 2;
      const colorClasses = isPurple ? {
        borderActive: "border-purple-500 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/20",
        borderInactive: "border-purple-200 dark:border-purple-500/30 hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-purple-500/15",
        iconBox: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 ring-purple-500/20",
        subtitle: "text-purple-700 dark:text-purple-300/80",
        button: "bg-purple-100 dark:bg-purple-500/25 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/40"
      } : isEmerald ? {
        borderActive: "border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/20",
        borderInactive: "border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-emerald-500/15",
        iconBox: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
        subtitle: "text-emerald-700 dark:text-emerald-300/80",
        button: "bg-emerald-100 dark:bg-emerald-500/25 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-200 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/40"
      } : {
        borderActive: "border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/20",
        borderInactive: "border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/15",
        iconBox: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20",
        subtitle: "text-indigo-700 dark:text-indigo-300/80",
        button: "bg-indigo-100 dark:bg-indigo-500/25 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40"
      };
      return /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => toggleExpand(proj.id),
          className: `group bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${isExpanded ? colorClasses.borderActive : colorClasses.borderInactive}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: `w-20 h-20 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ring-1 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ${colorClasses.iconBox}`, children: /* @__PURE__ */ jsx(FolderKanban, { size: 36 }) }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5", children: /* @__PURE__ */ jsx("h3", { className: "text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate", children: proj.name }) }),
                  /* @__PURE__ */ jsxs("p", { className: `text-xs font-semibold ${colorClasses.subtitle}`, children: [
                    proj.key,
                    " \u2022 ",
                    proj.statusLabel
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 pt-1", children: [
                    proj.leader && /* @__PURE__ */ jsx("div", { title: `L\xEDder: ${proj.leader.name}`, className: "w-5 h-5 rounded-full bg-purple-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md", children: proj.leader.avatar }),
                    proj.developers?.map((dev) => /* @__PURE__ */ jsx("div", { title: `Dev: ${dev.name}`, className: "w-5 h-5 rounded-full bg-blue-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md", children: dev.avatar }, dev.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.stopPropagation();
                    toggleExpand(proj.id);
                  },
                  className: `px-3 py-3 rounded-2xl border text-sm font-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300 shrink-0 cursor-pointer ${colorClasses.button}`,
                  children: isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { size: 18 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 18 })
                }
              )
            ] }),
            isExpanded && /* @__PURE__ */ jsxs("div", { className: "mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider", children: "L\xEDder T\xE9cnico" }),
                  isAdmin ? /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleOpenEditModal(proj);
                      },
                      className: "text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsx(Edit3, { size: 12 }),
                        " Editar Asignaci\xF3n"
                      ]
                    }
                  ) : /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleOpenConfirmModal(proj);
                      },
                      className: "text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsx(ShieldCheck, { size: 12 }),
                        " Confirmar L\xEDder"
                      ]
                    }
                  )
                ] }),
                proj.leader ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0", children: proj.leader.avatar }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 dark:text-slate-100", children: proj.leader.name }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: proj.leader.email })
                  ] })
                ] }) : /* @__PURE__ */ jsx("p", { className: "text-xs italic text-slate-400", children: "Sin L\xEDder Asignado" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider", children: [
                  "Desarrolladores (",
                  proj.developers?.length || 0,
                  ")"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: proj.developers?.map((dev) => /* @__PURE__ */ jsxs("div", { className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-md bg-blue-600 text-white font-black text-[9px] flex items-center justify-center shrink-0", children: dev.avatar }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-800 dark:text-slate-200", children: dev.name })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 font-medium", children: [
                    dev.tasksCount || 3,
                    " tareas"
                  ] })
                ] }, dev.id)) })
              ] })
            ] })
          ]
        },
        proj.id
      );
    }) }),
    expandedProjectId && (() => {
      const summaryProj = projects.find((p) => p.id === expandedProjectId);
      if (!summaryProj) return null;
      const metrics = getProjectMetrics(summaryProj.id);
      return /* @__PURE__ */ jsxs("section", { className: "relative bg-white dark:bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center", children: /* @__PURE__ */ jsx(Activity, { size: 24 }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black uppercase text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-md", children: [
                summaryProj.key,
                " \u2022 ",
                summaryProj.category
              ] }),
              /* @__PURE__ */ jsxs("h3", { className: "text-xl sm:text-2xl font-black mt-1", children: [
                "Resumen Ejecutivo & M\xE9tricas Jira \u2014 ",
                summaryProj.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setExpandedProjectId(null), className: "px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsx(X, { size: 15 }),
            " Ocultar Resumen"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Zap, { size: 20, className: "text-amber-500" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Velocidad SP" }),
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-black", children: [
                metrics.kpis.velocitySp,
                " SP / sprint"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(TrendingUp, { size: 20, className: "text-emerald-500" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Salud Entregas" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-black", children: metrics.kpis.deliveryHealth })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Clock, { size: 20, className: "text-cyan-500" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Tiempo Ciclo" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-black", children: metrics.kpis.cycleTimeDays })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Bug, { size: 20, className: "text-rose-500" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400", children: "Bugs Cr\xEDticos" }),
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-black text-rose-500", children: [
                metrics.kpis.criticalBugs,
                " Activos"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase text-indigo-500", children: "\u{1F4C8} Velocidad por Sprint (Story Points)" }),
              /* @__PURE__ */ jsx("div", { className: "h-44 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: metrics.velocity, children: [
                /* @__PURE__ */ jsx(XAxis, { dataKey: "sprint", stroke: "#64748b", fontSize: 11 }),
                /* @__PURE__ */ jsx(YAxis, { stroke: "#64748b", fontSize: 11, axisLine: false }),
                /* @__PURE__ */ jsx(RechartsTooltip, { contentStyle: { backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px", color: "#fff" } }),
                /* @__PURE__ */ jsx(Bar, { dataKey: "sp", fill: "#8b5cf6", radius: [6, 6, 0, 0] })
              ] }) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase text-cyan-500", children: "\u{1F525} Burndown del Sprint (Esfuerzo Restante)" }),
              /* @__PURE__ */ jsx("div", { className: "h-44 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: metrics.burndown, children: [
                /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "#64748b", fontSize: 11 }),
                /* @__PURE__ */ jsx(YAxis, { stroke: "#64748b", fontSize: 11, axisLine: false }),
                /* @__PURE__ */ jsx(RechartsTooltip, { contentStyle: { backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px", color: "#fff" } }),
                /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "real", stroke: "#06b6d4", strokeWidth: 3 }),
                /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "ideal", stroke: "#64748b", strokeDasharray: "4 4", strokeWidth: 2 })
              ] }) }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-black uppercase text-purple-500 mb-4 block", children: "\u{1F4CA} Distribuci\xF3n de Tipos de Trabajo" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-6 h-full", children: [
              /* @__PURE__ */ jsx("div", { className: "w-48 h-48", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsx(PieChart, { children: /* @__PURE__ */ jsx(Pie, { data: metrics.distribution, innerRadius: 48, outerRadius: 75, paddingAngle: 5, dataKey: "value", children: metrics.distribution.map((entry, i) => /* @__PURE__ */ jsx(Cell, { fill: entry.color }, `cell-${i}`)) }) }) }) }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3 w-full sm:w-auto", children: metrics.distribution.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-full", style: { backgroundColor: item.color } }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold", children: item.name })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-black", children: [
                  item.percentage,
                  "%"
                ] })
              ] }, i)) })
            ] })
          ] })
        ] })
      ] });
    })()
  ] });
}
