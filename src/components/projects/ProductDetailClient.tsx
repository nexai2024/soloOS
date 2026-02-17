"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Edit3,
  Trash2,
  Globe,
  Lock,
  Users,
  FileText,
  Layers,
  Eye,
  AlertCircle,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Product,
  WaitlistEntry,
  ProductChangelog,
  DevelopmentPhase,
  PhaseTask,
} from "@/generated/prisma/client";
import { fetchPatch, fetchDelete } from "@/lib/fetch";
import { useToast } from "@/contexts/ToastContext";
import { DeleteConfirmModal } from "@/components/ideas/DeleteConfirmModal";

type ProductWithRelations = Product & {
  Project?: { id: string; title: string; status: string } | null;
  WaitlistEntry: WaitlistEntry[];
  ProductChangelog: ProductChangelog[];
  DevelopmentPhase: (DevelopmentPhase & { PhaseTask: PhaseTask[] })[];
};

type Tab = "overview" | "waitlist" | "changelog" | "development";

export function ProductDetailClient({ product: initialProduct }: { product: ProductWithRelations }) {
  const router = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState(initialProduct);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editTagline, setEditTagline] = useState(product.tagline || "");
  const [editDescription, setEditDescription] = useState(product.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // Collapsible phases
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    const result = await fetchDelete(`/api/products/${product.id}`);
    if (result.ok) {
      toast.success("Product deleted");
      router.push("/products");
      router.refresh();
    } else {
      setError(result.error);
      toast.error(result.error);
      setShowDeleteModal(false);
    }
    setIsDeleting(false);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setError(null);
    const result = await fetchPatch<Product>(`/api/products/${product.id}`, {
      name: editName,
      tagline: editTagline || null,
      description: editDescription || null,
    });
    if (result.ok) {
      setProduct({ ...product, ...result.data });
      setIsEditing(false);
      toast.success("Product updated");
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditName(product.name);
    setEditTagline(product.tagline || "");
    setEditDescription(product.description || "");
    setIsEditing(false);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "waitlist", label: "Waitlist", icon: Users, count: product.WaitlistEntry.length },
    { id: "changelog", label: "Changelog", icon: FileText, count: product.ProductChangelog.length },
    { id: "development", label: "Development", icon: Layers, count: product.DevelopmentPhase.length },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-medium text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: product.brandColor }}
              />
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  product.isPublic
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {product.isPublic ? "Public" : "Private"}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-3xl font-bold border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder="Tagline..."
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description..."
                  rows={3}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none dark:bg-slate-700 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{product.name}</h1>
                {product.tagline && (
                  <p className="text-slate-600 dark:text-slate-400 mb-2">{product.tagline}</p>
                )}
                {product.Project && (
                  <Link
                    href={`/projects/${product.Project.id}`}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Linked to: {product.Project.title}
                  </Link>
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                title="Edit"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeTab === tab.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <OverviewTab product={product} />
          )}
          {activeTab === "waitlist" && (
            <WaitlistTab entries={product.WaitlistEntry} />
          )}
          {activeTab === "changelog" && (
            <ChangelogTab entries={product.ProductChangelog} />
          )}
          {activeTab === "development" && (
            <DevelopmentTab
              productId={product.id}
              phases={product.DevelopmentPhase}
              expandedPhases={expandedPhases}
              togglePhase={togglePhase}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title={`Delete "${product.name}"?`}
          message="This action cannot be undone. All associated waitlist entries, changelogs, and development phases will be permanently deleted."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

/* ───── Overview Tab ───── */
function OverviewTab({ product }: { product: ProductWithRelations }) {
  const stats = [
    { label: "Page Views", value: product.publicPageViews, icon: Eye },
    { label: "Waitlist", value: product.WaitlistEntry.length, icon: Users },
    { label: "Changelog Entries", value: product.ProductChangelog.length, icon: FileText },
    { label: "Dev Phases", value: product.DevelopmentPhase.length, icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Description */}
      {product.description && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center"
            >
              <Icon className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Linked Project */}
      {product.Project && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Linked Project
          </h3>
          <Link
            href={`/projects/${product.Project.id}`}
            className="inline-flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{product.Project.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{product.Project.status}</div>
            </div>
          </Link>
        </div>
      )}

      {/* Visibility Settings */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Visibility Settings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Public Page", value: product.isPublic },
            { label: "Show Progress", value: product.showProgress },
            { label: "Show Phases", value: product.showPhases },
            { label: "Show Tasks", value: product.showTasks },
            { label: "Show Changelog", value: product.showChangelog },
          ].map((setting) => (
            <div
              key={setting.label}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
            >
              <span className={`w-2 h-2 rounded-full ${setting.value ? "bg-green-500" : "bg-slate-300"}`} />
              {setting.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── Waitlist Tab ───── */
function WaitlistTab({ entries }: { entries: WaitlistEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No waitlist entries</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Waitlist entries will appear here when users sign up on your public page.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email
            </th>
            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="pb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Message
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="py-3 text-sm text-slate-900 dark:text-white">{entry.email}</td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    entry.status === "CONVERTED"
                      ? "bg-green-100 text-green-700"
                      : entry.status === "INVITED"
                      ? "bg-blue-100 text-blue-700"
                      : entry.status === "ARCHIVED"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {entry.status}
                </span>
              </td>
              <td className="py-3 text-sm text-slate-600 dark:text-slate-400">
                {entry.message || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───── Changelog Tab ───── */
function ChangelogTab({ entries }: { entries: ProductChangelog[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No changelog entries</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Add changelog entries to keep your users informed about updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
              v{entry.version}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                entry.type === "RELEASE"
                  ? "bg-green-100 text-green-700"
                  : entry.type === "HOTFIX"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {entry.type}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
              {new Date(entry.releasedAt).toLocaleDateString()}
            </span>
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{entry.title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{entry.content}</p>
        </div>
      ))}
    </div>
  );
}

/* ───── Development Tab ───── */
function DevelopmentTab({
  productId,
  phases,
  expandedPhases,
  togglePhase,
}: {
  productId: string;
  phases: (DevelopmentPhase & { PhaseTask: PhaseTask[] })[];
  expandedPhases: Set<string>;
  togglePhase: (id: string) => void;
}) {
  if (phases.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No development phases</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Development phases will appear here when added to this product.
        </p>
        <Link
          href={`/products/${productId}/settings`}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Add first phase
        </Link>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "BLOCKED": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-3">
      {phases.map((phase) => {
        const isExpanded = expandedPhases.has(phase.id);
        return (
          <div
            key={phase.id}
            className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => togglePhase(phase.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span className="font-semibold text-slate-900 dark:text-white">{phase.name}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor(phase.status)}`}>
                  {phase.status.replace("_", " ")}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {phase.PhaseTask.length} tasks
              </span>
            </button>

            {isExpanded && phase.PhaseTask.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2">
                {phase.PhaseTask.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-1">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.status === "DONE"
                          ? "bg-green-500"
                          : task.status === "IN_PROGRESS"
                          ? "bg-blue-500"
                          : "bg-slate-300"
                      }`}
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{task.title}</span>
                    {task.status && (
                      <span className="text-xs text-slate-400 ml-auto">{task.status.replace("_", " ")}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
